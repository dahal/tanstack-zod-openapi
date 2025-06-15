import { z } from 'zod';
import { createOpenAPIRoute } from './src/index';

// Test route to reproduce the issue
export const verifyApiKeyRoute = createOpenAPIRoute('/api/api_key/:key')({
  GET: {
    schema: {
      params: z.object({
        key: z.string(),
      }),
      query: z.object({
        validate: z.boolean().optional(),
      }),
      headers: z.object({
        'x-client-id': z.string(),
      }),
      response: z.object({
        valid: z.boolean(),
        message: z.string(),
      }),
    },
    handler: async ({ query, headers, params }) => {
      // The issue: params, query, headers are typed as 'never'
      console.log('Params:', params.key); // TypeScript error here
      console.log('Query:', query.validate);
      console.log('Headers:', headers['x-client-id']);
      
      return {
        valid: true,
        message: 'API key is valid',
      };
    },
  },
});