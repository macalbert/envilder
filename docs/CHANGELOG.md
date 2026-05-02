# Changelog

All notable cross-component changes to the Envilder project are documented
here. For per-component changelogs, see `docs/changelogs/`.

## [Unreleased]

### Security

* **Fix CVE-2026-33532** — Override transitive `yaml` dependency to `>=2.8.3`
  to resolve Uncontrolled Recursion vulnerability (CVSS 5.3, CWE-674)
  introduced through `@astrojs/check` → `yaml-language-server` → `yaml@2.7.1`

### Added

* **Node.js SDK v0.1.0** (`@envilder/sdk`) — Runtime library for Node.js.
  Load secrets directly into `process.env` from a map file. AWS SSM +
  Azure Key Vault. Published to npm
  ([docs](../src/sdks/nodejs/README.md),
  [changelog](changelogs/sdk-nodejs.md))

* **.NET SDK v0.2.0** — Static facade (`Envilder.Load`, `Envilder.FromMapFile`),
  fluent builder, environment-based routing, sync + async API, cross-provider
  validation. `SecretProviderFactory` is now internal
  ([changelog](changelogs/sdk-dotnet.md))

* **Python SDK v0.3.2** — Encapsulated `SecretProviderFactory`, cross-provider
  validation, delegated default AWS region resolution to boto3
  ([changelog](changelogs/sdk-python.md))

---

## [0.9.3] - 2026-04-17

### Added

* **Runtime SDKs now available** — Load secrets directly into your application
  at startup, no `.env` file needed:

  **.NET** ([NuGet](https://www.nuget.org/packages/Envilder)):

  ```csharp
  builder.Configuration.AddEnvilder("secrets-map.json");
  ```

  **Python** ([PyPI](https://pypi.org/project/envilder)):

  ```python
  from envilder import Envilder
  Envilder.load('secrets-map.json')
  ```

  **CLI** (as always):

  ```bash
  npx envilder --map=secrets-map.json --envfile=.env
  ```

  **GitHub Action:**

  ```yaml
  - uses: macalbert/envilder/github-action@v0
    with:
      map-file: secrets-map.json
      env-file: .env
  ```

### Changed

* **README rewritten** — Streamlined messaging, accurate comparison
  tables, simplified quick start (2 steps), and reduced noise
* **Comparison table corrected** — Infisical SDKs, dotenvx (successor
  to dotenv-vault), and chamber capabilities now accurately represented
  with verified references

### Fixed

* **ci(publish-npm):** Narrowed `paths` filter from `src/**` to
  `src/envilder/**` so SDK/website/IaC changes no longer trigger the
  npm publish workflow
* **ci(publish-npm):** Replaced `npm view` with `curl` against the npm
  registry API to avoid `.npmrc` auth failures during version detection
* **ci(publish-website):** Added `docs/CHANGELOG.md` and
  `docs/changelogs/**` to path filters so changelog updates trigger
  website deployment

### Dependencies

* Bump `typescript` from 6.0.2 to 6.0.3

---

## [0.9.2] - 2026-04-02

### Added

* **LocalStack sponsor section** — Added sponsor section to website homepage and README with LocalStack logos (dark, light, color variants) and a new `Sponsors.astro` component ([#136](https://github.com/macalbert/envilder/pull/136))
* **SDK platform scaffolding** — Added placeholder structure under `src/sdks/` for future .NET, Go, Java, Python, and TypeScript SDK implementations
* **Website test suite** — Added `tests/website/` with Vitest coverage for i18n utilities and Markdown helpers (`utils.test.ts`, `markdown.test.ts`)
* **`BackToTop` component** — New scroll-to-top button component for the documentation website

### Changed

* **Project layout restructured for SDK platform readiness** ([#134](https://github.com/macalbert/envilder/pull/134)):
  * Core domain layer moved from `src/envilder/` to `src/envilder/core/`
  * Website moved from `src/apps/website/` to `src/website/`
  * All imports, `tsconfig.json`, `package.json`, and workspace config updated accordingly
* **Website UX improvements** — `DocsContent`, `HowItWorks`, `ThemeSwitcher`, `TerminalMockup`, and `BaseLayout` components updated; global CSS expanded; i18n keys added for new content

### Fixed

* **README:** Replace `#gh-light-mode-only` / `#gh-dark-mode-only` image fragments with a `<picture>` element using `prefers-color-scheme` media queries for reliable dark/light theme logo switching
* **ci:** Update version check in publish workflow to use published version from npm

### Dependencies

* Bump `@aws-sdk/client-ssm` from 3.1019.0 to 3.1021.0 ([#140](https://github.com/macalbert/envilder/pull/140))
* Bump `@aws-sdk/credential-providers` from 3.1019.0 to 3.1021.0 ([#142](https://github.com/macalbert/envilder/pull/142))
* Bump `secretlint` from 11.4.0 to 11.4.1 ([#141](https://github.com/macalbert/envilder/pull/141))
* Bump `@secretlint/secretlint-rule-preset-recommend` from 11.4.0 to 11.4.1 ([#144](https://github.com/macalbert/envilder/pull/144))
* Bump `astro` from 6.1.1 to 6.1.2 ([#143](https://github.com/macalbert/envilder/pull/143))
* Bump `actions/configure-pages` from 5 to 6 ([#139](https://github.com/macalbert/envilder/pull/139))
* Bump `actions/deploy-pages` from 4 to 5 ([#138](https://github.com/macalbert/envilder/pull/138))
* Bump `pnpm/action-setup` from 4 to 5 ([#137](https://github.com/macalbert/envilder/pull/137))

---

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
