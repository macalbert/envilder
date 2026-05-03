---
name: workflow-pr-sync
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
2. Determine the base branch from the optional argument; if none is
   provided, default to `main`.
3. Check if a PR already exists:
   - PowerShell: `gh pr view --json number,title,url 2>$null`
   - Bash/Zsh: `gh pr view --json number,title,url 2>/dev/null`
4. Get the **final diff** against base to understand what the PR actually
   changes: `git diff <base>...HEAD --stat` (three-dot merge-base diff).
   Use this — not the commit list — as the source of truth for the PR body.
   Commits may include merge commits or changes already in main.
5. Optionally get commits for context: `git log <base>..HEAD --oneline`
6. Generate PR title and body following the [template](./reference.md).
   **The template is mandatory** — all four sections (Summary, Changes, Testing,
   Related) must appear in every PR body, exactly in that order.
   **The body must describe the final diff vs base**, not individual commits.
7. Create or update the PR using `--body-file` (see [constraints](#constraints)).

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
- **Never use the VS Code PR creation tool** — always use `gh` CLI with
  `--body-file` to ensure template compliance and avoid encoding issues
- **All four template sections are mandatory** — do not skip, reorder, or
  replace with freeform text
- If `gh` CLI is not available, output the title and body for manual creation
- **Never use PowerShell here-strings (`@"..."@`) to generate the PR body** —
  use `create_file` to write the `.pr-body.md` file directly instead.
  Here-strings corrupt backticks (`` ` `` becomes escape char, e.g. `` `0 `` =
  NUL), arrows (`→`), em-dashes (`—`), and other non-ASCII characters.
- **Avoid non-ASCII characters in PR bodies** — use plain ASCII alternatives:
  `to` instead of `→`, `--` instead of `—`, etc.

## Commands

See [reference.md](./reference.md) for the PR body template and `gh` CLI commands.
