import { z } from 'zod';
import { createOpenAPIRoute } from 'tanstack-zod-openapi';
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserListQuerySchema,
  UserListResponseSchema,
} from '../../schemas/user';

// Get all users
export const getUsersRoute = createOpenAPIRoute('/api/users')({
  summary: 'Get Users',
  description: 'Retrieve a paginated list of users with optional filtering',
  tags: ['Users'],
  operationId: 'getUsers',
  GET: {
    schema: {
      query: UserListQuerySchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: UserListResponseSchema,
    },
    handler: async ({ query, headers }) => {
      // Mock users data
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'admin' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return {
        users: mockUsers,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: mockUsers.length,
          totalPages: Math.ceil(mockUsers.length / query.limit),
        },
      };
    },
  },
});

// Create a new user
export const createUserRoute = createOpenAPIRoute('/api/users')({
  summary: 'Create User',
  description: 'Create a new user account',
  tags: ['Users'],
  operationId: 'createUser',
  POST: {
    schema: {
      body: CreateUserSchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: UserSchema,
    },
    handler: async ({ body, headers }) => {
      // Mock user creation
      return {
        id: '123e4567-e89b-12d3-a456-426614174002',
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
});

// Get user by ID
export const getUserByIdRoute = createOpenAPIRoute('/api/users/:id')({
  summary: 'Get User by ID',
  description: 'Retrieve a specific user by their ID',
  tags: ['Users'],
  operationId: 'getUserById',
  GET: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: UserSchema,
    },
    handler: async ({ params, headers }) => {
      // Mock user retrieval
      return {
        id: params.id,
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

// Update user
export const updateUserRoute = createOpenAPIRoute('/api/users/:id')({
  summary: 'Update User',
  description: 'Update an existing user',
  tags: ['Users'],
  operationId: 'updateUser',
  PUT: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: UpdateUserSchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: UserSchema,
    },
    handler: async ({ params, body, headers }) => {
      // Mock user update
      return {
        id: params.id,
        email: 'john.doe@example.com',
        firstName: body.firstName || 'John',
        lastName: body.lastName || 'Doe',
        role: body.role || 'user',
        isActive: body.isActive ?? true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
      };
    },
  },
});

// Delete user
export const deleteUserRoute = createOpenAPIRoute('/api/users/:id')({
  summary: 'Delete User',
  description: 'Delete a user account',
  tags: ['Users'],
  operationId: 'deleteUser',
  DELETE: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: z.object({
        message: z.string(),
        deletedId: z.string().uuid(),
      }),
    },
    handler: async ({ params, headers }) => {
      // Mock user deletion
      return {
        message: 'User successfully deleted',
        deletedId: params.id,
      };
    },
  },
});