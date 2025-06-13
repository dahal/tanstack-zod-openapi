import type { z } from 'zod';

// Internal Zod type definitions for better type safety
export interface ZodStringDef {
  typeName: 'ZodString';
  checks: Array<{
    kind: 'min' | 'max' | 'email' | 'url' | 'uuid' | 'regex';
    value?: number;
    regex?: RegExp;
  }>;
}

export interface ZodNumberDef {
  typeName: 'ZodNumber';
  checks: Array<{
    kind: 'min' | 'max' | 'int' | 'multipleOf';
    value?: number;
    inclusive?: boolean;
  }>;
}

export interface ZodBigIntDef {
  typeName: 'ZodBigInt';
}

export interface ZodBooleanDef {
  typeName: 'ZodBoolean';
}

export interface ZodDateDef {
  typeName: 'ZodDate';
}

export interface ZodArrayDef {
  typeName: 'ZodArray';
  type: z.ZodSchema;
  minLength: { value: number } | null;
  maxLength: { value: number } | null;
}

export interface ZodObjectDef {
  typeName: 'ZodObject';
  shape: () => Record<string, z.ZodSchema>;
}

export interface ZodUnionDef {
  typeName: 'ZodUnion';
  options: z.ZodSchema[];
}

export interface ZodIntersectionDef {
  typeName: 'ZodIntersection';
  left: z.ZodSchema;
  right: z.ZodSchema;
}

export interface ZodEnumDef {
  typeName: 'ZodEnum';
  values: string[];
}

export interface ZodNativeEnumDef {
  typeName: 'ZodNativeEnum';
  values: Record<string, string | number>;
}

export interface ZodLiteralDef {
  typeName: 'ZodLiteral';
  value: string | number | boolean;
}

export interface ZodOptionalDef {
  typeName: 'ZodOptional';
  innerType: z.ZodSchema;
}

export interface ZodNullableDef {
  typeName: 'ZodNullable';
  innerType: z.ZodSchema;
}

export interface ZodDefaultDef {
  typeName: 'ZodDefault';
  innerType: z.ZodSchema;
  defaultValue: () => unknown;
}

export interface ZodRecordDef {
  typeName: 'ZodRecord';
  valueType?: z.ZodSchema;
}

export interface ZodMapDef {
  typeName: 'ZodMap';
  valueType?: z.ZodSchema;
}

export interface ZodSetDef {
  typeName: 'ZodSet';
  valueType: z.ZodSchema;
}

export interface ZodTupleDef {
  typeName: 'ZodTuple';
  items: z.ZodSchema[];
}

export interface ZodAnyDef {
  typeName: 'ZodAny';
}

export interface ZodUnknownDef {
  typeName: 'ZodUnknown';
}

export interface ZodVoidDef {
  typeName: 'ZodVoid';
}

export interface ZodNeverDef {
  typeName: 'ZodNever';
}

export type ZodTypeDef =
  | ZodStringDef
  | ZodNumberDef
  | ZodBigIntDef
  | ZodBooleanDef
  | ZodDateDef
  | ZodArrayDef
  | ZodObjectDef
  | ZodUnionDef
  | ZodIntersectionDef
  | ZodEnumDef
  | ZodNativeEnumDef
  | ZodLiteralDef
  | ZodOptionalDef
  | ZodNullableDef
  | ZodDefaultDef
  | ZodRecordDef
  | ZodMapDef
  | ZodSetDef
  | ZodTupleDef
  | ZodAnyDef
  | ZodUnknownDef
  | ZodVoidDef
  | ZodNeverDef;

export function getZodDef(schema: z.ZodSchema): ZodTypeDef {
  return (schema as any)._def;
}
