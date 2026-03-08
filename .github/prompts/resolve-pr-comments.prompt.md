---
name: "Resolve PR Comments"
description: "Turn PR review comments into concrete code/doc/test updates with a reviewer-ready resolution summary."
argument-hint: "PR number, comment list, or target files"
agent: "PR Comment Resolver"
---
Resolve pull request comments end-to-end.

## Inputs

- PR number (optional)
- Comment text or review thread snippets (optional)
- Optional scope limits (files, folders, or comment IDs)

## Tasks

1. Gather comments from the active/open PR when available.
2. Group feedback by topic and implementation risk.
3. Apply the smallest safe changes to resolve each item.
4. Update tests/docs when behavior or usage changes.
5. Validate with `pnpm lint` and `pnpm test` unless explicitly skipped.

## Required Output

1. `resolved_comments`: item-by-item resolution notes with file references
2. `code_changes`: concise per-file summary
3. `validation`: commands and outcomes
4. `open_items`: unresolved points or reviewer clarifications needed
5. `reviewer_reply`: short PR reply ready to post

## Style

- Prioritize correctness and traceability.
- Keep explanations concise and evidence-based.
- Mark assumptions explicitly.
