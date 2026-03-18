---
name: "Use Semantic Versioning"
description: "Recommend the correct SemVer bump (patch/minor/major) for Envilder changes and produce release-ready commands and rationale."
argument-hint: "summarize changes or provide commit range"
agent: "agent"
---

Determine the correct Semantic Versioning bump for Envilder based on the
provided changes.

## Inputs

- Change summary, PR description, or commit range
- Optional notes about backward compatibility

## Rules

- Follow SemVer strictly:
  - `PATCH`: backward-compatible bug fixes
  - `MINOR`: backward-compatible feature additions
  - `MAJOR`: any breaking change
- Treat breaking API/CLI/action input changes as `MAJOR`.
- If uncertainty is high and release risk needs validation, you may recommend
   `prerelease` before finalizing patch/minor/major.
- If information is incomplete, state assumptions explicitly before deciding.

## Required Output

1. `recommended_bump`: `patch` | `minor` | `major` | `prerelease`
2. `why`: 2-4 bullet points tied to the provided changes
3. `breaking_changes`: `yes` | `no` with one-sentence justification
4. `commands`: exact commands for this repo
   - `pnpm version <patch|minor|major|prerelease>`
   - `git push --follow-tags`
5. `conventional_commit_examples`: 2 scoped commit message examples using
   `<type>(<scope>): <description>`
6. `confidence`: `high` | `medium` | `low`

## Style

- Be decisive and concise.
- Do not invent features or breaking changes.
- If unsure, prefer conservative guidance and explain the risk.
