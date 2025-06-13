#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateOpenAPISpec } from 'tanstack-zod-openapi';

// Import all routes to register them
import '../src/routes/api/health';
import '../src/routes/api/auth';
import '../src/routes/api/users';
import '../src/routes/api/posts';

const info = {
  title: 'TanStack Zod OpenAPI Example',
  version: '1.0.0',
  description: 'Example API demonstrating TanStack Router with Zod OpenAPI integration',
  contact: {
    name: 'API Support',
    email: 'support@example.com',
    url: 'https://example.com/support',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
};

const servers = [
  {
    url: 'http://localhost:3000',
    description: 'Development server',
  },
  {
    url: 'https://api.example.com',
    description: 'Production server',
  },
];

const configPath = join(process.cwd(), 'api.config.json');

// Generate OpenAPI specification
const openApiSpec = generateOpenAPISpec({
  info,
  servers,
  configPath,
});

try {
  // Generate JSON
  const jsonSpec = openApiSpec.json();
  writeFileSync('openapi.json', jsonSpec);
  console.log('✅ Generated openapi.json');

  // Generate YAML
  const yamlSpec = openApiSpec.yaml();
  writeFileSync('openapi.yaml', yamlSpec);
  console.log('✅ Generated openapi.yaml');

  // Log summary
  const spec = JSON.parse(jsonSpec);
  const pathCount = Object.keys(spec.paths).length;
  const operationCount = Object.values(spec.paths).reduce((count: number, path: any) => {
    return count + Object.keys(path).length;
  }, 0);

  console.log(`📊 Summary:`);
  console.log(`   - ${pathCount} paths`);
  console.log(`   - ${operationCount} operations`);
  console.log(`   - ${spec.components?.schemas ? Object.keys(spec.components.schemas).length : 0} schemas`);
  
  if (spec.tags) {
    console.log(`   - Tags: ${spec.tags.map((tag: any) => tag.name).join(', ')}`);
  }

} catch (error) {
  console.error('❌ Error generating OpenAPI spec:', error);
  process.exit(1);
}