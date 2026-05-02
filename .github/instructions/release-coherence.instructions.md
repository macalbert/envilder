---
description: >-
  Triggered when version source files are modified. Enforces the release-coherence
  workflow: changelog, ROADMAP, website, and documentation must be updated together
  with any version bump.
name: "Release Coherence Guard"
applyTo:
  - "package.json"
  - "src/sdks/dotnet/Envilder.csproj"
  - "src/sdks/python/pyproject.toml"
  - "src/sdks/nodejs/package.json"
  - "src/sdks/go/**"
  - "src/sdks/java/**"
  - "github-action/action.yml"
---

# Release Coherence Guard

When a version source file is being modified, **always load and follow** the
`release-coherence` skill before completing the task.

## Mandatory Steps

1. **Load the skill**: Read `.github/skills/release-coherence/SKILL.md`
2. **Identify the component** being released (CLI, GHA, or SDK-{runtime})
3. **Follow the workflow** from the skill (changelog → ROADMAP → website → validate)
4. **Confirm** all surfaces are updated before marking work as complete

## Version Source Files

| File | Component |
|------|-----------|
| `package.json` (root) | CLI + GHA |
| `src/sdks/dotnet/Envilder.csproj` | SDK .NET |
| `src/sdks/python/pyproject.toml` | SDK Python |
| `src/sdks/nodejs/package.json` | SDK Node.js |
| `src/sdks/go/` | SDK Go |
| `src/sdks/java/` | SDK Java |
| `github-action/action.yml` | GHA |

## Do NOT

- Bump a version without adding a changelog entry
- Update code without checking if docs/website need changes
- Skip the ROADMAP check if the release completes a tracked feature
- Leave i18n keys incomplete (all 3 locales must match)
