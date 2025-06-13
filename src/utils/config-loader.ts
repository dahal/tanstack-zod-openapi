import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIConfig } from '../types';

export function loadAPIConfig(configPath?: string): APIConfig | undefined {
  const defaultPaths = [
    'api.config.json',
    './api.config.json',
    join(process.cwd(), 'api.config.json'),
  ];

  const pathsToTry = configPath ? [configPath, ...defaultPaths] : defaultPaths;

  for (const path of pathsToTry) {
    try {
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content) as APIConfig;
      }
    } catch (error) {
      console.warn(`Failed to load config from ${path}:`, error);
    }
  }

  return undefined;
}

export function getDefaultConfig(): APIConfig {
  return {
    tagOrder: [],
    crudOrder: {
      POST: 1,
      GET_LIST: 2,
      GET_SINGLE: 3,
      PUT: 4,
      PATCH: 5,
      DELETE: 6,
    },
    httpMethodOrder: {
      POST: 1,
      GET: 2,
      PUT: 3,
      PATCH: 4,
      DELETE: 5,
      HEAD: 6,
      OPTIONS: 7,
    },
    options: {
      includeTimestamp: true,
      includeWarning: true,
      groupByTag: true,
      subgroupByCrud: true,
      includeMethodComments: true,
      includePathComments: true,
      detectDuplicates: true,
      warnMissingTags: true,
      uncategorizedLast: true,
      uncategorizedTagName: 'Uncategorized',
    },
    pathPatterns: {
      singleResource: ['$id', '{id}', ':id'],
      nestedResource: ['$', '{', ':'],
      action: ['.', '/'],
    },
    excludePatterns: [
      '**/test/**',
      '**/mock/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  };
}
