# tanstack-zod-openapi

OpenAPI integration for TanStack Router with Zod schema validation. Generate comprehensive OpenAPI 3.1 specifications from your TanStack Router routes with automatic type safety.

## Features

- 🚀 **Easy Integration**: Simple API for defining OpenAPI routes
- 🔒 **Type Safety**: Full TypeScript support with Zod schema validation
- 📝 **OpenAPI 3.1**: Generate JSON and YAML specifications
- ⚙️ **Configurable**: Customize output with `api.config.json`
- 🎯 **TanStack Router**: Built specifically for TanStack Router/Start
- 🧪 **Well Tested**: Comprehensive test suite with Vitest
- 📊 **Auto Discovery**: Automatically discovers and registers routes

## Installation

```bash
npm install tanstack-zod-openapi zod @tanstack/router
# or
pnpm add tanstack-zod-openapi zod @tanstack/router  
# or
bun add tanstack-zod-openapi zod @tanstack/router
```

## Quick Start

### 1. Define Your Schemas

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
  createdAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8),
});
```

### 2. Create OpenAPI Routes

```typescript
import { createOpenAPIRoute } from 'tanstack-zod-openapi';
import { UserSchema, CreateUserSchema } from './schemas/user';

// GET /api/users
export const getUsersRoute = createOpenAPIRoute('/api/users')({
  summary: 'Get Users',
  description: 'Retrieve a paginated list of users',
  tags: ['Users'],
  operationId: 'getUsers',
  GET: {
    schema: {
      query: z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+/),
      }),
      response: z.object({
        users: z.array(UserSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
        }),
      }),
    },
    handler: async ({ query, headers }) => {
      // Your handler logic here
      return {
        users: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
        },
      };
    },
  },
});

// POST /api/users
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
      // Your creation logic here
      return {
        id: crypto.randomUUID(),
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'user',
        createdAt: new Date(),
      };
    },
  },
});

// GET /api/users/:id
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
      // Your retrieval logic here
      return {
        id: params.id,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        createdAt: new Date(),
      };
    },
  },
});
```

### 3. Generate OpenAPI Specification

```typescript
import { generateOpenAPISpec } from 'tanstack-zod-openapi';

// Import all your routes to register them
import './routes/api/users';
import './routes/api/posts';
import './routes/api/auth';

const spec = generateOpenAPISpec({
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A sample API built with TanStack Router and Zod',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
});

// Generate JSON
const jsonSpec = spec.json();
console.log(jsonSpec);

// Generate YAML  
const yamlSpec = spec.yaml();
console.log(yamlSpec);

// Get the spec object
const specObject = spec.spec();
```

## Configuration

Create an `api.config.json` file to customize the OpenAPI generation:

```json
{
  "tagOrder": [
    "Health",
    "Authentication",
    "Users", 
    "Posts",
    "Comments"
  ],
  "crudOrder": {
    "POST": 1,
    "GET_LIST": 2,
    "GET_SINGLE": 3,
    "PUT": 4,
    "PATCH": 5,
    "DELETE": 6
  },
  "httpMethodOrder": {
    "POST": 1,
    "GET": 2,
    "PUT": 3,
    "PATCH": 4,
    "DELETE": 5
  },
  "options": {
    "includeTimestamp": true,
    "includeWarning": true,
    "groupByTag": true,
    "subgroupByCrud": true,
    "includeMethodComments": true,
    "includePathComments": true,
    "detectDuplicates": true,
    "warnMissingTags": true,
    "uncategorizedLast": true,
    "uncategorizedTagName": "Uncategorized"
  },
  "pathPatterns": {
    "singleResource": ["$id", "{id}", ":id"],
    "nestedResource": ["$", "{", ":"],
    "action": [".", "/"]
  },
  "excludePatterns": [
    "**/test/**",
    "**/mock/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

## Advanced Usage

### Multiple HTTP Methods

```typescript
export const userCrudRoute = createOpenAPIRoute('/api/users/:id')({
  summary: 'User CRUD Operations',
  description: 'Complete CRUD operations for users',
  tags: ['Users'],
  
  GET: {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      response: UserSchema,
    },
    handler: async ({ params }) => {
      // Get user logic
    },
  },
  
  PUT: {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      body: UpdateUserSchema,
      response: UserSchema,
    },
    handler: async ({ params, body }) => {
      // Update user logic
    },
  },
  
  DELETE: {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      response: z.object({
        message: z.string(),
        deletedId: z.string(),
      }),
    },
    handler: async ({ params }) => {
      // Delete user logic
    },
  },
});
```

### Authentication & Security

```typescript
const AuthHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+/, 'Invalid authorization header'),
});

export const protectedRoute = createOpenAPIRoute('/api/protected')({
  summary: 'Protected Endpoint',
  description: 'Requires authentication',
  tags: ['Protected'],
  security: [{ bearerAuth: [] }],
  
  GET: {
    schema: {
      headers: AuthHeaderSchema,
      response: z.object({
        message: z.string(),
        user: UserSchema,
      }),
    },
    handler: async ({ headers }) => {
      // Verify token and return user data
    },
  },
});
```

### Complex Nested Schemas

```typescript
const PostWithCommentsSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  author: UserSchema,
  comments: z.array(z.object({
    id: z.string().uuid(),
    content: z.string(),
    author: UserSchema,
    createdAt: z.date(),
  })),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getPostWithCommentsRoute = createOpenAPIRoute('/api/posts/:id/with-comments')({
  summary: 'Get Post with Comments',
  description: 'Retrieve a post along with all its comments and author information',
  tags: ['Posts'],
  operationId: 'getPostWithComments',
  
  GET: {
    schema: {
      params: z.object({
        id: z.string().uuid(),
      }),
      query: z.object({
        includeAuthor: z.boolean().default(true),
        commentsLimit: z.number().int().min(1).max(100).default(10),
      }),
      response: PostWithCommentsSchema,
    },
    handler: async ({ params, query }) => {
      // Your complex data fetching logic
    },
  },
});
```

## Script Generation

Create a script to generate OpenAPI specs:

```typescript
// scripts/generate-openapi.ts
#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { generateOpenAPISpec } from 'tanstack-zod-openapi';

// Import all routes
import '../src/routes/api/health';
import '../src/routes/api/auth';
import '../src/routes/api/users';
import '../src/routes/api/posts';

const spec = generateOpenAPISpec({
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API Documentation',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development' },
    { url: 'https://api.example.com', description: 'Production' },
  ],
});

// Generate files
writeFileSync('openapi.json', spec.json());
writeFileSync('openapi.yaml', spec.yaml());

console.log('✅ OpenAPI specs generated!');
```

Add to your `package.json`:

```json
{
  "scripts": {
    "generate-openapi": "tsx scripts/generate-openapi.ts",
    "generate-openapi:docs": "tsx scripts/generate-openapi.ts --output ./docs/api"
  }
}
```

### Script Options

The generation script supports the following command line options:

- `-o, --output <path>`: Specify output directory for generated files (default: current directory)
- `-h, --help`: Show help message

**Examples:**
```bash
# Generate files in current directory
bun run scripts/generate-openapi.ts

# Generate files in custom directory
bun run scripts/generate-openapi.ts -o ./docs/api

# Generate files in absolute path
bun run scripts/generate-openapi.ts --output /tmp/openapi
```

## API Reference

### `createOpenAPIRoute(path: string)`

Creates an OpenAPI route definition.

**Parameters:**
- `path`: The route path (supports TanStack Router path parameters like `:id`)

**Returns:** A function that accepts route configuration

### Route Configuration

```typescript
interface OpenAPIRouteConfig {
  summary?: string;          // Short description
  description?: string;      // Detailed description  
  tags?: string[];           // OpenAPI tags for grouping
  operationId?: string;      // Unique operation identifier
  deprecated?: boolean;      // Mark as deprecated
  security?: object[];       // Security requirements
  externalDocs?: object;     // External documentation
  
  // HTTP method handlers
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  PATCH?: RouteHandler;
  DELETE?: RouteHandler;
  HEAD?: RouteHandler;
  OPTIONS?: RouteHandler;
}
```

### Route Handler

```typescript
interface RouteHandler {
  schema: {
    params?: ZodSchema;    // Path parameters  
    query?: ZodSchema;     // Query parameters
    headers?: ZodSchema;   // Request headers
    body?: ZodSchema;      // Request body
    response?: ZodSchema;  // Response body
  };
  handler: (context: {
    params: any;           // Parsed path parameters
    query: any;            // Parsed query parameters  
    headers: any;          // Parsed headers
    body: any;             // Parsed request body
    request: Request;      // Original request object
  }) => Promise<any>;
}
```

### `generateOpenAPISpec(options)`

Generates OpenAPI specification from registered routes.

**Parameters:**
```typescript
interface GenerateOptions {
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: object;
    license?: object;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  configPath?: string; // Path to api.config.json
}
```

**Returns:** Object with methods:
- `json()`: Returns JSON string
- `yaml()`: Returns YAML string  
- `spec()`: Returns OpenAPI spec object

## Integration with TanStack Start

This package is designed to work seamlessly with TanStack Start projects. Here's how to integrate it:

1. **Define your API routes** using `createOpenAPIRoute`
2. **Use TanStack Router** to handle the actual routing
3. **Generate OpenAPI specs** for documentation
4. **Leverage type safety** throughout your application
5. **Optionally configure** output with `api.config.json` (see [Configuration](#configuration))

The package automatically discovers routes when they're imported, making it easy to generate comprehensive API documentation.

## Testing Pull Requests

This repository uses [pkg.pr.new](https://pkg.pr.new) to publish preview packages for every pull request, making it easy to test changes before they're merged.

### How to Test a PR

When a pull request is opened, a GitHub Action automatically publishes a preview package. You'll see a comment in the PR with installation instructions:

```bash
# Install the PR preview package
npm install https://pkg.pr.new/tanstack-zod-openapi@pr-123

# Or with other package managers
pnpm add https://pkg.pr.new/tanstack-zod-openapi@pr-123
bun add https://pkg.pr.new/tanstack-zod-openapi@pr-123
```

### For Maintainers

The preview package is automatically published when:
- A new pull request is opened
- New commits are pushed to an existing PR
- The main branch receives new commits

The workflow ensures that only PRs with passing tests get published, maintaining quality and reliability.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our development process, commit conventions, and how to submit pull requests.

### Quick Start for Contributors

```bash
# Fork and clone the repo
git clone https://github.com/yourusername/tanstack-zod-openapi.git
cd tanstack-zod-openapi

# Install dependencies and set up git hooks
bun install
bun run prepare

# Make your changes and commit with conventional commits
bun run commit  # Interactive commit message creation

# Run quality checks
bun run check && bun run test && bun run build
```

### Release Process

This project uses **automated semantic releases**:

- 🤖 **Automatic versioning** based on [Conventional Commits](https://conventionalcommits.org/)
- 📝 **Auto-generated changelogs** 
- 🏷️ **Automatic Git tags** and GitHub releases
- 📦 **Automatic npm publishing**
- ✅ **No manual version bumps needed**

**Commit Types → Version Bumps:**
- `fix:` → Patch release (1.0.0 → 1.0.1)
- `feat:` → Minor release (1.0.0 → 1.1.0)  
- `BREAKING CHANGE:` → Major release (1.0.0 → 2.0.0)

## License

MIT License - see the [LICENSE](LICENSE) file for details.
