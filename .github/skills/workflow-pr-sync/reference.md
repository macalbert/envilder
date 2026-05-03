# PR Sync — Reference

## PR Body Template

**All four sections below are mandatory.** Do not skip, reorder, or replace
with freeform text. Use `N/A` for sections that don't apply.

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

{link to issue if branch name contains issue number, e.g., #42. Otherwise: N/A}
```

## `gh` CLI Commands

Always write the PR body to a **temporary file** and use `--body-file` instead
of inline `--body`. PowerShell treats the backtick as an escape character, which
corrupts inline markdown containing code spans.

### Writing the temp file

**ALWAYS use the `create_file` tool** to write `.pr-body.md`. Never use
PowerShell here-strings (`@"..."@`) or `Set-Content` with inline text.

PowerShell here-strings corrupt:

| Character | Corrupted as | Reason |
|-----------|-------------|--------|
| `` ` `` (backtick) | escape char | `` `0 `` = NUL, `` `n `` = newline |
| `→` (arrow) | `ÔåÆ` | UTF-8 bytes misread as Windows-1252 |
| `—` (em-dash) | `ÔÇö` | Same encoding mismatch |

**Safe approach:**

```txt
1. Use create_file tool to write .pr-body.md with the body content
2. Run: gh pr create --base main --title "<title>" --body-file .pr-body.md
3. Run: Remove-Item .pr-body.md
```

**Avoid non-ASCII in PR bodies** — prefer `to` over `→`, `--` over `—`.

```powershell
# Create new PR:
gh pr create --base <base> --title "<title>" --body-file .pr-body.md

# Or update existing PR:
gh pr edit --title "<title>" --body-file .pr-body.md

# Clean up temp file:
Remove-Item .pr-body.md
```

## Quality Gate

Before creating or updating a PR, verify:

1. `pnpm format` — auto-format
2. `pnpm lint` — secretlint + biome + tsc
3. `pnpm test` — vitest with coverage

If any check fails, fix issues first.
