---
name: doc-maintenance
description: >-
  Workflow for maintaining changelogs, READMEs, and documentation files.
  Use when adding changelog entries, updating docs after code changes,
  or synchronizing documentation with current behavior. Covers changelog
  categories, entry format, constraints, and validation.
---

# Doc Maintenance

Active maintenance workflow for Envilder documentation: changelogs, READMEs,
and `docs/` files.

**Distinction from `doc-sync`**: This skill covers *how to write and update*
documentation. The `doc-sync` skill covers *how to detect drift* across
documentation surfaces.

## When to Use

- Adding a changelog entry after a feature, fix, or dependency update
- Updating README or docs after code changes
- Writing release notes
- Verifying documentation accuracy after a change

## Scope

| Document type | Location |
|---------------|----------|
| Changelogs (per-component) | `docs/changelogs/{cli,gha,sdk-dotnet,sdk-python,sdk-nodejs}.md` |
| Root README | `README.md` |
| CLI docs | `docs/pull-command.md`, `docs/push-command.md` |
| GHA docs | `docs/github-action.md`, `github-action/README.md` |
| SDK READMEs | `src/sdks/{runtime}/README.md` |
| Architecture docs | `docs/architecture/` |
| Security docs | `docs/SECURITY.md` |

## Changelog Format

### Categories

Use these categories matching existing style:

| Category | When to use |
|----------|-------------|
| `Added` | New features or capabilities |
| `Changed` | Behavior changes to existing features |
| `Fixed` | Bug fixes |
| `Documentation` | Docs-only changes |
| `Dependencies` | Dependency updates |
| `Security` | Security-related changes |

### Entry format

- Keep bullets concise and **user-impact oriented**
- Start with action verb (Add, Fix, Update, Remove)
- Reference issue/PR numbers when available
- Group under the current release section or create a new one when requested
- Never add to a section whose version is already tagged: the release was
  built from the changelog at that tag, so the entry would describe code
  that did not ship. Open a new version section instead
  (`changelog-check.yml` enforces this; label the PR `changelog-correction`
  to fix an already released section on purpose)

```markdown
## [1.2.0]: 2026-05-01

### Added

- Add `--profile` flag for AWS named profile support (#45)

### Fixed

- Fix Azure Key Vault timeout on large secret batches (#52)
```

### Release notes

The publish workflows build each GitHub release from the version's changelog
section with `scripts/release-notes.mjs`: subsections become emoji headings,
wrapped lines are joined, relative links point at the tag, and the upgrade
commands, docs link, PR list and compare link are appended.

To give the release a subtitle and an opening summary, add an optional
`release` comment right under the version heading. The website strips HTML
comments, so it only shows on GitHub:

```markdown
## [0.19.0] - 2026-10-30

<!-- release
title: any Azure Key Vault host
summary: Azure Key Vault URLs now go to the Azure client as written, in the
CLI and the GitHub Action, as they already did in the SDKs.
-->

### Changed
```

`title` becomes `🍄 Envilder level up v0.19.0: any Azure Key Vault host`;
`summary` (which may wrap) becomes the first paragraph. Without the comment,
the release uses the plain title and starts with the first subsection.

## Workflow

1. **Identify** what changed (feature / fix / dependency / workflow / docs)
2. **Locate** impacted documentation files
3. **Update** the smallest set of sections needed for correctness
4. **Cross-check** consistency across related docs (use `doc-sync` skill
   for comprehensive audit)
5. **Validate**: run `pnpm lint` to check formatting and consistency
6. **Summarize**: list updated files and what was synchronized

## Constraints

- **Never invent features**: document only what exists in code
- **Verify claims** against current source files before writing
- **Preserve existing structure** and tone unless explicitly asked to refactor
- **Prefer documentation-only edits**: don't modify source unless asked
- **Keep examples minimal and runnable**: avoid hypothetical code
- **Don't modify ROADMAP.md** without explicit request (it's strategic)

## Validation

After documentation edits:

```bash
# Check formatting and consistency
pnpm lint

# For website-related docs, verify build
cd src/website && pnpm build
```

## Delegation

| Trigger | Delegate to | Why |
|---------|-------------|-----|
| Website pages need updating | `website-design-system` + `website-i18n` skills | UI patterns and i18n workflow |
| Unsure if documented behavior matches code | Verify against source directly | Read the actual implementation |
| Cross-surface drift suspected | `doc-sync` skill | Systematic drift detection |
| SDK docs need updating after version bump | `sdk-release-checklist` skill | Full integration checklist |
