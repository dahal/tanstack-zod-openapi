import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  authorId: z.string().uuid(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const PostListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  authorId: z.string().uuid().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const PostListResponseSchema = z.object({
  posts: z.array(PostSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(500),
  authorId: z.string().uuid(),
  postId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const CommentListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type PostListQuery = z.infer<typeof PostListQuerySchema>;
export type PostListResponse = z.infer<typeof PostListResponseSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;