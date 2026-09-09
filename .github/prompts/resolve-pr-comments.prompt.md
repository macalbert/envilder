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
   For every batch, apply PR Resolver's remote-availability gate: the recorded
   action approval authorizes a needed non-force push unless explicitly
   limited; exclude unrelated commits/user work, or wait for the responsible
   calling workflow's confirmed push handoff. Immediately before
   qualifying remote availability, derive and record the actual PR remote
   repository, head branch, and immutable remote head through authoritative PR
   inspection; this preliminary inspection does not authorize publication, and
   missing, stale, or ambiguous inspection blocks. The actual remote head
   qualifies only if it exactly equals the committed
   fully validated candidate for which all affected reviews, qualifying final
   `PASS`, aggregate validation, and clean committed-candidate checks passed,
   or if it advanced, contains every corrective commit, and has documented fresh
   successful reruns of all affected reviews, qualifying final `PASS`,
   aggregate validation, and clean committed-candidate checks specifically for
   that exact advanced remote head.
   Reachability alone is necessary but insufficient. A commit URL, push success,
   stale tracking ref, tree or text similarity, another remote, the base or an
   unrelated branch, or unconfirmed handoff does not qualify; missing or ambiguous identity,
   reachability, or rerun evidence blocks. Already-present commits need neither
   redundant push nor permission. After all applicable checks, immediately
   before **every** reply and again immediately before **every** thread
   resolution, repeat authoritative PR inspection and prove the actual PR
   remote repository, head branch, and immutable current SHA exactly equal the
   fully validated candidate's repository/branch/SHA tuple. No earlier inspection,
   stale evidence, or absence of a push authorizes publication. If the identity
   or SHA differs, treat the actual head as a fresh candidate: establish its
   unambiguous PR repository/branch identity, rerun all affected reviews, qualifying final
   `PASS`, aggregate validation, and clean committed-candidate checks
   specifically for that exact SHA, re-establish reachability, then repeat the
   final inspection. If inspection is unavailable or ambiguous, or changes
   again, fail closed and publish or resolve nothing until that prescribed route
   finishes for the then-current exact head. Entirely no-artifact batches need
   no artifact final verification, but are not exempt from the remote gate,
   exact remote-tuple equality, mandatory candidate Reviewer approval, aggregate
   validation, or committed-candidate guards; lack of a push does not bypass
   any of them. Require a `candidate-review` Reviewer `Verdict: APPROVE` for
   every candidate that can authorize publication; do not use a
   `NON_BEHAVIORAL_CHANGE` review omission at this boundary. Immediately after
   `APPROVE`, Reviewer alone records the exact current-worktree candidate's
   baseline/current `HEAD`, a 64-hex SHA-256 computed over the raw bytes emitted by
   exactly `git diff --binary HEAD`, and the changed-path set emitted by
   `git diff --name-only HEAD`; runs and records `git diff --check HEAD` and
   `pnpm format:check`; then recaptures `HEAD`, raw-byte SHA-256, and path set.
   Any `HEAD`, hash, or path-set drift invalidates the approval and evidence,
   elevates the worktree to a fresh candidate, and requires a fresh
   candidate-review approval and complete evidence protocol. Failed, missing,
   or ambiguous Reviewer-owned static evidence blocks. A fresh read/search-only Final Verifier executes no
   commands: it validates source policy and reconciles/attributes that
   Reviewer-owned evidence to the exact reviewed candidate. It may return
   literal final `PASS` only if the approved candidate identity, hash, and scope
   remained unchanged, all required static evidence passed, and source meets
   the current contract. For an advanced remote SHA, repeat affected review
   (including this protocol), literal final `PASS`, aggregate validation, and
   clean candidate checks specifically for that SHA before reinspection.
   Only when all applicable gates pass may replies be published and threads
   resolved using PR Resolver's publication safeguards. An explicit limit
   preventing a needed push, missing scope/permissions, failed push/tool gates,
   or any failed, unavailable, or unconfirmed gate holds all replies (including
   mixed-batch questions/skips) and leaves all threads open; report the blocker
   and preserve user work. Never reset, rebase, merge, or rewrite history to
   force equality or bypass failures; local candidate changes require the
   existing stop/review/revalidation guards.
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
