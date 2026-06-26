# ADR-0011: Local Override Map File

## Status

Accepted

## Context

A committed map file (`envilder.json`) is the shared, PR-reviewed contract for a
project. But some values are **per-developer**, not per-project. The driving case
is the AWS `profile`: a committed `$config.profile` forces every developer onto
one named profile, and because `$config.profile` takes precedence over the
`AWS_PROFILE` environment variable in
`src/envilder/core/infrastructure/aws/AwsSecretProviderFactory.ts`, a hardcoded
profile actively defeats each developer's own credentials. Beyond the profile,
developers occasionally need to redirect a single mapping to a personal secret
path, switch provider locally, or add a machine-only variable — without editing
the shared file or polluting a PR.

Two narrower mechanisms exist but do not cover the general case:

1. **`AWS_PROFILE`** resolves the profile case once the committed file stops
   hardcoding `profile` — but only the profile, nothing else.
2. **One map file per environment + `--map`** selects a whole file, but offers no
   layering: a developer cannot keep the shared mappings and override just one.

The need is a **personal, gitignored layer** on top of the committed base — the
same mental model as dotenv's `.env.local`.

## Decision

### 1. The golden rule

For any base map file `XXXXX.json`, if a sibling `XXXXX.local.json` exists in the
same directory, it is **always** layered on top. The override name is *derived*
from the base by inserting `.local` before the extension
(`envilder.json` → `envilder.local.json`, `config/prod.json` →
`config/prod.local.json`). The override file has no override of its own
(`XXXXX.local.local.json` is never sought). When the file is absent, behavior is
unchanged.

### 2. Layering semantics

The two sections of a map file merge differently because they have different
shapes:

- **`$config` is replaced wholesale.** A `$config` describes one coherent
  connection to one provider. Merging it field-by-field across the base and the
  override produces incoherent mixes (e.g. an Azure `vaultUrl` next to a leftover
  AWS `profile`). So: if the override carries a `$config`, it replaces the base's
  entirely; if it does not, the base's `$config` stands.
- **Variable mappings merge per key.** Mappings are independent
  `VAR → path` entries. An override key replaces the same base key; base-only
  keys are kept; override-only keys are added.

### 3. Precedence

The full chain is `CLI flag > local override > base`. A CLI flag
(`--profile`, `--provider`, `--vault-url`) is an explicit one-off and must beat
the per-machine default. This preserves the existing `flags > $config` rule and
inserts the local layer between flags and base. An incoherent result (e.g. the
override forces Azure while `--profile` is passed) is rejected by the existing
cross-provider validation rather than silently merged.

### 4. Scope: all surfaces

The override applies in the **CLI, the GitHub Action, and every runtime SDK**.
Applying it everywhere keeps one mental model ("if the file exists, it wins")
regardless of how the code runs. This matches the dotenv `.env.local` precedent,
which auto-loads across CLIs, frameworks, and running apps alike.

### 5. Guardrails

Because the override can redirect *which cloud identity and which secrets* load —
not merely override a literal value as dotenv does — three guardrails are
mandatory:

- **Visible warning on every application.** Whenever a local override is merged,
  a warning is emitted (e.g. `⚠ local override applied: envilder.local.json`).
  In the SDKs this is a *deliberate exception* to the silent-by-default rule
  (ADR-0003 / ADR-0010): a silent identity redirect is worse than a log line, and
  the warning is what makes an accidental leak detectable.
- **Cross-language opt-out `ENVILDER_NO_LOCAL`.** Setting it disables override
  resolution deterministically. CI and production use it as a belt-and-suspenders
  kill switch. A single, uniform mechanism across all four surfaces.
- **`.dockerignore` documented as a hard requirement.** `*.local.json` must be
  excluded from build contexts, because `.gitignore` does not protect built
  artifacts (a `COPY . .` without `.dockerignore` would bake a developer's local
  override into a production image).

No environment auto-detection (`NODE_ENV` / `ASPNETCORE_ENVIRONMENT`) is used:
the "production" signal is not uniform across languages and would reintroduce the
environment-selection question this feature deliberately avoids. The trigger is
file presence; the opt-out is explicit.

## Considered Options

- **`AWS_PROFILE` only (no feature).** Solves ~80% of the pain (the profile) with
  zero new code. Rejected as the *sole* solution because it cannot redirect
  mappings, switch provider, or add machine-only variables.
- **CLI-only override.** Lowest blast radius and naturally git-protected (CLI/GHA
  run from git checkouts where gitignored files are absent). Rejected because it
  breaks the "if it exists, it wins" rule precisely in the SDK — the most natural
  place a developer runs their own app locally.
- **Field-level `$config` merge.** Rejected: produces incoherent cross-provider
  configs (see §2).
- **Environment-gated SDK behavior.** Rejected: no uniform cross-language
  "production" signal; reintroduces environment selection.

## Consequences

- **SDK-in-production risk is accepted knowingly.** If a `*.local.json` leaks into
  a built artifact (missing `.dockerignore`), an SDK will apply it in production.
  This is the same risk the dotenv `.env.local` ecosystem accepts; it is mitigated
  by the mandatory warning, the `ENVILDER_NO_LOCAL` opt-out, and documented
  `.dockerignore` guidance — not eliminated.
- **The SDK silent-by-default rule gains one documented exception** — the local
  override warning.
- **New merge surface across four codebases.** The CLI core and each SDK gain
  identical layering + precedence + cross-provider validation logic, kept aligned
  as a shared convention (not shared code, per ADR-0003).
- **The committed `envilder.json` should stop hardcoding a personal `profile`**,
  so that `AWS_PROFILE` and the local override — not a baked-in value — drive the
  per-developer profile.

## Relationship to ADR-0010

A missing or non-existent AWS profile is surfaced as a typed, actionable error
(ADR-0010 pattern), never a silent fallback to the `default` profile. Silently
switching identity in a secrets tool is the failure mode this feature and ADR-0010
both reject.
