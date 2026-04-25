---
name: pr-sync
description: 'Create or update a GitHub pull request with an auto-generated title and description from branch commits. Use when opening a PR, syncing PR description, or preparing a branch for review.'
argument-hint: 'optional base branch (default: main)'
---

# PR Sync

Create or update a GitHub pull request for the current branch.

## When to Use

- Opening a new pull request
- Updating an existing PR title or description after new commits
- Preparing a branch for code review

## Procedure

1. Get the current branch: `git branch --show-current`
2. Check if a PR already exists: `gh pr view --json number,title,url 2>$null`
3. Get commits since base: `git log main..HEAD --oneline`
4. Generate PR title and body following the [template](./reference.md).
5. Create or update the PR using `--body-file` (see [constraints](#constraints)).

## PR Title

Use the conventional commit format of the **most significant** commit:

```txt
<type>(<scope>): <description>
```

If the branch has a single commit, use that commit's message as the title.

## Constraints

- Never force-push or amend published commits
- Always target `main` unless the user specifies otherwise
- **Always use `--body-file` with a temp file** — never pass markdown inline
  via `--body` (PowerShell corrupts backticks in inline strings)
- If `gh` CLI is not available, output the title and body for manual creation

## Commands

See [reference.md](./reference.md) for the PR body template and `gh` CLI commands.
