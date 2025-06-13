import type { OpenAPIRouteDefinition, OpenAPIRouteRegistry } from '../types';

let globalRegistry: OpenAPIRouteRegistry = {
  routes: new Map(),
  schemas: new Map(),
};

export function getRegistry(): OpenAPIRouteRegistry {
  return globalRegistry;
}

export function setRegistry(registry: OpenAPIRouteRegistry): void {
  globalRegistry = registry;
}

export function createOpenAPIRoute(path: string) {
  return function defineRoute(
    definition: OpenAPIRouteDefinition
  ): OpenAPIRouteDefinition {
    if (globalRegistry.routes.has(path)) {
      console.warn(`Route ${path} already exists and will be overwritten`);
    }

    globalRegistry.routes.set(path, definition);

    // Register schemas for later reference
    for (const methodDef of Object.values(definition)) {
      if (typeof methodDef === 'object' && 'schema' in methodDef) {
        const { schema } = methodDef;
        if (schema.body) {
          globalRegistry.schemas.set(`${path}_body`, schema.body);
        }
        if (schema.query) {
          globalRegistry.schemas.set(`${path}_query`, schema.query);
        }
        if (schema.params) {
          globalRegistry.schemas.set(`${path}_params`, schema.params);
        }
        if (schema.headers) {
          globalRegistry.schemas.set(`${path}_headers`, schema.headers);
        }
        if (schema.response) {
          globalRegistry.schemas.set(`${path}_response`, schema.response);
        }
      }
    }

    return definition;
  };
}

export function clearRegistry(): void {
  globalRegistry.routes.clear();
  globalRegistry.schemas.clear();
}
