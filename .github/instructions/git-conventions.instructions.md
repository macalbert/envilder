---
description: "Use when performing git operations in Envilder, including branching, staging, committing, pushing, and preparing PR-ready changes. Enforces conventional commits and safe non-destructive git workflow habits."
name: "Envilder Git Conventions"
---

# Envilder Git Conventions

Apply these rules whenever making or validating git changes.

- Use non-destructive git commands by default.
- Never run destructive commands (`git reset --hard`, `git checkout --`, force history rewrites) unless explicitly requested.
- Do not revert unrelated user changes in a dirty worktree.
- Prefer non-interactive git usage and explicit command flags.
- Commit messages must follow Conventional Commits format.
- Use `<type>(<scope>): <description>` for every commit.
- Use clear, scoped commit types (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`).
- Keep commit messages specific to behavioral intent; avoid vague messages like `fixes` or `updates`.
- For breaking changes, use `!` after type/scope or include
`BREAKING CHANGE:` in the footer.
- Use branch names in `<type>/<short-kebab-topic>` format, for example `fix/ssm-timeout` or `chore/update-aws-sdk`.
- Do not amend commits unless explicitly requested.
- Before push, ensure quality checks pass: `pnpm format`, `pnpm lint`, `pnpm test`.
- Treat push as the final gate: if checks fail, fix issues first and push only after green results.

## GitHub CLI (`gh`) in PowerShell

- NEVER use inline `--body "..."` with multi-line content — PowerShell garbles encoding (hex escapes, collapsed newlines).
- Always use `--body-file` with a temp file for issue/PR bodies:

```powershell
$body = @"
## Summary
...markdown content...
"@
$body | Set-Content -Path "temp-body.md" -Encoding UTF8
gh issue create --title "..." --body-file temp-body.md --label "enhancement"
Remove-Item temp-body.md
```

- This applies to: `gh issue create`, `gh pr create`, `gh pr edit`, and any command accepting `--body`.
