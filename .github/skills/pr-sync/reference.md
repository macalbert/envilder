# PR Sync — Reference

## PR Body Template

```markdown
## Summary

{2-3 sentence overview of what changed and why}

## Changes

{bullet list of key changes, grouped by scope}

## Testing

- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] Manual verification (if applicable)

## Related

{link to issue if branch name contains issue number, e.g., #42}
```

## `gh` CLI Commands

Always write the PR body to a **temporary file** and use `--body-file` instead
of inline `--body`. PowerShell treats the backtick as an escape character, which
corrupts inline markdown containing code spans.

```powershell
# 1. Write body to a temp file (.pr-body.md, gitignored or deleted after use)

# 2. Create new PR (use <base>=main unless targeting a different branch):
gh pr create --base <base> --title "<title>" --body-file .pr-body.md

# 3. Or update existing PR:
gh pr edit --title "<title>" --body-file .pr-body.md

# 4. Clean up temp file:
Remove-Item .pr-body.md
```

## Quality Gate

Before creating or updating a PR, verify:

1. `pnpm format:write` — auto-format
2. `pnpm lint` — secretlint + biome + tsc
3. `pnpm test` — vitest with coverage

If any check fails, fix issues first.
