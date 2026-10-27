## [0.17.1] - 2026-10-27

### Fixed

* **Accept `/` in map-file keys again**: A hierarchical name such as
  `Database/Password` is valid again, as it was before 0.14.0. The Action
  writes it to the `.env` file as-is and logs a warning with the names
  affected, because `dotenv` for Node.js, Docker Compose and POSIX shells
  skip that line ([#511](https://github.com/macalbert/envilder/issues/511))

---

## [0.17.0] - 2026-10-27

### Security

* **Reject `__proto__` in map files in the Action bundle**: The bundle is
  built from the compiled CLI core, where an own `__proto__` map-file key
  was dropped before the name check, so the Action accepted the file and
  silently skipped that mapping. The key is now rejected with the
  documented message, failing the step
  ([#511](https://github.com/macalbert/envilder/issues/511))

### Changed

* **BREAKING: Azure Key Vault references only translate `/`**: The Action
  shares the CLI's rule: `/` becomes `-`, ignoring leading slashes, and
  anything else reaches Key Vault as written, as the SDKs do. A reference
  with `_` (`/myapp/prod/stripe_key`) is no longer rewritten to
  `myapp-prod-stripe-key`; use the name the vault holds

---

## [0.16.0] - 2026-10-25

### Changed

* **Shared single-secret push handler records the mapping**: The handler the
  Action bundle shares with the CLI now also writes the map file during a
  CLI single-secret push. The Action never runs a single-secret push, so its
  pull flow, inputs and outputs are unchanged

---

## [0.15.1] - 2026-10-22

### Security

* Update development and build dependencies to resolve open advisories
  (`undici`, `brace-expansion`, `@grpc/grpc-js`, `@vitest/mocker`). The
  Action bundle and its runtime dependencies are unchanged
  ([#609](https://github.com/macalbert/envilder/pull/609))

---

## [0.15.0] - 2026-10-16

### Changed

* **Shared secret masker can report when registrations are written**: The
  masker the Action shares with the CLI gained an internal capability to
  report when its `::add-mask::` writes have completed, used by the new
  CLI-only `envilder exec` command. The Action's pull flow does not use it,
  and the registrations it prints are unchanged
  ([#550](https://github.com/macalbert/envilder/issues/550))

---

## [0.14.0] - 2026-09-26

### Fixed

* **Preserve secret values when writing `.env` files**: Values with hashes,
  leading or trailing whitespace, quotes, backslashes or line breaks now
  round-trip exactly, and updating a multi-line value no longer leaves the
  rest of the old secret in the file. Unchanged assignments are kept byte for
  byte, and a write that would not read back correctly aborts, naming only
  the affected keys ([#515](https://github.com/macalbert/envilder/pull/515))

### Security

* **Reject map-file mapping keys a `.env` file cannot represent**: Variable
  names must now match `^[A-Za-z0-9_.-]+$`, checked when parsing a map file
  and again before writing an environment file. This is exactly the key
  grammar `.env` parsers recognize, so an accepted name reads back as itself.
  Previously a name containing `=`, a carriage return, a newline or the
  `U+2028`/`U+2029` line separators could smuggle an extra `key=value`
  assignment into the generated file, and a name containing a space, `#`, a
  tab or a non-Latin letter was written and then silently lost while the run
  reported success. Dotted and hyphenated names remain valid
  ([#511](https://github.com/macalbert/envilder/issues/511))

* **Reject the mapping key `__proto__`**: No `.env` parser can read this name
  back, so the Action previously resolved the secret and wrote a line that
  silently never loaded. It is now rejected at map-file ingestion with an
  explicit message ([#511](https://github.com/macalbert/envilder/issues/511))

### Documentation

* **Point the README "Learn more" link at the Action docs**: It now lands on
  `envilder.com/docs/github-action/` with UTM tags, so visits from the Action
  README to envilder.com can be measured

---

## [0.13.2] - 2026-08-14

### Security

* **Mask resolved secrets in subsequent workflow logs**: Register every
  non-empty resolved value with the GitHub Actions runner before writing it
  to the environment file, so exact matches emitted by later steps are
  redacted. CLI behavior remains unchanged
  ([#476](https://github.com/macalbert/envilder/issues/476),
  [#477](https://github.com/macalbert/envilder/pull/477))

---

## [0.13.1] - 2026-07-31

### Added

* **GitHub Marketplace listing and root reference**: A root `action.yml`
  publishes the Action to the GitHub Marketplace and lets workflows use it as
  `macalbert/envilder@<version>`. The `macalbert/envilder/github-action@v0`
  reference keeps working.

### Changed

* **Bundle the GitHub Action with esbuild**: Replace the ncc bundler so the
  Action can build with TypeScript 7 while retaining a single minified
  `dist/index.js` file, and configure Node.js 22 before executing the bundle.

* **Run development scripts with tsx**: Replace ts-node, which is incompatible
  with TypeScript 7, for local package installation and CDK execution.

---

## [0.13.0] - 2026-07-11

### Added

* **Colorized `AWS identity` banner**: The
  `☁ AWS identity · account=… · region=… · profile=…` line is now colorized.
  `account` and `region` render in red when they resolve to `unknown`,
  signalling that authentication failed
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Changed

* **Print the `AWS identity` banner before resolving secrets**: The
  banner is now printed before secrets are resolved, so it always
  appears first. Previously it could surface mid-output because secrets
  resolve in parallel
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Fixed

* **Clear error for expired or invalid AWS credentials**: Expired or
  invalid AWS credentials (e.g. an expired session token) now produce a
  clear, actionable `ExpiredCredentialsError` during the pull, telling
  you to refresh credentials (e.g. run `aws sso login`), instead of
  being masked as a misleading `ParameterNotFound`

* **Expired SSO sessions surface as `SsoSessionExpiredError`**: When an
  AWS SSO session can no longer be resolved, the action now fails with a
  clear, actionable `SsoSessionExpiredError` that names the AWS profile
  and the `aws sso login` command to run, instead of being lumped in
  with a generic `ExpiredCredentialsError`. The action runs
  non-interactively, so it presents the message only; it never prompts
  or redirects

---

## [0.12.1] - 2026-06-26

### Fixed

* **Honor `$config.profile` for the AWS region, not just credentials**:
  When a map file set an AWS profile via `$config.profile`, the action
  applied it to credentials only; the AWS SDK fell back to the default
  profile's region and silently read SSM parameters from the wrong
  account-region. The action now sets `AWS_PROFILE` so the AWS SDK resolves
  both the profile's region and its (SSO-capable) credentials natively.
  Region resolution order is `AWS_REGION` > `AWS_DEFAULT_REGION` >
  profile region > `us-east-1` fallback
  ([#382](https://github.com/macalbert/envilder/issues/382))

### Added

* **Log the effective AWS identity before resolving secrets**:
  Before the first read, the action logs
  `☁ AWS identity · account=… · region=… · profile=…` so a misrouted account
  or region is immediately visible. The account is read from the active
  credentials, falling back to an STS `GetCallerIdentity` call when not
  present, then `unknown`
  ([#382](https://github.com/macalbert/envilder/issues/382))

---

## [0.12.0] - 2026-06-26

### Changed

* **Preserve existing `.env` formatting on pull**: When the target `.env`
  file already exists, the action now updates values in place instead of
  rewriting the file from scratch. Full-line comments, blank lines, key
  ordering, `export` prefixes, and surrounding spacing are preserved; only
  the values of mapped keys are replaced, and new keys are appended at the
  end. (Inline comments after a value, e.g. `KEY=val # note`, are not
  preserved.)

### Dependencies

* Bundle updated with latest CLI core

---

## [0.11.1] - 2026-06-25

### Fixed

* **AWS SSO / assumed-role profiles now resolve correctly**: The bundled CLI
  now resolves SSO, IAM Identity Center, and assumed-role profiles (via the
  `profile` input or `$config.profile`) through the full AWS provider chain
  instead of silently falling back to the default credentials
  ([#364](https://github.com/macalbert/envilder/issues/364))

---

## [0.11.0] - 2026-05-31

### Changed

* **BREAKING: Require Node.js >= 22.12**: GitHub Actions workflows updated
  to use `node-version: "22.x"`. The bundled CLI now requires Node.js 22.12+
  ([#291](https://github.com/macalbert/envilder/pull/291))

### Dependencies

* Bundle updated with latest CLI core (all dependencies at latest)

---

## [0.10.0] - 2026-05-03

### Fixed

* **Reserved key filtering**: `$schema` and other `$`-prefixed keys no longer
  leak into environment variable mappings
  ([#218](https://github.com/macalbert/envilder/pull/218))

### Dependencies

* Bundle updated with latest CLI core (map-file schema support)

---

## [0.9.4] - 2026-05-03

### Fixed

* Rebuild stale dist and remove force-tracked build artifacts (#193)

### Dependencies

* Bundle updated with latest CLI core (dependency bumps)

---

## [0.9.3] - 2026-04-17

### Changed

* Bundle updated with latest CLI core (runtime SDKs announcement, dependency bumps)

### Fixed

* **ci(publish-npm):** Narrowed `paths` filter from `src/**` to
  `src/envilder/**` so SDK/website/IaC changes no longer trigger the
  npm publish workflow

---

## [0.9.2] - 2026-04-02

### Changed

* Bundle updated with latest CLI core (Azure Key Vault, `$config` map-file support)

---

## [0.8.0] - 2026-03-26

### Added

* **Azure Key Vault support**: Use `provider: azure` input to pull secrets from Azure Key Vault
* New input `vault-url`: Azure Key Vault URL, overrides `$config.vaultUrl` in the map file
* New input `provider`: Select cloud provider (`aws` or `azure`, default: `aws`)
* `$config` section support in map files: declare provider and connection details inline

### Changed

* Updated `action.yml` description and inputs to reflect multi-provider support
* Both CLI and GHA now use shared `ContainerConfiguration` module for DI setup

---

## [0.7.1] - 2025-11-16

### Documentation

* Update GitHub Action version from v1 to v0.7.1 in documentation
* Fix example version references

---

## [0.7.0] - 2025-11-16

### Added

* **Initial GitHub Action release**: Use Envilder in CI/CD workflows natively
* Pull secrets from AWS SSM Parameter Store into `.env` files during workflow runs
* End-to-end tests for GitHub Actions simulation

### Changed

* Action moved to `github-action/` subfolder

### Breaking Changes

* Action path changed from `macalbert/envilder@v1` to `macalbert/envilder/github-action@v1`
