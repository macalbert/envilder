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
   For any artifact-changing batch, then apply PR Resolver's remote-availability
   gate: push only if needed and explicitly user-approved, or wait for the
   responsible calling workflow to push. Before publishing any reply or resolving
   any thread, confirm from current authoritative history that the actual PR
   remote repository's head branch contains the validated candidate and every
   corrective commit in the batch. An advanced descendant containing all qualifies;
   a commit URL, push success, stale tracking ref, wrong repository/branch, or
   unconfirmed handoff does not. Already-present commits need no push or push
   approval. Entirely no-artifact batches are exempt only from this push/remote
   gate, not existing approvals or aggregate guards. Only when all applicable
   gates pass may replies be published and threads resolved using PR Resolver's
   publication safeguards. Missing needed push approval, failed push, or any
   failed, unavailable, or unconfirmed gate holds all replies (including mixed-batch
   questions/skips) and leaves all threads open; report the blocker and preserve
   user work. Do not bypass failures by rebasing, merging, or rewriting history;
   local candidate changes require the existing stop/review/revalidation guards.
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
