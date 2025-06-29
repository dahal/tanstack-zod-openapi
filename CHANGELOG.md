# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.3.0](https://github.com/dahal/tanstack-zod-openapi/compare/v1.2.0...v1.3.0) (2025-06-15)


### 🚀 Features

* improve TypeScript type safety for route handlers ([2dcb028](https://github.com/dahal/tanstack-zod-openapi/commit/2dcb0282d0663c0bd37cedd8470530f61e26872e))


### 🐛 Bug Fixes

* resolve type inference issue for params, query, and headers ([22be0b6](https://github.com/dahal/tanstack-zod-openapi/commit/22be0b64ae81848a1dad82cf6ea7a587d12910b8))

## [1.2.0](https://github.com/dahal/tanstack-zod-openapi/compare/v1.1.0...v1.2.0) (2025-06-14)


### 🚀 Features

* add support for ZodEffects schema conversion (refine/transform) ([1159cba](https://github.com/dahal/tanstack-zod-openapi/commit/1159cbaec477af02187f11a7892929b99abc8b16))

## [1.1.0](https://github.com/dahal/tanstack-zod-openapi/compare/v1.0.1...v1.1.0) (2025-06-14)


### 🚀 Features

* add custom output path support to OpenAPI generation script ([c1d7fb3](https://github.com/dahal/tanstack-zod-openapi/commit/c1d7fb3b5a41ed141f56ee52a4fa29e7c7b4b0f0))


### 🐛 Bug Fixes

* remove unused @tanstack/router peer dependency ([84f1b8a](https://github.com/dahal/tanstack-zod-openapi/commit/84f1b8a36629c5fd18c3b420fd1ac092d5f2dc66))

## [1.0.1](https://github.com/dahal/tanstack-zod-openapi/compare/v1.0.0...v1.0.1) (2025-06-14)


### 🐛 Bug Fixes

* replace dynamic requires with proper ES6 imports in generateOpenAPISpec ([e2fb755](https://github.com/dahal/tanstack-zod-openapi/commit/e2fb755fbdbf581f06486530644799aef2dfef88))

## 1.0.0 (2025-06-14)


### 🚀 Features

* initial implementation of tanstack-zod-openapi package ([29d6f3e](https://github.com/dahal/tanstack-zod-openapi/commit/29d6f3e1b54f8f5770e99d114be77e6ed2bd506b))

## [0.1.0](https://github.com/yourusername/tanstack-zod-openapi/releases/tag/v0.1.0) (TBD)

### 🚀 Features

* **core**: Initial implementation of tanstack-zod-openapi package
* **generator**: OpenAPI 3.1 JSON/YAML generation with TypeScript types
* **route**: createOpenAPIRoute function with full OpenAPI metadata support
* **config**: api.config.json support for customizing tag order and generation options
* **validation**: Zod to OpenAPI schema conversion utilities
* **testing**: Comprehensive test suite with Vitest
* **tooling**: Lefthook pre-commit hooks and automated CI/CD workflow
