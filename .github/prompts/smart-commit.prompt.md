---
name: "Smart Commit"
description: "Analyze staged changes and create a conventional commit with an auto-generated message."
argument-hint: "optional scope override or commit type hint"
---

Create a conventional commit from the current staged changes.

## Workflow

1. Run `git diff --cached --stat` to see what's staged.
2. Run `git diff --cached` to read the full diff.
3. Analyze the changes — identify the dominant change type and scope.
4. Generate a conventional commit message following the rules below.
5. Present the commit message for user approval.
6. Run `git commit -m "<message>"` after approval.

## Commit Message Rules

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```txt
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build, CI, tooling, dependencies |
| `style` | Formatting (no logic change) |
| `perf` | Performance improvement |

### Scopes (Envilder-specific)

| Scope | Area |
|-------|------|
| `cli` | CLI entry point (`src/envilder/apps/cli/`) |
| `gha` | GitHub Action (`src/envilder/apps/gha/`) |
| `ssm` | AWS SSM provider |
| `domain` | Domain entities, ports, errors |
| `app` | Application layer handlers |
| `infra` | Infrastructure adapters |
| `e2e` | End-to-end tests |
| `dx` | Developer experience, tooling |

### Rules

- Description: imperative mood, lowercase, no period, max 72 chars
- Body: wrap at 72 chars, explain *why* not *what*
- If changes span multiple scopes, use the most significant one
- Breaking changes: add `!` after scope — `feat(cli)!: remove --legacy flag`

## Constraints

- Never commit unstaged changes
- Never use `--no-verify`
- If nothing is staged, tell the user to stage changes first
