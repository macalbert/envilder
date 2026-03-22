---
name: "PR Sync"
description: "Create or update a pull request with an auto-generated title and description from branch commits."
argument-hint: "optional base branch (default: main)"
---

Create or update a GitHub pull request for the current branch.

## Workflow

1. Get the current branch: `git branch --show-current`
2. Check if a PR already exists: `gh pr view --json number,title,url 2>$null`
3. Get commits since base: `git log main..HEAD --oneline`
4. Generate PR title and body.
5. Create or update the PR.

## PR Title

Use the conventional commit format of the **most significant** commit:

```txt
<type>(<scope>): <description>
```

If the branch has a single commit, use that commit's message as the title.

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

## Commands

Always write the PR body to a **temporary file** and use `--body-file` instead
of inline `--body`. PowerShell treats the backtick (`` ` ``) as an escape
character, which corrupts inline markdown containing code spans.

```bash
# 1. Write body to temp file (use create_file tool, NOT echo/Set-Content)
#    Path: .pr-body.md  (gitignored or deleted after use)

# 2. Create new PR:
gh pr create --base main --title "<title>" --body-file .pr-body.md

# 3. Or update existing PR:
gh pr edit --title "<title>" --body-file .pr-body.md

# 4. Clean up temp file:
Remove-Item .pr-body.md
```

## Constraints

- Never force-push or amend published commits
- Always target `main` unless user specifies otherwise
- Always use `--body-file` with a temp file — never pass markdown inline via `--body`
- If `gh` CLI is not available, output the title and body for manual creation
