import { z } from 'zod';
import { createOpenAPIRoute } from 'tanstack-zod-openapi';

const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number(),
});

// Health check endpoint
export const healthRoute = createOpenAPIRoute('/api/health')({
  summary: 'Health Check',
  description: 'Check the health status of the API',
  tags: ['Health'],
  operationId: 'getHealthStatus',
  GET: {
    schema: {
      response: HealthResponseSchema,
    },
    handler: async () => {
      return {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
      };
    },
  },
});