import { z } from 'zod';
import { createOpenAPIRoute, getRegistry, clearRegistry } from '../core/route';

describe('Type Safety', () => {
  beforeEach(() => {
    clearRegistry();
  });

  describe('Route Handler Type Inference', () => {
    it('should properly type params from schema', () => {
      const route = createOpenAPIRoute('/api/users/:id')({
        GET: {
          schema: {
            params: z.object({
              id: z.string(),
            }),
          },
          handler: async ({ params }) => {
            // TypeScript should infer params.id as string
            expect(typeof params.id).toBe('string');
            return { user: `User ${params.id}` };
          },
        },
      });

      expect(route).toBeDefined();
    });

    it('should properly type query parameters from schema', () => {
      const route = createOpenAPIRoute('/api/users')({
        GET: {
          schema: {
            query: z.object({
              page: z.number().optional(),
              limit: z.number().default(10),
              search: z.string().optional(),
            }),
          },
          handler: async ({ query }) => {
            // TypeScript should infer proper query types
            if (query.page !== undefined) {
              expect(typeof query.page).toBe('number');
            }
            expect(typeof query.limit).toBe('number');
            if (query.search !== undefined) {
              expect(typeof query.search).toBe('string');
            }
            return { users: [] };
          },
        },
      });

      expect(route).toBeDefined();
    });

    it('should properly type headers from schema', () => {
      const route = createOpenAPIRoute('/api/auth')({
        POST: {
          schema: {
            headers: z.object({
              authorization: z.string(),
              'x-api-key': z.string().optional(),
            }),
          },
          handler: async ({ headers }) => {
            // TypeScript should infer proper header types
            expect(typeof headers.authorization).toBe('string');
            if (headers['x-api-key'] !== undefined) {
              expect(typeof headers['x-api-key']).toBe('string');
            }
            return { authenticated: true };
          },
        },
      });

      expect(route).toBeDefined();
    });

    it('should properly type request body from schema', () => {
      const route = createOpenAPIRoute('/api/users')({
        POST: {
          schema: {
            body: z.object({
              name: z.string(),
              email: z.string().email(),
              age: z.number().optional(),
            }),
          },
          handler: async ({ body }) => {
            // TypeScript should infer proper body types
            expect(typeof body.name).toBe('string');
            expect(typeof body.email).toBe('string');
            if (body.age !== undefined) {
              expect(typeof body.age).toBe('number');
            }
            return { id: '123', ...body };
          },
        },
      });

      expect(route).toBeDefined();
    });

    it('should handle undefined schema properties gracefully', () => {
      const route = createOpenAPIRoute('/api/health')({
        GET: {
          schema: {
            response: z.object({
              status: z.string(),
            }),
          },
          handler: async ({ params, query, headers, body }) => {
            // These should be undefined when no schema is provided
            expect(params).toBeUndefined();
            expect(query).toBeUndefined();
            expect(headers).toBeUndefined();
            expect(body).toBeUndefined();
            return { status: 'ok' };
          },
        },
      });

      expect(route).toBeDefined();
    });

    it('should register schemas correctly in the global registry', () => {
      const paramsSchema = z.object({ id: z.string() });
      const querySchema = z.object({ include: z.string().optional() });
      const responseSchema = z.object({
        user: z.object({ id: z.string(), name: z.string() }),
      });

      createOpenAPIRoute('/api/users/:id')({
        GET: {
          schema: {
            params: paramsSchema,
            query: querySchema,
            response: responseSchema,
          },
          handler: async () => {
            return { user: { id: '1', name: 'John' } };
          },
        },
      });

      const registry = getRegistry();
      expect(registry.schemas.has('/api/users/:id_params')).toBe(true);
      expect(registry.schemas.has('/api/users/:id_query')).toBe(true);
      expect(registry.schemas.has('/api/users/:id_response')).toBe(true);
    });

    it('should support multiple HTTP methods with different schemas', () => {
      const route = createOpenAPIRoute('/api/users/:id')({
        GET: {
          schema: {
            params: z.object({ id: z.string() }),
            response: z.object({
              user: z.object({ id: z.string(), name: z.string() }),
            }),
          },
          handler: async ({ params }) => {
            return { user: { id: params.id, name: 'John' } };
          },
        },
        PUT: {
          schema: {
            params: z.object({ id: z.string() }),
            body: z.object({ name: z.string() }),
            response: z.object({
              user: z.object({ id: z.string(), name: z.string() }),
            }),
          },
          handler: async ({ params, body }) => {
            return { user: { id: params.id, name: body.name } };
          },
        },
      });

      expect(route).toBeDefined();
      expect(route.GET).toBeDefined();
      expect(route.PUT).toBeDefined();
    });

    it('should work with complex nested schemas', () => {
      const route = createOpenAPIRoute('/api/orders')({
        POST: {
          schema: {
            body: z.object({
              items: z.array(
                z.object({
                  productId: z.string(),
                  quantity: z.number(),
                  price: z.number(),
                })
              ),
              shippingAddress: z.object({
                street: z.string(),
                city: z.string(),
                zipCode: z.string(),
                country: z.string(),
              }),
              metadata: z.record(z.string()).optional(),
            }),
            response: z.object({
              orderId: z.string(),
              total: z.number(),
              status: z.enum(['pending', 'confirmed', 'cancelled']),
            }),
          },
          handler: async ({ body }) => {
            // TypeScript should properly infer nested types
            expect(Array.isArray(body.items)).toBe(true);
            expect(typeof body.shippingAddress.street).toBe('string');
            return {
              orderId: 'order-123',
              total: body.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ),
              status: 'pending' as const,
            };
          },
        },
      });

      expect(route).toBeDefined();
    });
  });
});
