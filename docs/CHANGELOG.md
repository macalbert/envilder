# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Action for automated secret pulling in CI/CD workflows
- E2E tests for GitHub Action with LocalStack simulation
- Comprehensive documentation for GitHub Action usage
- Multi-environment deployment examples

### Changed

- Migrated from npm to pnpm for package management
- Switched to pnpm workspaces for monorepo structure
- Updated dependency management workflows

### Fixed

- GitHub Action validation script path
- Author name in action.yml metadata

## [0.7.0] - 2025-11-16

### Added

- GitHub Action composite action implementation
- Dedicated GitHub Action workflows for testing and publishing
- Support for OIDC authentication in GitHub Actions
- GitHub Action README with comprehensive examples

### Changed

- Project structure to support multiple entry points (CLI + GitHub Action)
- Build configuration for dual-mode operation

## [0.6.0] - Previous releases

### Added

- Push mode for uploading secrets to AWS SSM
- Bidirectional sync (pull and push)
- AWS profile support with `--profile` flag
- Comprehensive CLI documentation

### Fixed

- Various bug fixes and improvements

---

## How to Update This Changelog

This changelog follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature (triggers MINOR version bump)
- `fix`: A bug fix (triggers PATCH version bump)
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools
- `ci`: Changes to CI configuration files and scripts

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or append `!` after type/scope:

```
feat!: remove AWS profile auto-detection

BREAKING CHANGE: Users must now explicitly specify --profile flag
```

This triggers a MAJOR version bump.

### Examples

```bash
# Feature addition (0.7.0 -> 0.8.0)
git commit -m "feat(gha): add GitHub Action support"

# Bug fix (0.7.0 -> 0.7.1)
git commit -m "fix(cli): handle empty environment files"

# Breaking change (0.7.0 -> 1.0.0)
git commit -m "feat!: redesign CLI interface"
```

---

## Automation

This project uses automated changelog generation. To generate changelog entries:

1. **Manual Update** (temporary):
   - Edit this file following the format above
   - Add entries under `[Unreleased]` section
   - Run `pnpm version [patch|minor|major]` to create a new release

2. **Automated** (recommended - future):
   - Use conventional commits in your commit messages
   - Run release automation tool (e.g., `release-please`, `semantic-release`)
   - Changelog will be auto-generated from commit history

[unreleased]: https://github.com/macalbert/envilder/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/macalbert/envilder/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/macalbert/envilder/releases/tag/v0.6.0
