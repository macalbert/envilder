---
name: "Resolve PR Comments"
description: "Turn PR review comments into concrete code/doc/test updates with a reviewer-ready resolution summary."
argument-hint: "PR number, comment list, or target files"
agent: "PR Resolver"
---
Resolve pull request comments end-to-end.

## Inputs

- PR number (optional)
- Comment text or review thread snippets (optional)
- Optional scope limits (files, folders, or comment IDs)

## Tasks

1. Gather comments from the active/open PR when available.
2. Process one comment at a time and prevent duplicate replies.
3. Present the proposed action or disposition, intent, verification strategy,
   scope, and validation for explicit approval. That decision intrinsically
   includes the normal factual outcome reply even if not mentioned; never ask
   for separate reply authorization or wording review before or after validation.
4. Delegate each approved artifact change through `@Change Orchestrator`.
5. Commit each artifact-changing comment separately. Prepare each comment's
   English factual reply explaining the action, answer, or decided disposition
   and why, following
   [review-response.instructions.md](../instructions/review-response.instructions.md),
   without publishing or resolving the thread.
6. After all comments and completion of the decided actions, follow
   [PR Resolver's committed-candidate guard](../agents/pr-resolver.agent.md#workflow):
   record candidate HEAD and establish a clean index and worktree (no staged or
   unstaged tracked changes or nonignored untracked files) before aggregate
   validation. Afterward, confirm unchanged HEAD and the same clean state.
   Only successful validation with every guard check established permits
   publishing each prepared reply in its existing thread and resolving the
   thread using PR Resolver's publication safeguards. If validation or any guard
   check fails, is unavailable, or cannot establish the required condition,
   publish nothing, leave threads open, report the reason, and preserve user work.
7. Use artifact-appropriate targeted and broader verification rather than
   defaulting mechanically to `pnpm test`.

## Required Output

1. `resolved_comments`: item-by-item resolution notes with file references
2. `change_results`: one verification-first result per artifact-changing comment
3. `commits`: one commit hash and URL per implemented comment
4. `validation`: commands and outcomes
5. `github_replies`: posted reply and thread-resolution state
6. `open_items`: unresolved points or reviewer clarifications needed

## Style

- Prioritize correctness and traceability.
- Keep explanations concise and evidence-based.
- Mark assumptions explicitly.
