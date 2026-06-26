# ADR-0010: Actionable Errors and Centralized CLI Error Presentation

## Status

Accepted

## Context

Error handling in Envilder is currently coarse. Infrastructure adapters wrap
almost every non-`ParameterNotFound` failure into a generic
`SecretOperationError` carrying a raw provider message. When an AWS SSO / IAM
Identity Center session is missing or expired (the user never ran
`aws sso login`, or the cached token lapsed), the CLI surfaces a cryptic message
and exits — giving no guidance on how to recover. The SSO fix in #364 made valid
profiles resolve correctly, but the *failure* path remains unfriendly.

Two constraints shape the solution:

1. **SDKs are silent-by-default** (architecture) and run in non-interactive
   contexts (CI, containers, app startup). They participate in messaging *only*
   through the text of the errors they throw — never proactive console output.
2. **SDKs are independent** (ADR-0003) — there is no shared code across the CLI
   core and the runtime SDKs. Any "unification" can only be a shared *convention*
   (error types, structured data, default wording), not a shared library.

A distinct, interactive consumer exists — the CLI — where richer presentation
(colors, layout, a profile-loaded confirmation, and an optional
`aws sso login` redirect) is appropriate.

## Decision

### 1. Typed, data-carrying domain errors

Actionable failure conditions are modeled as typed errors extending the existing
`DomainError` base. Each carries **structured data** plus a sensible **default
message** built in its constructor — exactly the pattern already used by
`ParameterNotFoundError` (which carries `paramName`).

The first instance is `SsoSessionExpiredError`, carrying the `profileName`. This
lets the CLI react by **type** (robust) instead of string-matching provider
messages, and lets SDK consumers `catch` it programmatically.

### 2. Single CLI error-presentation point

The CLI's lone catch site (`apps/cli/Index.ts` `main().catch(...)`) is refactored
into a dedicated `CliErrorPresenter`. This is the **one place** that maps an
error type to its interactive rendering: icon, colour, layout, remediation hint,
and — for `SsoSessionExpiredError` — the optional `aws sso login` redirect.
Centralizing here means the CLI's wording and styling are restyled in one spot,
not scattered per error.

### 3. SDKs replicate the pattern, not the presentation

Each SDK defines the equivalent typed errors (same names, same structured data,
same default message wording) so a caught error is self-describing. SDKs do
**not** ship the rich presenter and stay silent-by-default. Their participation
in messaging is the thrown error's default message only.

### 4. The cross-stack convention

What is "unified" is the *contract*, not the code: identical error types,
identical structured data, and identical default-message wording across the CLI
and every SDK. The rich, interactive presentation is exclusive to the CLI.

### 5. Message quality bar

Every error message and remediation — CLI output and SDK error text alike — must
clear this bar:

- **Plain and direct.** Written for a broad developer audience; no internal
  jargon, no provider stack-trace noise leaking through. A reader should
  understand what went wrong without prior Envilder knowledge.
- **Actionable, step-by-step.** State the problem in one line, then the exact
  steps to fix it (e.g. *"Run `aws sso login --profile dev`, then retry"*).
  Never just report a failure without a path forward.
- **Professional and calm.** No blame, no cute noise in the *failure* path
  (the playful tone in the success path stays; errors are reassuring and
  precise).
- **Keyword-anchored.** Surface the concrete nouns that let a user search/act:
  the profile name, the command to run, the provider.
- **CLI = aesthetically formatted** (colour, icon, layout, indentation) via the
  `CliErrorPresenter`. **SDK = clean plain text** in the thrown error — no ANSI
  colour (it may land in logs/JSON), but the same clarity and steps.

## Consequences

- **More public API surface per stack** — each runtime gains new public error
  types. This is a breaking-by-addition contract that is hard to reverse, which
  is why it is recorded here.
- **Per-stack SSO detection** — each adapter must recognize its native SSO
  failure (AWS SDK v3 token error, boto3 `UnauthorizedSSOTokenError` /
  `SSOTokenLoadError`, .NET SSO token resolution) and translate it to the shared
  typed error.
- **Redirect must be guarded** — the `aws sso login` redirect is CLI-only,
  TTY-gated (never spawned in CI / non-interactive shells), and prompts before
  launching. It is never part of any SDK.
- **Profile-loaded confirmation** is CLI-only output, must not leak secret
  values, and reports only non-sensitive context (profile name, region).

## Sibling case: Azure

The same actionable-error shape applies to Azure, where `DefaultAzureCredential`
fails when no credential in its chain is usable (e.g. the user never ran
`az login`, or the Entra ID token lapsed). The remediation is `az login`.

Two differences make Azure fuzzier and keep it out of the initial scope:

1. `DefaultAzureCredential` is a **chain**, so a failure means "no credential
   worked", not "this profile's token expired" — the remediation is less
   deterministic (could be `az login`, service-principal env vars, or managed
   identity).
2. Azure has **no profile concept** (tenants/subscriptions instead), so an
   `AzureLoginRequiredError` would carry the vault URL, not a profile name.

The base pattern is provider-agnostic by design. The AWS case is implemented
first (scope of #364); the Azure sibling (`AzureLoginRequiredError` →
`az login`) is a tracked follow-up.
