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

**Create new PR:**

```bash
gh pr create --base main --title "<title>" --body "<body>"
```

**Update existing PR:**

```bash
gh pr edit --title "<title>" --body "<body>"
```

## Constraints

- Never force-push or amend published commits
- Always target `main` unless user specifies otherwise
- If `gh` CLI is not available, output the title and body for manual creation
