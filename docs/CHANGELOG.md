## [0.9.1] - 2026-03-30

### Added

* **Documentation website** — Full Astro-based docs site deployed at [envilder.com](https://envilder.com), with multi-language support (EN, ES, CA), dark/retro and light themes, and a dedicated changelog page

### Changed

* Updated Envilder logo in README

### Fixed

* **deps:** Move `@types/node` from `dependencies` to `devDependencies` to prevent it from being bundled as a runtime dependency
* **e2e:** Use unique SSM paths per CLI test run to prevent race conditions between parallel test executions

### Dependencies

* Bump `brace-expansion` from 5.0.4 to 5.0.5 (security patch)
* Bump `@azure/core-rest-pipeline` and `@azure/identity` group updates

---

## [0.8.0] - 2026-03-22

### Added

* **`$config` section in map files** — Map files now support an optional `$config` key to declare provider and connection
details inline (e.g., `"provider": "azure"`, `"vaultUrl": "https://..."`, `"profile": "dev-account"`)
* New CLI flag `--vault-url <url>` — Azure Key Vault URL, overrides `$config.vaultUrl` in the map file
* New GitHub Action input `vault-url` — Azure Key Vault URL, overrides `$config.vaultUrl` in the map file
* Precedence chain: CLI flags / GHA inputs > `$config` in map file > defaults
* Backward compatible: existing map files without `$config` continue to work (defaults to AWS provider)
* **Azure Key Vault support** — Use `--provider=azure` (CLI) or `provider: azure` (GitHub Action) to pull/push secrets
from Azure Key Vault ([#90](https://github.com/macalbert/envilder/pull/90))
* New infrastructure adapter: `AzureKeyVaultSecretProvider` implementing `ISecretProvider`
* New CLI option `--provider <name>` to select cloud provider (`aws` or `azure`, default: `aws`)
* New GitHub Action input `provider` for selecting the cloud provider
* Azure authentication via `DefaultAzureCredential` (supports Azure CLI, managed identity, etc.)
* Automatic secret name normalization for Azure Key Vault naming constraints

### Changed

* **CLI flag `--ssm-path` renamed to `--secret-path`** — The old flag is still accepted as a deprecated alias and
prints a warning. It will be removed in a future release.
* `configureInfrastructureServices()` now receives a single `MapFileConfig` object instead of separate parameters
* CLI and GHA entry points read `$config` from the map file and merge with CLI flags / GHA inputs
* Extracted shared `ContainerConfiguration` module (`src/envilder/apps/shared/`) for DI setup reused by CLI and GitHub Action
* Both `Startup.ts` files (CLI and GHA) now delegate to shared `configureInfrastructureServices()` and `configureApplicationServices()`
* Updated CLI description to include Azure Key Vault examples
* Updated `action.yml` description and inputs to reflect multi-provider support

### Dependencies

* Added `@azure/keyvault-secrets`
* Added `@azure/identity`
* Added `@azure/core-rest-pipeline`

### Documentation

* Updated all documentation to reflect `$config` map-file section and `--vault-url` flag
* Updated architecture diagrams and DI code snippets
* Updated GitHub Action examples to use `vault-url` input
* Updated ROADMAP to mark Azure Key Vault as fully implemented

---

## [0.7.12] - 2026-03-22

### Fixed

* **ssm:** Upgrade AWS SDK to resolve fast-xml-parser CVEs ([#128](https://github.com/macalbert/envilder/pull/128))

### Changed

* **ci:** Upgrade `dorny/test-reporter` to v3 for Node.js 24 support ([#127](https://github.com/macalbert/envilder/pull/127))
* **dx:** Add AI workflow agents, prompts, and lefthook pre-commit hook ([#125](https://github.com/macalbert/envilder/pull/125))

### Dependencies

* Bump `undici` from 7.22.0 to 7.24.1 ([#126](https://github.com/macalbert/envilder/pull/126))

---

## [0.7.11] - 2026-03-08

### Security

* Bump AWS SDK packages to resolve `fast-xml-parser` vulnerability ([#124](https://github.com/macalbert/envilder/pull/124))

---

## [0.7.10] - 2026-03-02

### Changed

* **ci:** Update CI configuration for improved build reliability
* Bump AWS SDK SSM to 3.1000.0 and align CI/publish workflows ([#123](https://github.com/macalbert/envilder/pull/123))

### Dependencies

* Bump `@aws-sdk/credential-providers` from 3.995.0 to 3.1000.0 ([#122](https://github.com/macalbert/envilder/pull/122))
* Bump `@types/node` from 25.3.0 to 25.3.3 ([#121](https://github.com/macalbert/envilder/pull/121))
* Bump `minimatch` ([#119](https://github.com/macalbert/envilder/pull/119))

---

## [0.7.9] - 2026-02-22

### Fixed

* **security:** Patch transitive dependency vulnerabilities ([#118](https://github.com/macalbert/envilder/pull/118))
* **ci:** Simplify npm publish command in workflow

### Documentation

* Updated GitHub Action docs to reference v0.7.9

---

## [0.7.8] - 2026-02-05

### Fixed

* **deps:** Upgrade AWS SDK to resolve `fast-xml-parser` DoS vulnerability ([#116](https://github.com/macalbert/envilder/pull/116))

### Dependencies

* Bump `@isaacs/brace-expansion` ([#115](https://github.com/macalbert/envilder/pull/115))
* Bump `@secretlint/secretlint-rule-preset-recommend` ([#114](https://github.com/macalbert/envilder/pull/114))
* Bump `commander` from 14.0.2 to 14.0.3 ([#113](https://github.com/macalbert/envilder/pull/113))
* Bump `@aws-sdk/client-ssm` from 3.958.0 to 3.980.0 ([#112](https://github.com/macalbert/envilder/pull/112))
* Bump `secretlint` from 11.2.5 to 11.3.1 ([#110](https://github.com/macalbert/envilder/pull/110))
* Bump `@commitlint/cli` from 20.3.0 to 20.4.0 ([#111](https://github.com/macalbert/envilder/pull/111))

---

## [0.7.7] - 2026-01-27

### Added

* **push:** AWS throttling retry logic and duplicate SSM path validation ([#109](https://github.com/macalbert/envilder/pull/109))

### Fixed

* **ci:** Streamline `npm publish` workflow to prevent failures ([#106](https://github.com/macalbert/envilder/pull/106))
* **ci-publish:** Update publish command in workflow

### Dependencies

* Bump `lodash` ([#108](https://github.com/macalbert/envilder/pull/108))
* Bump `diff` ([#107](https://github.com/macalbert/envilder/pull/107))

---

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

## [0.7.3] - 2025-11-29

### Changed

* **ci:** Update Node.js version to 24 in workflow
* Update publish command to use pnpm
* Add repository field to package.json
* Standardize quotes in publish-npm.yml

### Dependencies

* Bump actions/checkout from 5 to 6 ([#98](https://github.com/macalbert/envilder/pull/98))
* Bump glob from 11.1.0 to 13.0.0 ([#97](https://github.com/macalbert/envilder/pull/97))
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

## [0.7.0] - 2025-11-16

### Added

* **githubAction:** Add end-to-end tests for GitHub Actions simulation
* **githubAction:** Update action paths and add new GitHub Action implementation
* **packaging:** Add project build and uninstall functionality

### Fixed

* **githubAction:** Correct author name in action.yml
* **githubAction:** Correct build command from `ppnpm` to `pnpm`
* **githubAction:** Correct path to `GitHubAction.js` in validation step
* **githubAction:** Remove source map generation from `build:gha` script
* **githubAction:** Update action references in documentation and code

### Changed

* Move GitHub Action to `github-action/` subfolder

### Breaking Changes

* Action path changed from `macalbert/envilder@v1` to `macalbert/envilder/github-action@v1`

---

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

* Bump version to 0.6.3 in package.json

---

## [0.6.2] - 2025-07-20

### Changed

* **di:** Implement .NET-Style DIP Startup Pattern for dependency injection — improved separation of concerns in DI configuration ([#59](https://github.com/macalbert/envilder/pull/59))

---

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

---

## [0.6.0] - 2025-07-13

### Added

* **push:** Introduced Push Mode — sync local `.env` variables to AWS SSM Parameter Store ([#57](https://github.com/macalbert/envilder/pull/57))

---

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

---

> **Note:** Versions below 0.5.1 are deprecated on npm and no longer supported.
> They are preserved here for historical reference only.

---

## [0.3.0] - 2025-05-09 [DEPRECATED]

### Added

* Support for working with different AWS accounts and configurations via AWS profiles

### Changed

* Bumped @secretlint/secretlint-rule-preset-recommend from 9.3.0 to 9.3.2
* Bumped @types/node from 22.14.1 to 22.15.3
* Bumped commander from 12.1.0 to 13.1.0
* Bumped vite from 6.2.6 to 6.3.4
* Bumped @aws-sdk/client-ssm from 3.787.0 to 3.799.0

## [0.2.3] - 2025-04-12 [DEPRECATED]

### Changed

* Updated multiple dependencies including:
  * @types/node from 22.7.5 to 22.10.3
  * @aws-sdk/client-ssm from 3.670.0 to 3.716.0
  * @biomejs/biome from 1.9.3 to 1.9.4
  * nanoid from 3.3.7 to 3.3.8
  * @secretlint/secretlint-rule-preset-recommend from 8.5.0 to 9.0.0
  * secretlint from 8.5.0 to 9.0.0

## [0.2.1] - 2024-10-16 [DEPRECATED]

### Added

* Code coverage reporting and deployment to GitHub Pages
* CodeQL workflow for security analysis
* Preserve existing `.env` file and update values if present

### Documentation

* Updated README.md with improved documentation

## [0.1.4] - 2024-10-01 [DEPRECATED]

Initial public release of Envilder.
