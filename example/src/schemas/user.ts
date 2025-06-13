import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
  isActive: z.boolean().optional(),
});

export const UserListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
  isActive: z.boolean().optional(),
});

export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;