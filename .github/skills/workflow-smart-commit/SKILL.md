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
3. Analyze the changes: identify the dominant change type and scope.
4. Generate a conventional commit message following the [format](#commit-message-format), [rules](#rules), and [scope heuristics](./reference.md).
5. Present the commit message for user approval, except only when PR Resolver
   has recorded approval of the disclosed comment action/lifecycle and separate
   explicit content approval of the exact resulting patch. In that case, use the
   generated conventional message without repeated wording permission.
6. Run `git commit -m "<message>"` after message approval, or under that narrow
   PR Resolver exception once all its pre-commit gates pass, including final
   `PASS` and exact staged-patch equality. For that exception, PR Resolver must
   first have prepared every applicable mutating commit hook through its
   enabled repository-supported staged-hook path, then re-reviewed, freshly
   verified, and obtained exact-patch approval for the resulting candidate.
   Final `PASS` and staged equality alone are never sufficient: use ordinary
   enabled hooks for the commit and require PR Resolver's post-commit
   parent/diff/scope integrity guard before treating it as successful. Honor
   recorded limits and retain conventional format, required trailers,
   commitlint, hooks, and host gates.
   Standalone Smart Commit and every unrelated workflow still require message
   approval. This exception never authorizes unseen hunks or bypasses PR
   Resolver's reassessment/reapproval guards for material or candidate changes.

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
- Breaking changes: add `!` after scope: `feat(cli)!: remove --legacy flag`

## Constraints

- Never commit unstaged changes
- Never use `--no-verify`
- If nothing is staged, tell the user to stage changes first
- Never infer that a generic formatter or command exercised Lefthook
  `stage_fixed` behavior; only PR Resolver's repository-supported preparation
  protocol can authorize its lifecycle exception. `--no-stage-fixed` is
  prohibited.
