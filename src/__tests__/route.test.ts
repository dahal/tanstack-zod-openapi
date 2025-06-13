import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { clearRegistry, createOpenAPIRoute, getRegistry } from '../core/route';

describe('createOpenAPIRoute', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('should register a route with basic configuration', () => {
    const route = createOpenAPIRoute('/api/users')({
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

    expect(route).toBeDefined();
    expect(route.summary).toBe('Get users');
    expect(route.description).toBe('Retrieve all users');
    expect(route.tags).toEqual(['Users']);
    expect(route.GET).toBeDefined();
  });

  it('should register route in global registry', () => {
    createOpenAPIRoute('/api/users')({
      summary: 'Get users',
      GET: {
        schema: {
          response: z.object({ users: z.array(z.string()) }),
        },
        handler: async () => ({ users: [] }),
      },
    });

    const registry = getRegistry();
    expect(registry.routes.has('/api/users')).toBe(true);
    expect(registry.routes.get('/api/users')?.summary).toBe('Get users');
  });

  it('should register schemas in registry', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    });

    const CreateUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    createOpenAPIRoute('/api/users')({
      summary: 'User operations',
      POST: {
        schema: {
          body: CreateUserSchema,
          response: UserSchema,
        },
        handler: async ({ body }) => ({
          id: '1',
          name: body.name,
          email: body.email,
        }),
      },
    });

    const registry = getRegistry();
    expect(registry.schemas.has('/api/users_body')).toBe(true);
    expect(registry.schemas.has('/api/users_response')).toBe(true);
  });

  it('should support multiple HTTP methods', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    createOpenAPIRoute('/api/users/:id')({
      summary: 'User CRUD operations',
      tags: ['Users'],
      GET: {
        schema: {
          params: z.object({ id: z.string() }),
          response: UserSchema,
        },
        handler: async ({ params }) => ({
          id: params.id,
          name: 'John Doe',
        }),
      },
      PUT: {
        schema: {
          params: z.object({ id: z.string() }),
          body: z.object({ name: z.string() }),
          response: UserSchema,
        },
        handler: async ({ params, body }) => ({
          id: params.id,
          name: body.name,
        }),
      },
      DELETE: {
        schema: {
          params: z.object({ id: z.string() }),
          response: z.object({ success: z.boolean() }),
        },
        handler: async () => ({ success: true }),
      },
    });

    const registry = getRegistry();
    const route = registry.routes.get('/api/users/:id');
    expect(route?.GET).toBeDefined();
    expect(route?.PUT).toBeDefined();
    expect(route?.DELETE).toBeDefined();
  });

  it('should warn when overwriting existing route', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createOpenAPIRoute('/api/test')({
      GET: {
        schema: { response: z.string() },
        handler: async () => 'first',
      },
    });

    createOpenAPIRoute('/api/test')({
      GET: {
        schema: { response: z.string() },
        handler: async () => 'second',
      },
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Route /api/test already exists and will be overwritten'
    );

    consoleSpy.mockRestore();
  });

  it('should handle query parameters and headers', () => {
    createOpenAPIRoute('/api/search')({
      summary: 'Search with filters',
      GET: {
        schema: {
          query: z.object({
            q: z.string(),
            page: z.number().int().min(1).default(1),
            limit: z.number().int().min(1).max(100).default(10),
          }),
          headers: z.object({
            'x-api-key': z.string(),
          }),
          response: z.object({
            items: z.array(z.string()),
            total: z.number(),
          }),
        },
        handler: async ({ query }) => ({
          items: [],
          total: 0,
        }),
      },
    });

    const registry = getRegistry();
    expect(registry.schemas.has('/api/search_query')).toBe(true);
    expect(registry.schemas.has('/api/search_headers')).toBe(true);
    expect(registry.schemas.has('/api/search_response')).toBe(true);
  });
});
