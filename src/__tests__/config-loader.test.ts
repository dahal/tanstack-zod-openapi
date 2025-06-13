import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDefaultConfig, loadAPIConfig } from '../utils/config-loader';

describe('config-loader', () => {
  const testConfigPath = './test-api.config.json';
  const testConfig = {
    tagOrder: ['Auth', 'Users', 'Posts'],
    httpMethodOrder: {
      GET: 1,
      POST: 2,
      PUT: 3,
      PATCH: 4,
      DELETE: 5,
    },
    options: {
      includeTimestamp: false,
      groupByTag: true,
    },
  };

  afterEach(() => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  describe('loadAPIConfig', () => {
    it('should load config from specified path', () => {
      writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));

      const config = loadAPIConfig(testConfigPath);

      expect(config).toEqual(testConfig);
    });

    it('should return undefined when config file does not exist', () => {
      const config = loadAPIConfig('./nonexistent.json');

      expect(config).toBeUndefined();
    });

    it('should return undefined when config file is invalid JSON', () => {
      writeFileSync(testConfigPath, 'invalid json content');

      const config = loadAPIConfig(testConfigPath);

      expect(config).toBeUndefined();
    });

    it('should try default paths when no path specified', () => {
      const config = loadAPIConfig();

      // Should return undefined since no default config exists in test env
      expect(config).toBeUndefined();
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultConfig();

      expect(config).toEqual({
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
      });
    });

    it('should return consistent default config', () => {
      const config1 = getDefaultConfig();
      const config2 = getDefaultConfig();

      expect(config1).toEqual(config2);
    });
  });
});
