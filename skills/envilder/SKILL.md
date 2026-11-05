---
name: envilder
description: >-
  Integrate Envilder into an application: map its environment variables to
  AWS SSM Parameter Store or Azure Key Vault secrets in a versioned
  envilder.json, validate the map file, and use that one contract for local
  development (envilder exec or pull), GitHub Actions
  (macalbert/envilder/github-action) and runtime SDKs (.NET, Python, Node.js).
  Use when the user mentions Envilder or envilder.json, or wants to move .env
  files or hardcoded secrets to AWS SSM or Azure Key Vault, or load cloud
  secrets in CI or at runtime. Never reads or prints secret values.
license: MIT
compatibility: >-
  Needs Node.js 22.12+ to run the envilder CLI with npx. Commands that call
  AWS or Azure need the user's cloud credentials.
metadata:
  homepage: https://envilder.com
  repository: https://github.com/macalbert/envilder
---

# Envilder

Envilder keeps **one versioned secret contract across local development,
CI/CD and runtime**: `envilder.json` maps each environment variable name to a
secret identifier in AWS SSM Parameter Store or Azure Key Vault. The file holds
names and paths, never values, so it is committed and reviewed like code. The
cloud provider stays the source of truth.

Use the existing Envilder CLI, GitHub Action and SDKs. Do not write custom
secret-loading code, and do not add Envilder features to the user's project.

## Safety rules (always)

1. **Never read, print, log, commit or invent a secret value.** When you need
   the variables of a `.env` file, read only the names, for example
   `grep -oE '^[[:space:]]*(export[[:space:]]+)?[A-Za-z_][A-Za-z0-9_./-]*=' .env`.
   Do not `cat` a `.env` file or a secret-bearing config file.
2. **Classify every Envilder command before running it** and ask for explicit
   approval for anything above "offline":

   | Class | Commands | Run it? |
   |-------|----------|---------|
   | Offline | `npx envilder --version`, `--help`, `npx envilder validate --offline` | Yes |
   | Checks existence (calls the provider, reads no value) | `npx envilder validate` | Ask first: it uses the user's credentials and prints the cloud identity |
   | Reads values | `npx envilder` (pull to `.env`), `envilder exec`, `validate --compare-values`, running code that calls an SDK `load`/`resolve` | Only when the user explicitly asks for that run |
   | Writes secrets | `envilder --push`, single-secret push (`--key`/`--value`/`--secret-path`) | Never run it yourself. Give the user the command to run |

3. Never put a secret value on a command line you run or suggest with a real
   value filled in (shell history, process lists, logs). Use placeholders.
4. Do not weaken existing controls: keep `.env` files ignored by Git, keep
   least-privilege IAM/RBAC, keep secret masking in CI.

## Check what is available first

Envilder evolves quickly. Before using an option, confirm it exists in the
version the project will run:

- CLI: `npx envilder --version` and `npx envilder <command> --help`
  (`validate --envfile`, `--compare-values` and `--format json` are newer
  than `validate` itself).
- GitHub Action: read `github-action/action.yml` at the ref you pin (for
  example `gh api 'repos/macalbert/envilder/contents/github-action/action.yml?ref=v0' -H 'Accept: application/vnd.github.raw'`).
- SDKs: the installed package version and its README.

If something you need is missing, say so. Do not emulate it with custom code.

## Workflows

Pick the workflow that matches the request. Most integrations run 1, 2, then
3 to 5 as needed.

### 1. Initialize Envilder in an existing project

1. Inventory the variables the application reads, without reading values:
   `process.env.X`, `os.environ`/`os.getenv`, `Environment.GetEnvironmentVariable`,
   `IConfiguration` keys, `.env.example`, `docker-compose*.yml` `environment:`,
   and `${{ secrets.X }}` in `.github/workflows/`. Note which are secrets and
   which are plain configuration (ports, flags, URLs without credentials).
   Only secrets belong in `envilder.json`.
2. Choose the provider from what the project already uses (AWS CDK or AWS
   credentials: `aws`; Azure resources or `azure/login`: `azure`). If unclear,
   ask. Envilder runs only `aws` and `azure`.
3. Choose a secret path convention with the user, consistent with any existing
   one (for example `/<app>/<environment>/<name>`). Keep one map file per
   environment when values differ per environment (for example
   `config/dev/envilder.json`, `config/prod/envilder.json`).
4. Write `envilder.json` (see [map file reference](references/map-file.md)),
   then run `npx envilder validate --offline --map=<path>` and fix every
   reported problem.
5. Report which variables were mapped, which were left out and why, and which
   secrets must exist in the provider before anything can resolve them.

### 2. Configure or review secret mappings

- Follow [references/map-file.md](references/map-file.md) for keys, values,
  `$config`, Azure name translation and the checks to run.
- Compare the variables the code reads with the keys in the map file and
  report **missing mappings** (read by code, not mapped) and **stale mappings**
  (mapped, never read). Do not delete a stale mapping without asking.
- Never fill a mapping with a guessed path for a secret you could not confirm:
  propose it and mark it as unconfirmed.
- Schema-valid providers that Envilder cannot run yet (`gcp`, `hashicorp`,
  `file`) fail validation with `Unsupported provider`. Do not use them.

### 3. Local development

Prefer, in this order:

1. `npx envilder exec --map=<path> -- <the project's dev command>`: values go
   only into the child process environment, nothing is written to disk. Wire it
   into the existing task runner (an npm script, Makefile target,
   `launchSettings`, VS Code task) instead of a new script.
2. `npx envilder --map=<path> --envfile=.env` (pull) only when a tool needs a
   file. Make sure `.env` is in `.gitignore` first.
3. The runtime SDK, only when workflow 5 applies.

AWS profiles go in `$config.profile` or `--profile`; Azure needs a signed-in
identity (`az login`) and `vaultUrl`. Details: [references/ci-and-local.md](references/ci-and-local.md).

### 4. CI/CD with GitHub Actions

Use `macalbert/envilder/github-action` with short-lived credentials (GitHub
OIDC through `aws-actions/configure-aws-credentials` or `azure/login`), job
permissions `id-token: write` and `contents: read`, and a role scoped to the
mapped paths. Check the inputs of the ref you pin. Patterns, permissions and
pitfalls: [references/ci-and-local.md](references/ci-and-local.md).

### 5. Runtime integration (SDKs)

Default to **deployment-time injection** (exec, the GitHub Action, or the
platform's own secret injection): the application keeps reading plain
environment variables and needs no new dependency. Add a runtime SDK only when
it is clearly better, for example when there is no deployment step that can
inject (a long-lived container reading secrets at startup) or the app already
uses `IConfiguration`-style configuration providers. APIs and examples:
[references/runtime-sdks.md](references/runtime-sdks.md).

### 6. Migrate an existing `.env` or hardcoded secrets

1. List the `.env` keys (names only, rule 1) and the secrets hardcoded in code
   or config. For hardcoded values, do not copy them anywhere: tell the user
   which file and line holds one and that it must be rotated.
2. Write the map file for those keys (workflow 1) and validate it offline.
3. Give the user the push command to run themselves:
   `npx envilder --push --envfile=.env --map=<path>`. It creates or updates each
   mapped secret from the `.env` values.
4. Switch local development to `exec` (workflow 3) and CI to the Action
   (workflow 4). Removing the old `.env` and rotating exposed secrets are the
   user's decision; recommend both.

## Finish with a report

State what changed (files), the validation commands you ran and their result,
every assumption (provider, paths, unconfirmed mappings), and what the user
must still do (create or push secrets, IAM/RBAC, OIDC trust, rotation).
