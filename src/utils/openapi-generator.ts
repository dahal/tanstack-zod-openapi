import * as yaml from 'js-yaml';
import type {
  APIConfig,
  HttpMethod,
  OpenAPIInfo,
  OpenAPIRouteRegistry,
  OpenAPISchema,
  OpenAPIServer,
  OpenAPITag,
} from '../types';
import { type OpenAPISchemaObject, zodToOpenAPISchema } from './zod-to-openapi';

export class OpenAPIGenerator {
  private registry: OpenAPIRouteRegistry;

  constructor(registry: OpenAPIRouteRegistry) {
    this.registry = registry;
  }

  generateOpenAPISpec(options: {
    info: OpenAPIInfo;
    servers?: OpenAPIServer[];
    tags?: OpenAPITag[];
    security?: Record<string, any>[];
  }): OpenAPISchema {
    const { info, servers, tags, security } = options;
    const config = this.registry.config;

    const spec: OpenAPISchema = {
      openapi: '3.1.0',
      info,
      paths: {},
    };

    if (servers) {
      spec.servers = servers;
    }

    if (tags) {
      spec.tags = this.sortTags(tags, config);
    }

    if (security) {
      spec.security = security;
    }

    // Generate paths from registered routes
    const sortedRoutes = this.sortRoutes(
      Array.from(this.registry.routes.entries()),
      config
    );

    for (const [path, definition] of sortedRoutes) {
      spec.paths[path] = this.generatePathItem(path, definition);
    }

    // Generate components if we have schemas
    if (this.registry.schemas.size > 0) {
      spec.components = {
        schemas: this.generateSchemas(),
      };
    }

    return spec;
  }

  generateJSON(
    options: Parameters<OpenAPIGenerator['generateOpenAPISpec']>[0]
  ): string {
    const spec = this.generateOpenAPISpec(options);
    return JSON.stringify(spec, null, 2);
  }

  generateYAML(
    options: Parameters<OpenAPIGenerator['generateOpenAPISpec']>[0]
  ): string {
    const spec = this.generateOpenAPISpec(options);
    return yaml.dump(spec, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      skipInvalid: true,
    });
  }

  private generatePathItem(path: string, definition: any): Record<string, any> {
    const pathItem: Record<string, any> = {};

    const methodOrder = this.registry.config?.httpMethodOrder || {
      GET: 1,
      POST: 2,
      PUT: 3,
      PATCH: 4,
      DELETE: 5,
      HEAD: 6,
      OPTIONS: 7,
    };

    // Sort methods according to config
    const methods = Object.keys(definition)
      .filter((key) => this.isHttpMethod(key))
      .sort(
        (a, b) =>
          (methodOrder[a as HttpMethod] || 999) -
          (methodOrder[b as HttpMethod] || 999)
      );

    for (const method of methods) {
      const methodDef = definition[method];
      if (typeof methodDef === 'object' && 'handler' in methodDef) {
        pathItem[method.toLowerCase()] = this.generateOperation(
          path,
          method as HttpMethod,
          methodDef,
          definition
        );
      }
    }

    return pathItem;
  }

  private generateOperation(
    path: string,
    method: HttpMethod,
    methodDef: any,
    routeConfig: any
  ): Record<string, any> {
    const operation: Record<string, any> = {};

    // Add metadata from route config
    if (routeConfig.summary) operation.summary = routeConfig.summary;
    if (routeConfig.description)
      operation.description = routeConfig.description;
    if (routeConfig.tags) operation.tags = routeConfig.tags;
    if (routeConfig.operationId)
      operation.operationId = routeConfig.operationId;
    if (routeConfig.deprecated) operation.deprecated = routeConfig.deprecated;
    if (routeConfig.security) operation.security = routeConfig.security;
    if (routeConfig.externalDocs)
      operation.externalDocs = routeConfig.externalDocs;

    // Generate parameters from schema
    const parameters: any[] = [];
    const { schema } = methodDef;

    if (schema.params) {
      const paramsSchema = zodToOpenAPISchema(schema.params);
      if (paramsSchema.properties) {
        for (const [name, paramSchema] of Object.entries(
          paramsSchema.properties
        )) {
          parameters.push({
            name,
            in: 'path',
            required: paramsSchema.required?.includes(name) ?? false,
            schema: paramSchema,
          });
        }
      }
    }

    if (schema.query) {
      const querySchema = zodToOpenAPISchema(schema.query);
      if (querySchema.properties) {
        for (const [name, paramSchema] of Object.entries(
          querySchema.properties
        )) {
          parameters.push({
            name,
            in: 'query',
            required: querySchema.required?.includes(name) ?? false,
            schema: paramSchema,
          });
        }
      }
    }

    if (schema.headers) {
      const headersSchema = zodToOpenAPISchema(schema.headers);
      if (headersSchema.properties) {
        for (const [name, headerSchema] of Object.entries(
          headersSchema.properties
        )) {
          parameters.push({
            name,
            in: 'header',
            required: headersSchema.required?.includes(name) ?? false,
            schema: headerSchema,
          });
        }
      }
    }

    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // Generate request body from schema
    if (schema.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: zodToOpenAPISchema(schema.body),
          },
        },
      };
    }

    // Generate responses
    operation.responses = {
      '200': {
        description: 'Successful response',
        ...(schema.response && {
          content: {
            'application/json': {
              schema: zodToOpenAPISchema(schema.response),
            },
          },
        }),
      },
      '400': {
        description: 'Bad Request',
      },
      '500': {
        description: 'Internal Server Error',
      },
    };

    return operation;
  }

  private generateSchemas(): Record<string, OpenAPISchemaObject> {
    const schemas: Record<string, OpenAPISchemaObject> = {};

    for (const [name, schema] of Array.from(this.registry.schemas.entries())) {
      schemas[name] = zodToOpenAPISchema(schema);
    }

    return schemas;
  }

  private sortTags(tags: OpenAPITag[], config?: APIConfig): OpenAPITag[] {
    if (!config?.tagOrder) return tags;

    return tags.sort((a, b) => {
      const aIndex = config.tagOrder?.indexOf(a.name) ?? -1;
      const bIndex = config.tagOrder?.indexOf(b.name) ?? -1;

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }

  private sortRoutes(
    routes: [string, any][],
    config?: APIConfig
  ): [string, any][] {
    if (!config?.options?.groupByTag) return routes;

    return routes.sort(([pathA, defA], [pathB, defB]) => {
      const tagsA = defA.tags || [];
      const tagsB = defB.tags || [];

      if (tagsA.length === 0 && tagsB.length === 0) return 0;
      if (tagsA.length === 0) return config.options?.uncategorizedLast ? 1 : -1;
      if (tagsB.length === 0) return config.options?.uncategorizedLast ? -1 : 1;

      const tagOrderA = config.tagOrder?.indexOf(tagsA[0]) ?? 999;
      const tagOrderB = config.tagOrder?.indexOf(tagsB[0]) ?? 999;

      return tagOrderA - tagOrderB;
    });
  }

  private isHttpMethod(method: string): method is HttpMethod {
    return [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'HEAD',
      'OPTIONS',
    ].includes(method);
  }
}
