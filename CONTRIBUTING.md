# Contributing to tanstack-zod-openapi

Thank you for your interest in contributing! This guide will help you get started with contributing to this project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/tanstack-zod-openapi.git
   cd tanstack-zod-openapi
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up git hooks**
   ```bash
   bun run prepare
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write code following our TypeScript and code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Run quality checks**
   ```bash
   bun run check      # Format, lint, and fix issues
   bun run typecheck  # Type checking
   bun run test       # Run tests
   bun run build      # Ensure build works
   ```

### Commit Guidelines

We use [Conventional Commits](https://conventionalcommits.org/) for commit messages. This enables automatic changelog generation and semantic versioning.

#### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

#### Examples
```bash
feat(core): add support for OpenAPI 3.1 schema generation
fix(zod): handle nested optional objects correctly
docs(readme): update installation instructions
perf(generator): optimize large schema processing
```

#### Using Commitizen (Recommended)
For interactive commit message creation:
```bash
bun run commit
```

This will guide you through creating a properly formatted commit message.

### Automated Checks

Our project uses several automated tools to maintain code quality:

- **Pre-commit hooks**: Format, lint, typecheck, and test your code
- **Commit message validation**: Ensures conventional commit format
- **Pre-push hooks**: Run build and coverage checks

## Testing

### Running Tests
```bash
bun test              # Run all tests
bun run test:ui       # Run tests with UI
bun run test:coverage # Generate coverage report
```

### Writing Tests
- Write unit tests for new functions and components
- Use descriptive test names
- Follow the existing test patterns in `src/__tests__/`
- Aim for good test coverage

## Release Process

**Note**: Releases are automated! You don't need to manually version or publish.

### How Releases Work

1. **Semantic Versioning**: Version numbers are automatically determined based on commit types:
   - `fix:` → patch version (1.0.0 → 1.0.1)
   - `feat:` → minor version (1.0.0 → 1.1.0)
   - `BREAKING CHANGE:` → major version (1.0.0 → 2.0.0)

2. **Automatic Release**: When changes are merged to `main`:
   - Changelog is automatically generated
   - Package is built and tested
   - New version is published to npm
   - GitHub release is created with assets
   - Git tags are created

3. **What You Need to Do**: Just write good commit messages!

### Testing Releases Locally
```bash
bun run release:dry  # See what would be released without actually releasing
```

## Code Style

- We use **Biome** for formatting and linting
- **TypeScript** strict mode is enabled
- Prefer explicit types over `any`
- Follow existing code patterns
- Use meaningful variable and function names

## Documentation

- Update README.md if you add new features
- Add JSDoc comments for public APIs
- Update examples if behavior changes
- Keep documentation clear and concise

## Pull Request Process

1. **Ensure all checks pass**
   - All tests pass
   - TypeScript compiles without errors
   - Code is properly formatted and linted
   - Build succeeds

2. **Write a clear PR description**
   - Describe what changes you made
   - Explain why the changes are needed
   - Link to any related issues

3. **Update documentation** as needed

4. **Be responsive to feedback** and make requested changes promptly

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (if available)

## Code of Conduct

Please be respectful and inclusive in all interactions. We want this to be a welcoming community for everyone.

## Questions?

If you have any questions about contributing, feel free to open an issue or start a discussion. We're here to help!

Thank you for contributing! 🚀