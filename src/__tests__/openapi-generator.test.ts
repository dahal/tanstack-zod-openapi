import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { clearRegistry, createOpenAPIRoute, getRegistry } from '../core/route';
import type { OpenAPIRouteRegistry } from '../types';
import { OpenAPIGenerator } from '../utils/openapi-generator';

describe('OpenAPIGenerator', () => {
  let generator: OpenAPIGenerator;
  let registry: OpenAPIRouteRegistry;

  beforeEach(() => {
    clearRegistry();
    registry = getRegistry();
    generator = new OpenAPIGenerator(registry);
  });

  it('should generate basic OpenAPI spec', () => {
    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'A test API',
      },
    });

    expect(spec).toEqual({
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'A test API',
      },
      paths: {},
    });
  });

  it('should generate OpenAPI spec with servers', () => {
    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://api.test.com',
          description: 'Production server',
        },
      ],
    });

    expect(spec.servers).toEqual([
      {
        url: 'https://api.test.com',
        description: 'Production server',
      },
    ]);
  });

  it('should generate paths from registered routes', () => {
    createOpenAPIRoute('/api/users')({
      summary: 'Get users',
      description: 'Retrieve all users',
      tags: ['Users'],
      GET: {
        schema: {
          response: z.object({
            users: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
          }),
        },
        handler: async () => ({ users: [] }),
      },
    });

    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    expect(spec.paths['/api/users']).toBeDefined();
    expect(spec.paths['/api/users'].get).toBeDefined();
    expect(spec.paths['/api/users'].get.summary).toBe('Get users');
    expect(spec.paths['/api/users'].get.description).toBe('Retrieve all users');
    expect(spec.paths['/api/users'].get.tags).toEqual(['Users']);
  });

  it('should generate parameters from schema', () => {
    createOpenAPIRoute('/api/users/:id')({
      summary: 'Get user by ID',
      GET: {
        schema: {
          params: z.object({
            id: z.string().uuid(),
          }),
          query: z.object({
            include: z.enum(['profile', 'settings']).optional(),
          }),
          headers: z.object({
            'x-api-key': z.string(),
          }),
          response: z.object({
            id: z.string(),
            name: z.string(),
          }),
        },
        handler: async ({ params }) => ({
          id: params.id,
          name: 'John Doe',
        }),
      },
    });

    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    const operation = spec.paths['/api/users/:id'].get;
    expect(operation.parameters).toHaveLength(3);

    const paramParam = operation.parameters.find((p: any) => p.in === 'path');
    expect(paramParam).toEqual({
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    });

    const queryParam = operation.parameters.find((p: any) => p.in === 'query');
    expect(queryParam).toEqual({
      name: 'include',
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['profile', 'settings'] },
    });

    const headerParam = operation.parameters.find(
      (p: any) => p.in === 'header'
    );
    expect(headerParam).toEqual({
      name: 'x-api-key',
      in: 'header',
      required: true,
      schema: { type: 'string' },
    });
  });

  it('should generate request body for POST/PUT/PATCH', () => {
    createOpenAPIRoute('/api/users')({
      summary: 'Create user',
      POST: {
        schema: {
          body: z.object({
            name: z.string(),
            email: z.string().email(),
          }),
          response: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
          }),
        },
        handler: async ({ body }) => ({
          id: '1',
          name: body.name,
          email: body.email,
        }),
      },
    });

    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    const operation = spec.paths['/api/users'].post;
    expect(operation.requestBody).toEqual({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name', 'email'],
          },
        },
      },
    });
  });

  it('should generate responses', () => {
    createOpenAPIRoute('/api/users')({
      summary: 'Get users',
      GET: {
        schema: {
          response: z.object({
            users: z.array(z.string()),
          }),
        },
        handler: async () => ({ users: [] }),
      },
    });

    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    const operation = spec.paths['/api/users'].get;
    expect(operation.responses).toEqual({
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['users'],
            },
          },
        },
      },
      '400': {
        description: 'Bad Request',
      },
      '500': {
        description: 'Internal Server Error',
      },
    });
  });

  it('should generate JSON format', () => {
    createOpenAPIRoute('/api/test')({
      GET: {
        schema: { response: z.string() },
        handler: async () => 'test',
      },
    });

    const json = generator.generateJSON({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.openapi).toBe('3.1.0');
    expect(parsed.info.title).toBe('Test API');
  });

  it('should generate YAML format', () => {
    createOpenAPIRoute('/api/test')({
      GET: {
        schema: { response: z.string() },
        handler: async () => 'test',
      },
    });

    const yaml = generator.generateYAML({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    expect(yaml).toContain('openapi: 3.1.0');
    expect(yaml).toContain('title: Test API');
    expect(yaml).toContain('version: 1.0.0');
  });

  it('should generate components when schemas exist', () => {
    createOpenAPIRoute('/api/users')({
      GET: {
        schema: {
          response: z.object({ name: z.string() }),
        },
        handler: async () => ({ name: 'test' }),
      },
    });

    const spec = generator.generateOpenAPISpec({
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
    });

    expect(spec.components).toBeDefined();
    expect(spec.components?.schemas).toBeDefined();
    expect(spec.components?.schemas['/api/users_response']).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    });
  });
});
