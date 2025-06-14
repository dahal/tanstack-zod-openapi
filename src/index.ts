export {
  createOpenAPIRoute,
  getRegistry,
  setRegistry,
  clearRegistry,
} from './core/route';
export { OpenAPIGenerator } from './utils/openapi-generator';
export {
  zodToOpenAPISchema,
  type OpenAPISchemaObject,
} from './utils/zod-to-openapi';
export { loadAPIConfig, getDefaultConfig } from './utils/config-loader';

export type {
  HttpMethod,
  OpenAPIInfo,
  OpenAPIServer,
  OpenAPITag,
  OpenAPISecurityScheme,
  OpenAPISchema,
  RouteSchema,
  RouteHandler,
  OpenAPIRouteConfig,
  OpenAPIRouteDefinition,
  APIConfig,
  OpenAPIRouteRegistry,
} from './types';

// Import the functions we need for generateOpenAPISpec
import { getRegistry } from './core/route';
import { OpenAPIGenerator } from './utils/openapi-generator';
import { loadAPIConfig, getDefaultConfig } from './utils/config-loader';

// Convenience function to generate OpenAPI spec from registry
export function generateOpenAPISpec(options: {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  configPath?: string;
}) {
  const registry = getRegistry();
  const config = loadAPIConfig(options.configPath) || getDefaultConfig();

  registry.config = config;

  const generator = new OpenAPIGenerator(registry);

  return {
    json: () =>
      generator.generateJSON({
        info: options.info,
        servers: options.servers,
      }),
    yaml: () =>
      generator.generateYAML({
        info: options.info,
        servers: options.servers,
      }),
    spec: () =>
      generator.generateOpenAPISpec({
        info: options.info,
        servers: options.servers,
      }),
  };
}
