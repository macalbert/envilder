---
name: doc-sync
description: 'Audit and synchronize documentation across website, READMEs, and docs/. Use when verifying docs are aligned after feature changes, SDK updates, CLI changes, or release preparation. Detects drift between website content, markdown docs, and SDK READMEs.'
argument-hint: 'feature area to audit or "full" for complete audit'
---

# Doc Sync — Cross-Surface Documentation Alignment

Audit and synchronize documentation across all surfaces to prevent drift.

## When to Use

- After adding or changing a feature, CLI flag, or SDK capability
- After updating website content (DocsContent.astro, i18n strings)
- Before a release to verify all docs reflect current behavior
- When a code review flags outdated documentation

## Documentation Surfaces

| Surface | Location | Purpose |
|---------|----------|---------|
| **Website docs** | `src/website/src/components/DocsContent.astro` | User-facing docs page with code examples |
| **Website i18n** | `src/website/src/i18n/{en,ca,es}.ts` | Translated strings for website |
| **Root README** | `README.md` | Project overview, install, quick start |
| **GHA README** | `github-action/README.md` | GitHub Action usage and inputs |
| **CLI docs** | `docs/pull-command.md`, `docs/push-command.md` | CLI command reference |
| **GHA docs** | `docs/github-action.md` | GitHub Action detailed docs |
| **SDK READMEs** | `src/sdks/{dotnet,python,typescript}/README.md` | SDK-specific install and usage |
| **SDK examples** | `examples/sdk/{dotnet,python}/README.md` | Example code with explanations |
| **Changelogs** | `docs/changelogs/{cli,gha,sdk-*}.md` | Per-component changelogs |
| **ROADMAP** | `ROADMAP.md` | Feature status tracking |

## Procedure

### 1. Identify Scope

Determine which feature area to audit:

- **CLI**: root README, `docs/pull-command.md`, `docs/push-command.md`, website DocsContent
- **GHA**: `github-action/README.md`, `docs/github-action.md`, website DocsContent
- **SDK (per runtime)**: `src/sdks/{runtime}/README.md`, `examples/sdk/{runtime}/`, website DocsContent + Sdks.astro, i18n strings
- **Full**: all surfaces

### 2. Extract Source of Truth

For each feature area, identify the authoritative source:

| Area | Source of Truth |
|------|-----------------|
| CLI flags/options | `src/envilder/apps/cli/Cli.ts` |
| GHA inputs | `github-action/action.yml` |
| SDK public API | SDK source code (`src/sdks/{runtime}/`) |
| Providers | `src/envilder/core/infrastructure/` |
| Map-file format | `secrets-map.json` (example) + copilot-instructions |

### 3. Audit Each Surface

For each documentation surface, check:

- [ ] **Code examples compile/run** — verify syntax matches current API
- [ ] **CLI flags match** — documented flags exist in `Cli.ts`
- [ ] **GHA inputs match** — documented inputs exist in `action.yml`
- [ ] **SDK methods match** — documented methods exist in source
- [ ] **Install commands correct** — package names, versions, registries
- [ ] **Provider names consistent** — `aws`/`azure` naming across all docs
- [ ] **Links not broken** — internal cross-references resolve
- [ ] **i18n complete** — all 3 locales (en, ca, es) have matching keys

### 4. Report Drift

Present findings in a structured table:

```text
## Documentation Drift Report

| Surface | File | Issue | Severity |
|---------|------|-------|----------|
| Website | DocsContent.astro | Missing --profile flag in CLI section | High |
| SDK README | src/sdks/python/README.md | load() example uses old API | High |
| Root README | README.md | Version badge outdated | Low |

## Alignment Actions

1. {file} — {what to update}
2. {file} — {what to update}
```

### 5. Apply Fixes

For each drift item:

1. Update the documentation surface
2. If i18n strings changed, update all 3 locales
3. Verify the fix against the source of truth

### 6. Validate

- Run `pnpm lint` to check for formatting issues
- For website changes, verify the build: check i18n key consistency

## Cross-Reference Matrix

Use this matrix to ensure consistency when updating a feature:

| When you change... | Also update... |
|--------------------|----------------|
| CLI flag in `Cli.ts` | `docs/pull-command.md` or `docs/push-command.md`, root README, website DocsContent, i18n (3 locales) |
| GHA input in `action.yml` | `github-action/README.md`, `docs/github-action.md`, website DocsContent, i18n |
| SDK public API | SDK README, examples README, website DocsContent + Sdks.astro, i18n |
| New provider | All provider listings: root README, website Providers.astro, DocsContent, SDK READMEs |
| Map-file format | Root README, all SDK READMEs, website DocsContent |
| ROADMAP status | `ROADMAP.md`, website Roadmap.astro |

## Constraints

- Never invent features not present in code
- Verify claims against source code before writing
- Preserve existing document structure and tone
- Keep code examples minimal and runnable
