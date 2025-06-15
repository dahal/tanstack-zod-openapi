import type { z } from 'zod';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<
    string,
    {
      enum?: string[];
      default: string;
      description?: string;
    }
  >;
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: {
    description?: string;
    url: string;
  };
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: Record<string, any>;
  openIdConnectUrl?: string;
}

export interface OpenAPISchema {
  openapi: '3.1.0';
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
    examples?: Record<string, any>;
    requestBodies?: Record<string, any>;
    headers?: Record<string, any>;
    securitySchemes?: Record<string, OpenAPISecurityScheme>;
    links?: Record<string, any>;
    callbacks?: Record<string, any>;
  };
  security?: Record<string, any>[];
  tags?: OpenAPITag[];
  externalDocs?: {
    description?: string;
    url: string;
  };
}

export interface RouteSchema {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  headers?: z.ZodSchema;
  response?: z.ZodSchema;
}

export interface RouteHandler<T extends RouteSchema = RouteSchema> {
  schema: T;
  handler: (context: {
    request: Request;
    body: T['body'] extends z.ZodSchema ? z.infer<T['body']> : undefined;
    query: T['query'] extends z.ZodSchema ? z.infer<T['query']> : undefined;
    params: T['params'] extends z.ZodSchema ? z.infer<T['params']> : undefined;
    headers: T['headers'] extends z.ZodSchema
      ? z.infer<T['headers']>
      : undefined;
  }) => Promise<
    T['response'] extends z.ZodSchema ? z.infer<T['response']> : any
  >;
}

export interface OpenAPIRouteConfig {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  deprecated?: boolean;
  security?: Record<string, any>[];
  externalDocs?: {
    description?: string;
    url: string;
  };
}

export type OpenAPIRouteDefinition = OpenAPIRouteConfig & {
  [K in HttpMethod]?: RouteHandler;
};

export interface APIConfig {
  tagOrder?: string[];
  crudOrder?: Record<string, number>;
  httpMethodOrder?: Record<HttpMethod, number>;
  options?: {
    includeTimestamp?: boolean;
    includeWarning?: boolean;
    groupByTag?: boolean;
    subgroupByCrud?: boolean;
    includeMethodComments?: boolean;
    includePathComments?: boolean;
    detectDuplicates?: boolean;
    warnMissingTags?: boolean;
    uncategorizedLast?: boolean;
    uncategorizedTagName?: string;
  };
  pathPatterns?: {
    singleResource?: string[];
    nestedResource?: string[];
    action?: string[];
  };
  excludePatterns?: string[];
}

export interface OpenAPIRouteRegistry {
  routes: Map<string, OpenAPIRouteDefinition>;
  schemas: Map<string, z.ZodSchema>;
  config?: APIConfig;
}
