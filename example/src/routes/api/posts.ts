import { z } from 'zod';
import { createOpenAPIRoute } from 'tanstack-zod-openapi';
import {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostListQuerySchema,
  PostListResponseSchema,
  CommentSchema,
  CreateCommentSchema,
  CommentListResponseSchema,
} from '../../schemas/post';

// Get all posts
export const getPostsRoute = createOpenAPIRoute('/api/posts')({
  summary: 'Get Posts',
  description: 'Retrieve a paginated list of posts with optional filtering',
  tags: ['Posts'],
  operationId: 'getPosts',
  GET: {
    schema: {
      query: PostListQuerySchema,
      response: PostListResponseSchema,
    },
    handler: async ({ query }) => {
      // Mock posts data
      const mockPosts = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Getting Started with TanStack Router',
          content: 'This is a comprehensive guide to using TanStack Router...',
          authorId: '123e4567-e89b-12d3-a456-426614174000',
          published: true,
          tags: ['tutorial', 'react', 'router'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Advanced Zod Patterns',
          content: 'Learn advanced validation patterns with Zod...',
          authorId: '123e4567-e89b-12d3-a456-426614174001',
          published: true,
          tags: ['zod', 'validation', 'typescript'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return {
        posts: mockPosts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: mockPosts.length,
          totalPages: Math.ceil(mockPosts.length / query.limit),
        },
      };
    },
  },
});

// Create a new post
export const createPostRoute = createOpenAPIRoute('/api/posts')({
  summary: 'Create Post',
  description: 'Create a new blog post',
  tags: ['Posts'],
  operationId: 'createPost',
  POST: {
    schema: {
      body: CreatePostSchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: PostSchema,
    },
    handler: async ({ body, headers }) => {
      // Mock post creation
      return {
        id: '123e4567-e89b-12d3-a456-426614174002',
        title: body.title,
        content: body.content,
        authorId: '123e4567-e89b-12d3-a456-426614174000', // From auth
        published: body.published,
        tags: body.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
});

// Get post by ID
export const getPostByIdRoute = createOpenAPIRoute('/api/posts/:id')({
  summary: 'Get Post by ID',
  description: 'Retrieve a specific post by its ID',
  tags: ['Posts'],
  operationId: 'getPostById',
  GET: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      response: PostSchema,
    },
    handler: async ({ params }) => {
      // Mock post retrieval
      return {
        id: params.id,
        title: 'Getting Started with TanStack Router',
        content: 'This is a comprehensive guide to using TanStack Router...',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        published: true,
        tags: ['tutorial', 'react', 'router'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
});

// Update post
export const updatePostRoute = createOpenAPIRoute('/api/posts/:id')({
  summary: 'Update Post',
  description: 'Update an existing post',
  tags: ['Posts'],
  operationId: 'updatePost',
  PUT: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: UpdatePostSchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: PostSchema,
    },
    handler: async ({ params, body, headers }) => {
      // Mock post update
      return {
        id: params.id,
        title: body.title || 'Updated Post Title',
        content: body.content || 'Updated content...',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        published: body.published ?? true,
        tags: body.tags || [],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
      };
    },
  },
});

// Delete post
export const deletePostRoute = createOpenAPIRoute('/api/posts/:id')({
  summary: 'Delete Post',
  description: 'Delete a blog post',
  tags: ['Posts'],
  operationId: 'deletePost',
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
      // Mock post deletion
      return {
        message: 'Post successfully deleted',
        deletedId: params.id,
      };
    },
  },
});

// Get comments for a post
export const getPostCommentsRoute = createOpenAPIRoute('/api/posts/:id/comments')({
  summary: 'Get Post Comments',
  description: 'Retrieve all comments for a specific post',
  tags: ['Comments'],
  operationId: 'getPostComments',
  GET: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      query: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      response: CommentListResponseSchema,
    },
    handler: async ({ params, query }) => {
      // Mock comments data
      const mockComments = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Great post! Very helpful.',
          authorId: '123e4567-e89b-12d3-a456-426614174001',
          postId: params.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return {
        comments: mockComments,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: mockComments.length,
          totalPages: Math.ceil(mockComments.length / query.limit),
        },
      };
    },
  },
});

// Create a comment on a post
export const createPostCommentRoute = createOpenAPIRoute('/api/posts/:id/comments')({
  summary: 'Create Post Comment',
  description: 'Add a new comment to a post',
  tags: ['Comments'],
  operationId: 'createPostComment',
  POST: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: CreateCommentSchema,
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: CommentSchema,
    },
    handler: async ({ params, body, headers }) => {
      // Mock comment creation
      return {
        id: '123e4567-e89b-12d3-a456-426614174001',
        content: body.content,
        authorId: '123e4567-e89b-12d3-a456-426614174000', // From auth
        postId: params.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
});