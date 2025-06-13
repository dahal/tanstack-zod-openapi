import type { z } from 'zod';
import { type ZodTypeDef, getZodDef } from '../types/zod-internal';

export interface OpenAPISchemaObject {
  type?: string;
  format?: string;
  enum?: (string | number | boolean)[];
  items?: OpenAPISchemaObject;
  properties?: Record<string, OpenAPISchemaObject>;
  required?: string[];
  additionalProperties?: boolean | OpenAPISchemaObject;
  oneOf?: OpenAPISchemaObject[];
  allOf?: OpenAPISchemaObject[];
  nullable?: boolean;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  not?: OpenAPISchemaObject;
}

export function zodToOpenAPISchema(schema: z.ZodSchema): OpenAPISchemaObject {
  const zodType = getZodDef(schema);

  switch (zodType.typeName) {
    case 'ZodString':
      return {
        type: 'string',
        ...getStringConstraints(zodType),
      };

    case 'ZodNumber':
      return {
        type: 'number',
        ...getNumberConstraints(zodType),
      };

    case 'ZodBigInt':
      return {
        type: 'integer',
        format: 'int64',
      };

    case 'ZodBoolean':
      return {
        type: 'boolean',
      };

    case 'ZodDate':
      return {
        type: 'string',
        format: 'date-time',
      };

    case 'ZodArray':
      if (zodType.typeName === 'ZodArray') {
        return {
          type: 'array',
          items: zodToOpenAPISchema(zodType.type),
          ...getArrayConstraints(zodType),
        };
      }
      return {};

    case 'ZodObject': {
      const properties: Record<string, OpenAPISchemaObject> = {};
      const required: string[] = [];

      if (zodType.typeName === 'ZodObject') {
        for (const [key, value] of Object.entries(zodType.shape())) {
          properties[key] = zodToOpenAPISchema(value as z.ZodSchema);
          if (!isOptional(value as z.ZodSchema)) {
            required.push(key);
          }
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length > 0 && { required }),
      };
    }

    case 'ZodUnion':
      if (zodType.typeName === 'ZodUnion') {
        return {
          oneOf: zodType.options.map((option: z.ZodSchema) =>
            zodToOpenAPISchema(option)
          ),
        };
      }
      return {};

    case 'ZodIntersection':
      if (zodType.typeName === 'ZodIntersection') {
        return {
          allOf: [
            zodToOpenAPISchema(zodType.left),
            zodToOpenAPISchema(zodType.right),
          ],
        };
      }
      return {};

    case 'ZodEnum':
      if (zodType.typeName === 'ZodEnum') {
        return {
          type: 'string',
          enum: zodType.values,
        };
      }
      return {};

    case 'ZodNativeEnum':
      if (zodType.typeName === 'ZodNativeEnum') {
        const enumValues = Object.values(zodType.values);
        return {
          type: typeof enumValues[0] === 'string' ? 'string' : 'number',
          enum: enumValues,
        };
      }
      return {};

    case 'ZodLiteral':
      if (zodType.typeName === 'ZodLiteral') {
        return {
          type: typeof zodType.value as 'string' | 'number' | 'boolean',
          enum: [zodType.value],
        };
      }
      return {};

    case 'ZodOptional':
      if (zodType.typeName === 'ZodOptional') {
        return zodToOpenAPISchema(zodType.innerType);
      }
      return {};

    case 'ZodNullable':
      if (zodType.typeName === 'ZodNullable') {
        const baseSchema = zodToOpenAPISchema(zodType.innerType);
        return {
          ...baseSchema,
          nullable: true,
        };
      }
      return {};

    case 'ZodDefault':
      if (zodType.typeName === 'ZodDefault') {
        const defaultSchema = zodToOpenAPISchema(zodType.innerType);
        return {
          ...defaultSchema,
          default: zodType.defaultValue(),
        };
      }
      return {};

    case 'ZodRecord':
      if (zodType.typeName === 'ZodRecord') {
        return {
          type: 'object',
          additionalProperties: zodType.valueType
            ? zodToOpenAPISchema(zodType.valueType)
            : true,
        };
      }
      return {};

    case 'ZodMap':
      if (zodType.typeName === 'ZodMap') {
        return {
          type: 'object',
          additionalProperties: zodType.valueType
            ? zodToOpenAPISchema(zodType.valueType)
            : true,
        };
      }
      return {};

    case 'ZodSet':
      if (zodType.typeName === 'ZodSet') {
        return {
          type: 'array',
          items: zodToOpenAPISchema(zodType.valueType),
          uniqueItems: true,
        };
      }
      return {};

    case 'ZodTuple':
      if (zodType.typeName === 'ZodTuple') {
        return {
          type: 'array',
          items: {
            oneOf: zodType.items.map((item: z.ZodSchema) =>
              zodToOpenAPISchema(item)
            ),
          },
          minItems: zodType.items.length,
          maxItems: zodType.items.length,
        };
      }
      return {};

    case 'ZodAny':
    case 'ZodUnknown':
      return {};

    case 'ZodVoid':
    case 'ZodNever':
      return {
        not: {},
      };

    default:
      console.warn(`Unsupported Zod type: ${(zodType as any).typeName}`);
      return {};
  }
}

function getStringConstraints(
  zodType: ZodTypeDef
): Partial<OpenAPISchemaObject> {
  const constraints: Partial<OpenAPISchemaObject> = {};

  if (zodType.typeName === 'ZodString' && zodType.checks) {
    for (const check of zodType.checks) {
      switch (check.kind) {
        case 'min':
          if (check.value !== undefined) constraints.minLength = check.value;
          break;
        case 'max':
          if (check.value !== undefined) constraints.maxLength = check.value;
          break;
        case 'email':
          constraints.format = 'email';
          break;
        case 'url':
          constraints.format = 'uri';
          break;
        case 'uuid':
          constraints.format = 'uuid';
          break;
        case 'regex':
          if (check.regex) constraints.pattern = check.regex.source;
          break;
      }
    }
  }

  return constraints;
}

function getNumberConstraints(
  zodType: ZodTypeDef
): Partial<OpenAPISchemaObject> {
  const constraints: Partial<OpenAPISchemaObject> = {};

  if (zodType.typeName === 'ZodNumber' && zodType.checks) {
    for (const check of zodType.checks) {
      switch (check.kind) {
        case 'min':
          if (check.value !== undefined) {
            constraints.minimum = check.value;
            if (check.inclusive === false) {
              constraints.exclusiveMinimum = true;
            }
          }
          break;
        case 'max':
          if (check.value !== undefined) {
            constraints.maximum = check.value;
            if (check.inclusive === false) {
              constraints.exclusiveMaximum = true;
            }
          }
          break;
        case 'int':
          constraints.type = 'integer';
          break;
        case 'multipleOf':
          if (check.value !== undefined) constraints.multipleOf = check.value;
          break;
      }
    }
  }

  return constraints;
}

function getArrayConstraints(
  zodType: ZodTypeDef
): Partial<OpenAPISchemaObject> {
  const constraints: Partial<OpenAPISchemaObject> = {};

  if (zodType.typeName === 'ZodArray') {
    if (zodType.minLength !== null) {
      constraints.minItems = zodType.minLength.value;
    }

    if (zodType.maxLength !== null) {
      constraints.maxItems = zodType.maxLength.value;
    }
  }

  return constraints;
}

function isOptional(schema: z.ZodSchema): boolean {
  const def = getZodDef(schema);

  if (def.typeName === 'ZodOptional' || def.typeName === 'ZodDefault') {
    return true;
  }

  if (def.typeName === 'ZodNullable') {
    return isOptional(def.innerType);
  }

  return false;
}
