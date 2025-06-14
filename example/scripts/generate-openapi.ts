#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { generateOpenAPISpec } from 'tanstack-zod-openapi';

// Import all routes to register them
import '../src/routes/api/health';
import '../src/routes/api/auth';
import '../src/routes/api/users';
import '../src/routes/api/posts';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let outputPath = process.cwd(); // Default to current directory

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      if (i + 1 < args.length) {
        outputPath = resolve(args[i + 1]);
        i++; // Skip the next argument as it's the path value
      } else {
        console.error('❌ Error: --output flag requires a path value');
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx generate-openapi.ts [options]

Options:
  -o, --output <path>    Output directory for generated files (default: current directory)
  -h, --help            Show this help message

Examples:
  tsx generate-openapi.ts                    # Generate files in current directory
  tsx generate-openapi.ts -o ./docs/api     # Generate files in ./docs/api directory
  tsx generate-openapi.ts --output /tmp     # Generate files in /tmp directory
`);
      process.exit(0);
    }
  }

  return { outputPath };
}

const { outputPath } = parseArgs();

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
  // Ensure output directory exists
  mkdirSync(outputPath, { recursive: true });

  // Generate JSON
  const jsonSpec = openApiSpec.json();
  const jsonPath = join(outputPath, 'openapi.json');
  writeFileSync(jsonPath, jsonSpec);
  console.log(`✅ Generated ${jsonPath}`);

  // Generate YAML
  const yamlSpec = openApiSpec.yaml();
  const yamlPath = join(outputPath, 'openapi.yaml');
  writeFileSync(yamlPath, yamlSpec);
  console.log(`✅ Generated ${yamlPath}`);

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