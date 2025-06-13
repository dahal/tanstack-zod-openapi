import { z } from 'zod';
import { createOpenAPIRoute } from 'tanstack-zod-openapi';
import { AuthRequestSchema, AuthResponseSchema, UserSchema } from '../../schemas/user';

// Login endpoint
export const loginRoute = createOpenAPIRoute('/api/auth/login')({
  summary: 'User Login',
  description: 'Authenticate user with email and password',
  tags: ['Authentication'],
  operationId: 'loginUser',
  POST: {
    schema: {
      body: AuthRequestSchema,
      response: AuthResponseSchema,
    },
    handler: async ({ body }) => {
      // Mock authentication logic
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: body.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };
    },
  },
});

// Logout endpoint
export const logoutRoute = createOpenAPIRoute('/api/auth/logout')({
  summary: 'User Logout',
  description: 'Logout user and invalidate token',
  tags: ['Authentication'],
  operationId: 'logoutUser',
  POST: {
    schema: {
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: z.object({
        message: z.string(),
      }),
    },
    handler: async ({ headers }) => {
      // Mock logout logic
      return {
        message: 'Successfully logged out',
      };
    },
  },
});

// Get current user endpoint
export const getCurrentUserRoute = createOpenAPIRoute('/api/auth/me')({
  summary: 'Get Current User',
  description: 'Get the currently authenticated user information',
  tags: ['Authentication'],
  operationId: 'getCurrentUser',
  GET: {
    schema: {
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: UserSchema,
    },
    handler: async ({ headers }) => {
      // Mock current user logic
      return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
});

// Refresh token endpoint
export const refreshTokenRoute = createOpenAPIRoute('/api/auth/refresh')({
  summary: 'Refresh Token',
  description: 'Refresh the authentication token using refresh token',
  tags: ['Authentication'],
  operationId: 'refreshToken',
  POST: {
    schema: {
      body: z.object({
        refreshToken: z.string(),
      }),
      response: z.object({
        token: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(),
      }),
    },
    handler: async ({ body }) => {
      // Mock token refresh logic
      return {
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token',
        expiresIn: 3600,
      };
    },
  },
});