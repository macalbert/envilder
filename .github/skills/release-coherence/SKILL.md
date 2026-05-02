---
name: release-coherence
description: >-
  Unified release coherence workflow for any component (CLI, GHA, or SDK).
  Use when bumping a version, preparing a release, or verifying that all
  documentation surfaces are updated after a version change. Orchestrates
  changelog, ROADMAP, website, and docs updates. Delegates to doc-maintenance,
  sdk-release-checklist, and doc-sync skills as needed.
---

# Release Coherence

Ensures all documentation surfaces stay aligned when releasing a new version
of **any** component: CLI, GitHub Action, or SDK (any runtime).

## When to Use

- Bumping a version of CLI, GHA, or any SDK
- After merging a feature/fix that warrants a changelog entry
- Before tagging a release to verify nothing was missed
- When asked to "prepare the release" for a component

## Components & Their Artifacts

| Component | Version Source | Changelog | Web Surfaces |
|-----------|---------------|-----------|--------------|
| CLI | `package.json` (root) | `docs/changelogs/cli.md` | DocsContent (CLI section), README |
| GHA | `package.json` (root) | `docs/changelogs/gha.md` | DocsContent (GHA section), `github-action/README.md` |
| SDK .NET | `src/sdks/dotnet/Envilder.csproj` | `docs/changelogs/sdk-dotnet.md` | DocsContent, Sdks.astro, badge |
| SDK Python | `src/sdks/python/pyproject.toml` | `docs/changelogs/sdk-python.md` | DocsContent, Sdks.astro, badge |
| SDK Node.js | `src/sdks/nodejs/package.json` | `docs/changelogs/sdk-nodejs.md` | DocsContent, Sdks.astro, badge |
| SDK Go | `src/sdks/go/` (tag) | `docs/changelogs/sdk-go.md` | DocsContent, Sdks.astro, badge |
| SDK Java | `src/sdks/java/` (TBD) | `docs/changelogs/sdk-java.md` | DocsContent, Sdks.astro, badge |

## Workflow

### Step 1 — Bump Version

Update the canonical version source file for the component.

### Step 2 — Changelog Entry

Add entry to `docs/changelogs/{component}.md` following `doc-maintenance` skill
format (categories: Added/Changed/Fixed/Documentation/Dependencies/Security).

### Step 3 — ROADMAP Update (if applicable)

Check `ROADMAP.md` for related items:

- Move completed features to appropriate status
- Update version references if roadmap tracks versions
- Skip if the release has no roadmap-tracked features

### Step 4 — Website Updates

#### For SDKs (delegate to `sdk-release-checklist` if new SDK)

- [ ] Version badge auto-updates via `astro.config.mjs` (verify build picks it up)
- [ ] Update DocsContent.astro if API changed (new methods, flags, options)
- [ ] Update Sdks.astro card if install command changed
- [ ] Update i18n keys if new strings added (`types.ts` + `en.ts`, `ca.ts`, `es.ts`)
- [ ] Changelog page sidebar already wired (no action for existing SDKs)

#### For CLI

- [ ] Update DocsContent.astro CLI section if new flags/options added
- [ ] Update `docs/pull-command.md` or `docs/push-command.md` if behavior changed
- [ ] Update root `README.md` if install or quick-start changed

#### For GHA

- [ ] Update DocsContent.astro GHA section if inputs changed
- [ ] Update `github-action/action.yml` description/inputs
- [ ] Update `github-action/README.md` and `docs/github-action.md`

### Step 5 — Cross-Reference Check

- [ ] Root `README.md` reflects current capabilities
- [ ] Examples in `examples/sdk/{runtime}/` match current API
- [ ] SDK README (`src/sdks/{runtime}/README.md`) matches current API

### Step 6 — Validate

```bash
# Build website — verifies versions resolve and pages render
cd src/website && pnpm build

# Run doc-sync skill for comprehensive drift detection
# (or manually verify key surfaces)
```

Delegate to `doc-sync` skill for full cross-surface audit if uncertain.

## Quick Reference: Minimum Actions Per Component

### CLI / GHA release (no API change)

1. Bump version in `package.json`
2. Add changelog entry
3. Done (website picks up version dynamically)

### CLI / GHA release (with new flag/input)

1. Bump version in `package.json`
2. Add changelog entry
3. Update docs (command reference, DocsContent)
4. Update README
5. Run `doc-sync`

### SDK release (no API change)

1. Bump version in source file
2. Add changelog entry
3. Done (badge auto-updates via website build)

### SDK release (with new API)

1. Bump version in source file
2. Add changelog entry
3. Update SDK README
4. Update examples
5. Update DocsContent.astro section
6. Update i18n if new strings
7. Run `doc-sync`

## Delegation Map

| Need | Delegate to |
|------|-------------|
| How to write a changelog entry | `doc-maintenance` skill |
| Full SDK wiring (new SDK, not version bump) | `sdk-release-checklist` skill |
| Drift detection across all surfaces | `doc-sync` skill |
| Website i18n workflow | `website-i18n` skill |
| Website styling/components | `website-design-system` skill |

## Anti-Patterns

| Anti-pattern | Correct approach |
|--------------|-----------------|
| Hardcoding version in website HTML | Use `__SDK_*_VERSION__` or `__CLI_VERSION__` globals |
| Updating changelog but not docs | Always check if behavior/API changed → update docs |
| Updating website but not SDK README | Both must match — SDK README is source of truth for API |
| Skipping i18n for "minor" text changes | All 3 locales must stay in sync — TypeScript catches missing keys |
| Forgetting ROADMAP after completing a tracked feature | Check ROADMAP on every release |
