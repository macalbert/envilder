---
name: workflow-smart-commit
description: 'Analyze staged changes and create a conventional commit with an auto-generated message. Use when committing code, staging changes, or generating commit messages.'
argument-hint: 'optional scope override or commit type hint'
---

# Smart Commit

Analyze staged changes and create a conventional commit message.

## When to Use

- Creating a commit from staged changes
- Generating a commit message that follows project conventions
- Verifying commit message format before committing

## Procedure

1. Run `git diff --cached --stat` to see what's staged.
2. Run `git diff --cached` to read the full diff.
3. Analyze the changes — identify the dominant change type and scope.
4. Generate a conventional commit message following the [format](#commit-message-format), [rules](#rules), and [scope heuristics](./reference.md).
5. Present the commit message for user approval.
6. Run `git commit -m "<message>"` after approval.

## Commit Message Format

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

### Scopes

See [reference.md](./reference.md) for the full scope table.

### Rules

- Description: imperative mood, lowercase, no period, max 72 chars
- Body: wrap at 72 chars, explain *why* not *what*
- If changes span multiple scopes, use the most significant one
- Breaking changes: add `!` after scope — `feat(cli)!: remove --legacy flag`

## Constraints

- Never commit unstaged changes
- Never use `--no-verify`
- If nothing is staged, tell the user to stage changes first
