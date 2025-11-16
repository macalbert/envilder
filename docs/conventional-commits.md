# Conventional Commits Guide

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification for
consistent and automated changelog generation.

## Quick Reference

### Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Version Bump | Example |
|------|-------------|--------------|---------|
| `feat` | New feature | MINOR | `feat(gha): add GitHub Action support` |
| `fix` | Bug fix | PATCH | `fix(cli): handle empty environment files` |
| `docs` | Documentation only | - | `docs: update README with examples` |
| `style` | Code style (formatting, semicolons) | - | `style: fix indentation in Cli.ts` |
| `refactor` | Code refactoring | - | `refactor: extract validation logic` |
| `perf` | Performance improvements | PATCH | `perf: optimize AWS SSM batch calls` |
| `test` | Add or update tests | - | `test: add E2E tests for push mode` |
| `chore` | Maintenance tasks | - | `chore: update dependencies` |
| `ci` | CI/CD configuration | - | `ci: add coverage reporting` |
| `build` | Build system changes | - | `build: configure pnpm workspace` |
| `revert` | Revert previous commit | - | `revert: feat(gha): add GitHub Action` |

### Scopes (Optional)

Common scopes in this project:

- `cli` - CLI application
- `gha` - GitHub Action
- `core` - Core business logic
- `aws` - AWS SSM integration
- `docs` - Documentation
- `deps` - Dependencies

### Breaking Changes

Add `BREAKING CHANGE:` in footer or `!` after type:

```bash
# Option 1: Footer
feat(cli): redesign command interface

BREAKING CHANGE: --map flag is now required for all operations

# Option 2: ! notation
feat(cli)!: remove --auto flag
```

## Examples

### ✅ Good Commits

```bash
# Feature addition
feat(gha): add support for custom AWS regions

# Bug fix with scope
fix(cli): prevent crash on missing param-map.json

# Documentation update
docs: add troubleshooting guide for GitHub Actions

# Breaking change
feat!: require Node.js 20+ for better ESM support

BREAKING CHANGE: Node.js 18 is no longer supported
```

### ❌ Bad Commits

```bash
# Missing type
Updated README

# Vague description
fix: fixes

# Too generic
feat: improvements

# Should use conventional format
Fixed bug in CLI
```

## Automation

### Install Commitlint (Optional)

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Add to package.json scripts:
# "commitlint": "commitlint --edit"
```

### Pre-commit Hook with Husky

```bash
pnpm add -D husky

# Initialize
npx husky install

# Add commit-msg hook
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### Generate Changelog

```bash
# Manual version bump (updates CHANGELOG.md)
pnpm version patch   # 0.7.0 -> 0.7.1
pnpm version minor   # 0.7.0 -> 0.8.0
pnpm version major   # 0.7.0 -> 1.0.0

# Or use conventional-changelog
pnpm add -D conventional-changelog-cli
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

## Workflow

1. **Make changes** to your code
2. **Stage changes**: `git add .`
3. **Commit with conventional format**:

   ```bash
   git commit -m "feat(cli): add --verbose flag for debug logging"
   ```

4. **Push**: `git push`
5. **Create release** (when ready):

   ```bash
   pnpm version minor  # Auto-updates CHANGELOG
   git push --follow-tags
   ```

## Benefits

- ✅ **Automated changelog** generation
- ✅ **Semantic versioning** automation
- ✅ **Clear git history** for team and contributors
- ✅ **Better PRs** with standardized titles
- ✅ **CI/CD integration** (auto-release based on commits)

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Semantic Versioning](https://semver.org/)
