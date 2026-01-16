<!-- markdownlint-disable MD024 -->
# Changelog

## [0.7.6] - 2026-01-16

### Fixed

* **ci:** Align npm publish script with CI workflow expectations to prevent failures
* Removed redundant validation steps (lint, build, test) from publish script that were already executed in CI

### Changed

* Simplified npm publish script from full validation pipeline to `npm pack --dry-run && npm publish`
* Updated README badge links - npm downloads now links to npmcharts for visual statistics
* Converted README badges from HTML to standard Markdown format for better maintainability
* Updated GitHub Action version references from v0.7.2 to v0.7.6 in documentation

### Removed

* **ci:** Deleted deprecated `publish-action.yml` workflow

---

## [0.7.5] - 2026-01-15

### Documentation

* Remove changelog generation instructions from documentation ([#104](https://github.com/macalbert/envilder/pull/104))
* Update GitHub Copilot instructions

### Dependencies

* Bump undici to address security vulnerability ([#105](https://github.com/macalbert/envilder/pull/105))

---

## [0.7.4] - 2026-01-02

### Changed

* **ci:** Update npm publish command to include `--no-git-checks` flag

### Dependencies

* Bump @commitlint/cli from 20.1.0 to 20.2.0 ([#103](https://github.com/macalbert/envilder/pull/103))
* Bump testcontainers from 11.9.0 to 11.11.0 ([#102](https://github.com/macalbert/envilder/pull/102))
* Bump @types/node from 24.10.1 to 25.0.3 ([#101](https://github.com/macalbert/envilder/pull/101))
* Bump @testcontainers/localstack from 11.9.0 to 11.11.0 ([#100](https://github.com/macalbert/envilder/pull/100))
* Bump @commitlint/config-conventional ([#99](https://github.com/macalbert/envilder/pull/99))

---

## [0.7.3] - 2025-12-06

### Dependencies

* Bump actions/checkout from 5 to 6 ([#98](https://github.com/macalbert/envilder/pull/98))
* Bump glob from 11.1.0 to 13.0.0 ([#97](https://github.com/macalbert/envilder/pull/97))

---

## [0.7.2] - 2025-11-29

### Changed

* **ci:** Update Node.js version to 24 in workflow
* Update publish command to use pnpm
* Add repository field to package.json
* Standardize quotes in publish-npm.yml

### Dependencies

* Bump pnpm/action-setup from 2 to 4 ([#92](https://github.com/macalbert/envilder/pull/92))
* Bump @commitlint/cli from 19.8.1 to 20.1.0 ([#94](https://github.com/macalbert/envilder/pull/94))
* Bump glob in the npm_and_yarn group ([#96](https://github.com/macalbert/envilder/pull/96))

---

## [0.7.1] - 2025-11-16

### Documentation

* Update README and ROADMAP for GitHub Action integration ([#95](https://github.com/macalbert/envilder/pull/95))
* Update GitHub Action version from v1 to v0.7.1
* Fix example version for GitHub Action

### Changed

* **ci:** Update workflow to use pnpm for dependency management

### Tests

* Increase timeout for E2E tests to 60 seconds

---

## [0.7.0](https://github.com/macalbert/envilder/compare/v0.6.6...v0.7.0) (2025-11-16)

* ♻️ Move GitHub Action to github-action/ subfolder ([d9bf4d2](https://github.com/macalbert/envilder/commit/d9bf4d2e81acbb1ef2b4e0034c0b6aaa8b307ba3))

### Bug Fixes

* **githubAction:** Correct author name in action.yml ([e964aff](https://github.com/macalbert/envilder/commit/e964affbca8410aada8494648dee62ab2a1ab5de))
* **githubAction:** Correct build command from ppnpm to pnpm ([c9df0c4](https://github.com/macalbert/envilder/commit/c9df0c4cb612de0f2b6ab6406235c54fcb45d0c2))
* **githubAction:** Correct path to GitHubAction.js in validation step ([94d1166](https://github.com/macalbert/envilder/commit/94d116632f4a6de656449f238ec007eeede2f5f2))
* **githubAction:** Remove source map generation from build:gha script ([8989448](https://github.com/macalbert/envilder/commit/898944898cdea866f28f8874b714bfe3fd2dd88e))
* **githubAction:** Update action references in documentation and code ([412601b](https://github.com/macalbert/envilder/commit/412601b7b56a90dd50e031addcaf192e2dec8ba3))

## Features

* **githubAction:** Add end-to-end tests for GitHub Actions simulation ([29464a0](https://github.com/macalbert/envilder/commit/29464a016d0072cc728345400f68e0c62669579b))
* **githubAction:** Update action paths and add new GitHub Action implementation ([4310e50](https://github.com/macalbert/envilder/commit/4310e5040fa4952c50e800578fb91e00cf2f7a36))
* **githubAction:** Update action script paths and add entry point ([9f64e56](https://github.com/macalbert/envilder/commit/9f64e567d8c90832ee402accb6aba9264554a1e7))
* **packaging:** Add project build and uninstall functionality ([70fc574](https://github.com/macalbert/envilder/commit/70fc5745c1490f33322f5fb8af1b68dd7e565fc1))

### BREAKING CHANGES

* Action path changed from macalbert/envilder@v1 to macalbert/envilder/github-action@v1

---

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.6] - 2025-11-02

### Changed

* Updated AWS credentials configuration in workflows
* Bumped vite from 7.1.10 to 7.1.11
* Bumped @types/node from 24.7.2 to 24.9.2
* Bumped @biomejs/biome from 2.2.6 to 2.3.2
* Bumped GitHub/codeql-action from 3 to 4
* Bumped actions/setup-node from 5 to 6
* Bumped vitest from 3.2.4 to 4.0.6

### Documentation

* Added Snyk badge for known vulnerabilities in README

## [0.6.5] - 2025-10-15

### Added

* Enabled npm trusted publishing with OIDC authentication

### Changed

* Bumped tmp from 0.2.3 to 0.2.4
* Bumped @types/node from 22.16.3 to 24.3.0
* Bumped @testcontainers/localstack from 11.2.1 to 11.5.1
* Bumped testcontainers from 11.2.1 to 11.5.1
* Bumped @aws-sdk/credential-providers from 3.844.0 to 3.879.0
* Bumped secretlint from 10.2.1 to 11.2.0
* Bumped @biomejs/biome from 2.1.3 to 2.2.4
* Bumped @secretlint/secretlint-rule-preset-recommend from 10.2.1 to 11.2.4
* Bumped vite from 7.0.4 to 7.1.5
* Bumped commander from 14.0.0 to 14.0.1
* Bumped inversify from 7.6.1 to 7.10.2
* Updated actions/checkout from 4 to 5
* Updated actions/setup-node from 4 to 5
* Updated actions/upload-pages-artifact from 3 to 4
* Updated aws-actions/configure-aws-credentials from 4 to 5

## [0.6.4] - 2025-08-02

### Changed

* Bumped typescript from 5.8.3 to 5.9.2
* Bumped secretlint from 10.2.0 to 10.2.1
* Bumped @types/glob from 8.1.0 to 9.0.0
* Bumped @secretlint/secretlint-rule-preset-recommend from 10.2.0 to 10.2.1
* Bumped @biomejs/biome from 2.1.1 to 2.1.3

## [0.6.3] - 2025-07-20

### Changed

* Implemented .NET-Style DIP Startup Pattern for dependency injection
* Improved separation of concerns in dependency configuration

## [0.6.1] - 2025-07-13

### Added

* **Push Mode** functionality to upload environment variables to AWS SSM Parameter Store
* File-based approach for pushing multiple variables from `.env` files
* Single-variable approach for direct command line uploads
* Support for working with different AWS profiles when pushing secrets
* Comprehensive test coverage for all Push Mode functionality

### Security

* Implemented secure parameter handling to protect sensitive values
* Maintained AWS IAM best practices for least privilege
* Added safeguards against accidental overwrites of critical parameters

### Changed

* Designed clean, modular command structure for Push Mode operations
* Added new domain models and handlers to support Push feature
* Maintained separation of concerns between infrastructure and application layers
* Ensured backward compatibility with existing Pull Mode features

### Documentation

* Added comprehensive examples for all new Push Mode commands
* Created visual diagrams explaining Push Mode data flow
* Documented options and parameters for Push Mode operations

## [0.5.6] - 2025-07-06

### Added

* Introduced new logger interface for seamless integration of custom logging implementations

### Changed

* Updated several packages to latest versions for improved security and performance

### Documentation

* Added video guide to README demonstrating CLI usage
* Enhanced user onboarding materials

## [0.5.5] - 2025-06-29

### Changed

* Moved `EnvilderBuilder` from `domain` to `application/builders` directory
* Updated import paths across codebase for better organization
* Enhanced code architecture alignment with domain-driven design principles

### Fixed

* Fixed glob pattern and path handling in test cleanup functions
* Corrected file path resolution in end-to-end tests
* Improved error handling during test file deletions

### Documentation

* Extensively updated README with clearer structure and table of contents
* Added feature status table to clarify implemented vs planned features
* Simplified installation and usage instructions
* Revamped pull request template for better contributor experience
* Removed outdated environment-specific parameter examples

## [0.5.4] - 2025-06-10

### Added

* Added unit tests for error handling with missing CLI arguments
* Enhanced unit test reporting with JUnit format for better CI integration

### Changed

* Refactored `EnvFileManager` and related interfaces to use async/await
* Improved error handling and modularized secret processing in `Envilder`
* Enhanced error handling for missing secrets with clearer feedback
* Renamed methods, test suite descriptions, and filenames for consistency
* Extracted package.json version retrieval into dedicated `PackageJsonFinder` class
* Modularized and simplified `escapeEnvValue` method and related tests
* Updated dependencies for better reliability
* Improved test cleanup for more reliable test runs
* Added and reorganized permissions in CI workflow
* Updated `.gitattributes` for better language stats on GitHub

## [0.5.3] - 2025-06-07

### Added

* Modular CLI for environment variable synchronization with pluggable secret providers
* Builder pattern for flexible CLI configuration and usage
* Extensive unit, integration, and end-to-end tests
* AWS integration testing using Localstack with Testcontainers
* Expanded tests for environment file escaping and builder configuration

### Changed

* **BREAKING**: Full TypeScript migration from JavaScript
* Introduced modular, layered architecture with clear separation
* Restructured CLI internals for improved maintainability
* Test structure now mirrors production code structure
* Migrated CI/CD workflows and scripts from Yarn to npm
* Updated ignore files and configuration

### Documentation

* Updated documentation to focus on npm commands
* Improved workflow and script documentation

## [0.5.2] - 2025-05-18

### Added

* Comprehensive E2E validation test in CI/CD pipeline
* Validation includes: build, `npm pack`, local install, and CLI command execution
* Ensures package integrity and command-line operability before release

## [0.5.1] - 2025-05-16

### Fixed

* CLI command not recognized after global install (`npm install -g envilder`)
* Fixed missing compiled `lib/` files in published package

## [0.3.0] - 2025-05-09

### Added

* Support for working with different AWS accounts and configurations via AWS profiles

### Changed

* Bumped @secretlint/secretlint-rule-preset-recommend from 9.3.0 to 9.3.2
* Bumped @types/node from 22.14.1 to 22.15.3
* Bumped commander from 12.1.0 to 13.1.0
* Bumped vite from 6.2.6 to 6.3.4
* Bumped @aws-sdk/client-ssm from 3.787.0 to 3.799.0

## [0.2.3] - 2025-04-12

### Changed

* Updated multiple dependencies including:
  * @types/node from 22.7.5 to 22.10.3
  * @aws-sdk/client-ssm from 3.670.0 to 3.716.0
  * @biomejs/biome from 1.9.3 to 1.9.4
  * nanoid from 3.3.7 to 3.3.8
  * @secretlint/secretlint-rule-preset-recommend from 8.5.0 to 9.0.0
  * secretlint from 8.5.0 to 9.0.0

## [0.2.1] - 2024-10-16

### Added

* Code coverage reporting and deployment to GitHub Pages
* CodeQL workflow for security analysis
* Preserve existing `.env` file and update values if present

### Documentation

* Updated README.md with improved documentation

## [0.1.4] - 2024-10-01

Initial public release of Envilder.

---

## How to Update This Changelog

This changelog follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```txt
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

* `feat`: A new feature (triggers MINOR version bump)
* `fix`: A bug fix (triggers PATCH version bump)
* `docs`: Documentation-only changes
* `style`: Changes that don't affect code meaning (formatting, etc.)
* `refactor`: Code change that neither fixes a bug nor adds a feature
* `perf`: Performance improvements
* `test`: Adding or correcting tests
* `chore`: Changes to build process or auxiliary tools
* `ci`: Changes to CI configuration files and scripts

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or append `!` after type/scope:

```txt
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

## Maintenance

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

**To update this changelog**:

1. Edit this file following the format above
2. Add entries under `[Unreleased]` section
3. Run `pnpm version [patch|minor|major]` to create a new release
4. Move `[Unreleased]` entries to the new version section

**Alternative**: Use [GitHub Releases](https://github.com/macalbert/envilder/releases) to auto-generate release notes
from commit messages.

[0.7.6]: https://github.com/macalbert/envilder/compare/v0.7.5...v0.7.6
[0.7.5]: https://github.com/macalbert/envilder/compare/v0.7.4...v0.7.5
[0.7.4]: https://github.com/macalbert/envilder/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/macalbert/envilder/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/macalbert/envilder/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/macalbert/envilder/compare/v0.6.6...v0.7.1
[0.6.6]: https://github.com/macalbert/envilder/compare/v0.6.5...v0.6.6
[0.6.5]: https://github.com/macalbert/envilder/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/macalbert/envilder/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/macalbert/envilder/compare/v0.6.1...v0.6.3
[0.6.1]: https://github.com/macalbert/envilder/compare/v0.5.6...v0.6.1
[0.5.6]: https://github.com/macalbert/envilder/compare/v0.5.5...v0.5.6
[0.5.5]: https://github.com/macalbert/envilder/compare/v0.5.4...v0.5.5
[0.5.4]: https://github.com/macalbert/envilder/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/macalbert/envilder/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/macalbert/envilder/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/macalbert/envilder/compare/v0.3.0...v0.5.1
[0.3.0]: https://github.com/macalbert/envilder/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/macalbert/envilder/compare/v0.2.1...v0.2.3
[0.2.1]: https://github.com/macalbert/envilder/compare/v0.1.4...v0.2.1
[0.1.4]: https://github.com/macalbert/envilder/releases/tag/v0.1.4
<!-- markdownlint-enable MD024 -->