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
   scope, and validation for explicit approval. Before asking, disclose that
   approval bundles implementation, staging of the separately approved exact
   patch, a separate conventional commit, any necessary non-force push to the
   actual PR head remote/branch, a factual English reply explaining action and
   reason, then confirmed resolution after the reply is confirmed. Record the
   authorization and explicit limits in the action/handoff. No action approval
   means no execution; do not ask again solely for commit/push/reply/resolve or
   generated wording. Honor local-only/no-push limits without pressure to remove
   them. Questions/disagreements/skips authorize reply/resolution only, not
   manufactured artifacts, commits, or pushes.
4. Delegate each approved artifact change through `@Change Orchestrator`.
5. Obtain explicit content approval of the exact resulting patch before staging;
   action approval never covers unseen future hunks. Material changes require
   reassessment/reapproval; candidate changes invalidate affected review/final
   results. Follow PR Resolver's frozen-patch and staged-equality guards. Commit
   each artifact-changing comment separately using `workflow-smart-commit`'s
   scoped PR Resolver message exception, retaining commitlint and hooks.
   Prepare each comment's English factual reply explaining the action, answer,
   or decided disposition and why, following
   [review-response.instructions.md](../instructions/review-response.instructions.md),
   without publishing or resolving the thread.
6. After all comments and completion of the decided actions, follow
   [PR Resolver's committed-candidate guard](../agents/pr-resolver.agent.md#workflow):
   record candidate HEAD and establish a clean index and worktree (no staged or
   unstaged tracked changes or nonignored untracked files) before aggregate
   validation. Afterward, confirm unchanged HEAD and the same clean state.
   For any artifact-changing batch, then apply PR Resolver's remote-availability
   gate: the recorded action approval authorizes a needed non-force push unless
   explicitly limited; exclude unrelated commits/user work, or wait for the
   responsible calling workflow's confirmed push handoff. Before publishing any
   reply or resolving any thread, confirm from current authoritative history that
   the actual PR remote repository's head branch contains the validated candidate
   and every corrective commit in the batch. An advanced descendant containing
   all qualifies; a commit URL, push success, stale tracking ref, wrong
   repository/branch, or unconfirmed handoff does not. Already-present commits
   need neither redundant push nor permission. Entirely no-artifact batches need
   no artifact final verification and are exempt from this push/remote gate, not
   existing approvals or aggregate guards. Require explicit final `PASS` for each
   artifact action. Only when all applicable gates pass may replies be published
   and threads resolved using PR Resolver's publication safeguards. An explicit
   limit preventing a needed push, missing scope/permissions, failed push/tool
   gates, or any failed, unavailable, or unconfirmed gate holds all replies
   (including mixed-batch questions/skips) and leaves all threads open; report
   the blocker and preserve user work. Do not bypass failures by rebasing,
   merging, or rewriting history; local candidate changes require the existing
   stop/review/revalidation guards.
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
