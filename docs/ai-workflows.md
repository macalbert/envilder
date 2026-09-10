# AI Workflows

This document describes the AI-assisted engineering system configured for
Envilder through Copilot agents, prompts, skills, instructions, and repository
quality gates.

## Vision

Envilder uses verification-first orchestration without prescribing one
implementation method. AI-generated changes must:

- satisfy explicit requirements and invariants;
- use implementation-independent executable evidence;
- preserve architecture, compatibility, security, and scope constraints;
- receive independent evaluation; and
- pass the same relevant quality gates as human-written changes.

## Guardrail Layers

```text
CI and repository checks
          |
Pre-commit hooks
          |
Specialized agents
          |
Domain skills
          |
Path instructions
          |
Repository instructions
```

| Layer | Role |
| --- | --- |
| Repository instructions | Architecture, commands, testing, and Git conventions |
| Path instructions | Rules for TypeScript layers, tests, releases, and reviews |
| Skills | Normative reusable engineering policy |
| Agents | Specialized ownership and tool boundaries |
| Pre-commit hooks | Local formatting and static feedback |
| CI | Build, test, lint, bundle, and policy gates |

Skills live under `.github/skills/`. They are the normative source for their
topic and load when a task matches their description. See
[the skills catalog](../.github/skills/README.md).

The core workflow policy is
[`common-verification-first`](../.github/skills/common-verification-first/SKILL.md).
It distinguishes:

- TDD as an optional implementation process;
- test-first as an ordering technique;
- automated tests as one form of evidence; and
- verification-first as the requirement that success criteria remain
  independent from solution generation.

## Verification-First Agent Topology

Envilder defines seven agents:

| Agent | Purpose | Artifact edits | Delegates to |
| --- | --- | --- | --- |
| **Change Orchestrator** | Coordinates one coherent approved change | No | Contract Verifier, Implementer, Reviewer, Final Verifier |
| **Contract Verifier** | Establishes independent contracts | verification-contract artifacts only | None |
| **Implementer** | Produces the coherent contracted solution | Solution artifacts | None |
| **Reviewer** | Reviews one candidate or a complete change set | No | None |
| **Final Verifier** | Runs fresh final evidence | No | None |
| **Content Designer** | Coordinates website and documentation outcomes | No | Change Orchestrator, Reviewer |
| **PR Resolver** | Processes review feedback one comment at a time | No | Change Orchestrator, Reviewer |

`Contract Verifier`, `Implementer`, and `Final Verifier` are subagent-only. The
other agents are user-invocable.

Agent profiles intentionally omit `model`, allowing each host to select an
available model, and use common tool aliases as portability defaults. Alias
mappings and support are host-dependent, not universal. Each coordinator must
preflight custom-agent invocation, nested delegation, required tool propagation,
and worker tool boundaries. The coordinator returns a `BLOCKED` result instead
of collapsing independent roles when those capabilities are unavailable or
cannot be established.

### Nested Delegation

PR Resolver and Content Designer may delegate a coherent change to Change
Orchestrator, which then delegates to its workers. The tracked VS Code setting
enables this topology:

```json
{
  "chat.subagents.allowInvocationsFromSubagents": true
}
```

On hosts that filter descendant tools through ancestor exposure, all three
coordinators declare `[read, search, edit, execute, agent]`. This inheritance
envelope is necessary along the entire nested path; it does not authorize
coordinators to edit artifacts or Change Orchestrator to execute repository
commands. Host approval gates remain in force.

Worker limits stay unchanged: Contract Verifier and Implementer have
`[read, search, edit, execute]`, Reviewer has `[read, search, execute]`, and
Final Verifier has `[read, search]`, with no worker delegation. Implementer
preflights actual read/edit/execute access, reports missing capabilities
concretely, and can search through execute when no dedicated search tool is
exposed. See the
[normative inheritance policy](../.github/skills/common-verification-first/SKILL.md#capability-exposure-and-inheritance).

### One Coherent Change

```text
Approved requirement and invariants
                |
                v
    fresh Contract Verifier
                |
                v
      independent contract
                |
                v
        fresh Implementer
                |
                v
       candidate solution
                |
                v
    fresh read-only Reviewer
                |
                v
      fresh Final Verifier
                |
        explicit PASS only
                v
 Change Orchestrator judgment
```

The Orchestrator controls intent, constraints, quality gates, and acceptance. It
does not micromanage implementation steps.

Workers exchange concise semantic results:

- approved requirement, invariants, scope, constraints, and limitations;
- intent and selected verification strategy;
- current verification contract;
- exact current candidate diff and path set; and
- latest relevant implementation, review, and verification results.

They do not propagate full execution histories, failed attempts, private
reasoning, or raw tool transcripts.

## Change Classification

Every coherent change has two independent dimensions.

### Intent

- `NEW_BEHAVIOR`
- `BEHAVIOR_CHANGE`
- `BUG_FIX`
- `PURE_REFACTOR`
- `NON_BEHAVIORAL_CHANGE`

Infrastructure, configuration, migrations, generated artifacts, and test
infrastructure are subjects, not additional intents.

### Verification Strategy

Examples include:

- new, updated, or reused behavioral tests;
- an existing-suite baseline;
- consumer or direct-workflow evidence;
- compiler, type, or static validation;
- schema, policy, migration, generated-artifact, or contract validation; and
- an explicit limitation when no meaningful automated oracle exists.

The strategy must exercise the important risk rather than satisfy a methodology
ritual.

## Common Workflows

### Implement One Approved Change

Use **Change Orchestrator**.

1. Supply one approved semantic specification.
2. Let Contract Verifier establish independent evidence.
3. Let Implementer produce the solution.
4. Review the candidate independently.
5. Let Final Verifier run fresh read-only verification.
6. Enter completion judgment only with explicit final `PASS` for the exact
   current reviewed candidate. Accept only when all other evidence, review,
   gates, and engineering conditions also satisfy the original requirement.

For multi-item work, plan vertical slices and run each approved coherent item
through Change Orchestrator. The calling workflow or user owns the branch and
overall pull-request lifecycle. When PR Resolver handles review feedback, it
owns the specialized per-comment lifecycle described below.

### Scaffold a Feature

Use `/scaffold-feature`.

The prompt runs through Change Orchestrator. Contract Verifier owns
verification-contract artifacts, including behavioral tests, before
Implementer creates the solution structure. The Implementer completes required
DI, routing, and entry-point wiring without generating placeholder tests.

### Fix a Bug

1. Use `code-bug-investigation` to confirm the defect, trigger, root cause, and
   affected scope without editing artifacts.
2. Approve a `BUG_FIX` specification and focused regression or direct-workflow
   strategy.
3. Delegate through Change Orchestrator.
4. Keep regression protection and run the broader relevant suite.

### Refactor

1. Classify the change as `PURE_REFACTOR`.
2. Establish a green existing-suite baseline.
3. Keep behavioral verification unchanged.
4. Implement structural improvements.
5. Review architecture, complexity, and behavior preservation.
6. Run final verification against the original baseline and invariants.

### Change Documentation, Website Content, or Styling

Use **Content Designer** for multi-surface content coordination, or Change
Orchestrator directly for one already-approved change.

1. Choose intent based on meaning, not file extension.
2. Select reference, parser, lint, build, i18n, browser, or responsive evidence
   that protects the actual outcome.
3. Do not manufacture tests.
4. Omit candidate review only when the strict trivial and mechanical
   `NON_BEHAVIORAL_CHANGE` rule is satisfied.

### Resolve Pull-Request Feedback

Use `/resolve-pr-comments` or **PR Resolver**.

For every comment, PR Resolver analyzes the feedback, presents the proposed
action, and obtains explicit approval before execution. Before requesting it,
disclose the applicable bundled lifecycle and scope: implementation, staging of
the separately approved exact patch, a separate conventional commit, necessary
non-force push to the actual PR head remote/branch, factual English outcome reply
explaining action and reason, then confirmed resolution after the reply is
confirmed. Record authorization and explicit limits in the action and handoff.
Do not ask again solely for commit/push/reply/resolve or generated wording.
Honor local-only/no-push limits; hold and report any gate they prevent without
overriding them or pressuring the user. Missing scope/permissions or failed host
tool gates require stopping and reporting, not bypassing safeguards; clarifying
questions remain allowed. It then follows one of two branches:

- For artifact-changing feedback, delegate the approved change through Change
  Orchestrator, require a successful `ChangeResult` with explicit final `PASS`
  for the exact current reviewed candidate and all other acceptance conditions
  satisfied, validate it, create exactly one separate commit, and prepare the
  thread reply.
- For a question, disagreement, or approved skip, prepare a reply with
  repository evidence, then resolve only after publication gates and confirmed
  reply. Do not manufacture artifacts, commits, or pushes.

Action approval does not approve unseen future hunks: obtain separate explicit
content approval of the exact resulting patch before staging. Material semantic
changes require reassessment/reapproval; candidate changes invalidate affected
review/final results and require the frozen-patch guards below. With recorded
action approval and separately approved exact patch, PR Resolver generates the
conventional message and commits without repeated wording approval under
[`workflow-smart-commit`](../.github/skills/workflow-smart-commit/SKILL.md)'s narrow
exception. Standalone Smart Commit and unrelated workflows still require message
approval; conventional format, commitlint, hooks, and host gates remain.

An artifact action is not complete without qualifying final `PASS`, even if
`ChangeResult` nominally claims success. `FAIL`, `BLOCKED`, or a missing/unknown
final result holds all batch replies and leaves all threads open; report the
reason for `BLOCKED`. Aggregate or remote success cannot replace final `PASS`.
Prepared but held replies are not published success. Direct no-artifact
dispositions do not require artifact final verification.

PR Resolver owns each artifact-changing comment's separate commit, every
mandatory reply, and review-thread resolution. At admission for an
artifact-changing comment, before any artifact or Git lifecycle mutation, it
records the initial per-comment HEAD and independently requires a clean index,
with staged changes retained as their existing separate blocker. It also
requires no tracked unstaged changes and no nonignored untracked paths,
including files inside untracked directories; Git-ignored untracked paths are
exempt. A failed, unavailable, or ambiguous check blocks the artifact action and
explains that an isolated per-comment commit and later clean
committed-candidate aggregate validation cannot both be proven from that
admission state. User work remains untouched. Snapshots or exclusions cannot
make the dirty state admissible, and the workflow neither recommends nor
automatically performs a stash, reset, discard, cleanup, staging,
incorporation, or temporary-worktree isolation of user work to pass admission.
Questions, disagreements, and approved skips continue through their existing
no-artifact branch without being redefined by this artifact admission rule.

The delegated packet bans worker staging, commits, branch/ref changes, and other
Git lifecycle mutations, including through helpers, hooks, or scripts. Change
Orchestrator retains this restriction through every stage and retry, including
contract repair, implementation correction, review, and final verification;
Implementer observes it during execution and preparation. Nonmutating Git and
role-authorized in-scope edits/formatters remain allowed.

On receiving the delegated result, before deriving the candidate patch, PR
Resolver must successfully confirm the original per-comment HEAD and a clean
index. Immediately before official approved staging, after any approval wait,
it must perform the complete current-candidate integrity gate against that recorded
per-comment initial HEAD and frozen approved patch: HEAD must still equal the
initial HEAD;
the complete current raw binary diff from that HEAD must have byte-for-byte
exact equality with the frozen patch; and the changed-path set, approved scope,
and accepted candidate result must match the frozen record. Patch applicability,
a permissive diff, matching paths or hunks, text equivalence, or a partial
comparison cannot stand in for raw-binary exact equality. The index exactly
equals HEAD (no staged content), the only tracked worktree changes must be the
exact unstaged candidate, and no nonignored untracked path, tracked addition,
or other unexpected file may exist. Any integrity-gate failure—including any
mismatch, unavailable or ambiguous comparison, changed HEAD, staged content,
or tracked/untracked addition—blocks staging even with nominal success or final
`PASS`, while preserving all work. Any such failure requires fresh review,
fresh final verification, and exact-patch approval before another staging
attempt. Never stage, infer, or adopt altered hunks; never stash or reset; and
never automatically revert, discard, absorb changed history into the fix, or
restore old HEAD to hide a change. These are point-in-time checks, not a runtime
lock.

Before final candidate review, fresh final literal `PASS`, frozen exact-patch
content approval, official staging, or staged equality, PR Resolver compares
the preliminary candidate with the recorded initial HEAD and blocks
out-of-scope/unattributable content. It determines every configured mutating
commit hook applicable to that candidate. Every applicable content-mutating hook
must run before review through the enabled repository-supported installed-hook
preparation path that actually exercises configured Lefthook staged-hook
behavior, including `stage_fixed`; a generic formatter, arbitrary command,
disabled-hook switch (including `--no-stage-fixed`), or claim that it exercised
Lefthook is not a substitute.

A disposable preparation staging operation is allowed only from strict clean
admission, only for the preliminary candidate, and only when it is not
official/final staging and a clean index can be deterministically restored
without changing the worktree. Before restoration, prove that both staged index
and worktree equal the resulting candidate and that no untracked or
out-of-candidate content exists; after it, prove that the index equals HEAD and
the worktree still equals that candidate. Do not use snapshots, exclusions, or
temporary worktrees to evade admission. If the enabled preparation route or
Lefthook behavior cannot be safely and deterministically executed, fails, is
ambiguous, or cannot prove restoration/equality, block and preserve user state;
do not destroy, stage, or incorporate user content. Require a
project-supported preparation path rather than inventing a generic surrogate.

Re-derive the candidate after preparation. A content or scope change is a new
candidate. Re-determine and prepare every newly applicable mutating hook until
the candidate and applicable-hook set are unchanged, or block. Immediately
after final preparation/restoration, reconfirm the original HEAD, clean index,
no tracked unstaged or nonignored untracked content outside the candidate, and
that the restored worktree still exactly equals the final candidate; any drift
or ambiguity blocks rather than racing ahead. The resulting candidate requires
comment-specific validation, then a new candidate review and fresh final
literal `PASS` through Change Orchestrator, and explicit frozen exact-patch
approval. A pre-preparation review or `PASS` is not sufficient. PR Resolver
then stages only the exact frozen approved patch and proves staged equality. It
creates the ordinary commit with normal hooks enabled and runs no other
user-content mutating hook after approval. Final `PASS` plus staged equality
alone is insufficient.
After a parent-owned commit reports success, it immediately records the
resulting HEAD commit hash and, before retaining it as a fixed commit or
capturing/publishing its URL, proves that the recorded initial per-comment HEAD
is its sole expected parent. It then compares that commit's exact diff and
post-commit scope/result with the frozen user-approved patch and accepted
pre-commit candidate. A combined or unexpected parent, unavailable or ambiguous
comparison, mismatch, or hook mutation blocks publication, push, reply, and
resolution; records and state remain intact, no success is claimed, and any
correction needs fresh review, final verification, and exact-patch approval.
Pre-commit staged equality alone is insufficient. This guard never amends,
reverts, resets, stashes, discards, or otherwise rewrites/cleans up state.
Hooks that do not alter the approved candidate continue on the normal
successful path.

After all comments and completion of the approved actions, it
follows the [PR Resolver committed-candidate guard](../.github/agents/pr-resolver.agent.md#workflow):
record candidate HEAD and establish a clean index and worktree (no staged or
unstaged tracked changes or nonignored untracked files) before aggregate
validation, then confirm unchanged HEAD and the same clean state afterward.
Every batch must pass PR Resolver's remote-availability gate after successful
aggregate validation and these checks. Recorded action approval authorizes a
needed non-force push unless explicitly limited. Never include unrelated
commits/user work; if the responsible calling workflow owns the push, wait for
its confirmed handoff instead.
Every candidate that can authorize a publication requires a `candidate-review`
Reviewer `Verdict: APPROVE`, including a candidate used for an entirely
no-artifact batch; the trivial/mechanical `NON_BEHAVIORAL_CHANGE` review
omission does not apply at this boundary. Immediately after approval, Reviewer
alone must collect the immediately post-`APPROVE` record for the exact
current-worktree candidate. Before any static gates, Reviewer must physically
run and record `git status --porcelain=v1`. The record includes baseline/current
`HEAD`, a 64-hex SHA-256 computed over the raw bytes emitted by exactly
`git diff --binary HEAD`, the exact changed-path set emitted by
`git diff --name-only HEAD`, and that initial porcelain-status capture.
Reviewer then runs and records `git diff --check HEAD`, `pnpm lefthook
validate`, and `pnpm format:check`, in that order. Immediately after those
static checks, it physically recaptures and records `git status --porcelain=v1`,
`HEAD`, the changed-path set, the raw-byte SHA-256, and the output of a final
`git diff --check HEAD` (capture B). Both `git diff --check HEAD` results must
be clean. The before/after identity dimensions must match; any `HEAD`, hash,
path-set, or porcelain-status drift invalidates the approval and evidence,
elevates the worktree to a fresh candidate, and requires a fresh
candidate-review approval and the complete evidence protocol. Failed,
unavailable, or ambiguous Reviewer-owned static evidence blocks publication and
cannot be substituted by another role.

A fresh Final Verifier remains read/search-only and executes no commands. It
validates source policy and reconciles and attributes the Reviewer-owned base
and current `HEAD` identity, raw-byte binary-diff SHA-256, changed-path set,
initial/final porcelain-status captures, both recorded `git diff --check HEAD`
outputs, and the other static results to the exact reviewed candidate. It may
return literal final `PASS` only if Reviewer approved that exact candidate, its
identity/hash/scope/porcelain-status remained unchanged across the evidence
captures, both diff checks are clean, every other required static result
passed, and the source policy meets the current contract. Otherwise it returns
`FAIL` or `BLOCKED`; neither an earlier `PASS` nor evidence owned or recreated
by another role survives drift.

For every batch, mandatory candidate Reviewer approval and its unchanged
Reviewer-owned evidence, successful aggregate validation, and clean
committed-candidate checks precede remote-availability qualification. A
no-artifact batch requires no artifact commit or push, but lack of a push does
not bypass this gate or exact remote-tuple equality.
To begin remote-availability qualification, derive and record the actual PR
remote repository, head branch, and immutable remote head through authoritative
PR inspection. This preliminary inspection does not authorize publication.
Missing, stale, or ambiguous inspection blocks; a local remote-tracking ref,
push result, commit URL, or another remote or branch is not authoritative
evidence. The actual remote head qualifies only by one of two paths:

1. It exactly equals the fully validated candidate for which all affected
   reviews—including mandatory candidate Reviewer approval and its unchanged
   Reviewer-owned evidence—qualifying literal final `PASS`, aggregate
   validation, and clean committed-candidate checks passed.
2. It advanced, contains every corrective commit in the batch, and is treated as
   a fresh candidate: documented fresh successful reruns of all affected
   reviews—including a new candidate Reviewer approval and complete unchanged
   Reviewer-owned evidence—qualifying literal final `PASS`, aggregate
   validation, and clean committed-candidate checks must each identify that
   exact advanced remote-head commit.

Corrective-commit reachability is necessary but insufficient. Tree or text
similarity, a public commit URL, presence only in the base or an unrelated
branch or repository, a stale local remote-tracking ref, push success alone, or
an unconfirmed handoff cannot qualify either path. Missing, unavailable,
contradictory, or ambiguous identity, reachability, or exact-head rerun evidence
blocks publication and resolution. Already-present commits need no push or push
approval. An entirely no-artifact batch requires no artifact commit or push, but
is not exempt from the push/remote gate, exact remote-tuple equality, mandatory
candidate review/evidence, or aggregate guards.
After all applicable checks, immediately before **every** individual reply and
again immediately before **every** individual thread resolution, repeat
authoritative PR inspection. Record and prove that the actual PR remote
repository, head branch, and immutable current SHA exactly equal the fully
validated candidate's repository/branch/SHA tuple; no earlier inspection, stale
evidence, or absence of a push can authorize publication. If the identity or
SHA differs, treat the actual head as a fresh candidate: establish its
unambiguous PR repository/branch identity, rerun all affected reviews including
mandatory candidate Reviewer approval and the complete evidence protocol,
qualifying literal final `PASS`, aggregate validation, and clean
committed-candidate checks specifically for that exact SHA, re-establish
reachability, then repeat this final inspection. If inspection is unavailable or
ambiguous, or changes again, fail closed and publish or resolve nothing until
that prescribed route finishes for the then-current exact head.
Only when all applicable gates pass may replies be published and threads resolved
under the existing publication safeguards, without another reply or resolution
approval checkpoint. An explicit limit preventing a needed push, failed push, or
any failed, unavailable, or unconfirmed gate holds all replies (including
mixed-batch questions and skips) and leaves all threads open; report the blocker
and preserve user work.
Never reset, rebase, merge, or rewrite history to force equality or bypass
failures; local candidate changes require the existing stop/review/revalidation
guards. The calling user or workflow retains ownership of the branch and overall
pull-request lifecycle.

## Oracle Effectiveness

Physical test-first ordering is only a proxy for independent verification. The
stronger question is whether the selected oracle can reject an incorrect or
previous behavior.

Useful signals include a focused failing regression, known counterexample,
contract or schema mismatch, generated-artifact drift, or mutation rejected by
the oracle. Compilation, setup, dependency, and environment failures are not
behavioral evidence.

Visible Red is not required as ceremony. A passing suite remains evidence, not
proof.

## Review and Final Verification

Reviewer modes:

- `candidate-review` assesses one coherent candidate against an approved
  specification.
- `change-set-review` assesses a staged, unstaged, branch, commit-range, or
  pull-request diff and does not require a verification contract.

Reviewer is always read-only and never delegates fixes. No findings is a valid
result.

Contract Verifier may edit verification-contract artifacts while establishing
the independent contract. Final Verifier is a separate agent with read-only
tools and runs in a fresh context after review. It reassesses static evidence
and recorded gate results, and returns `BLOCKED` rather than acquiring a
general-purpose execution tool when fresh command execution is required.

Only explicit `FinalVerificationResult` `PASS` opens completion judgment; it is
necessary, not sufficient. `FAIL` routes to the existing owner: a fresh
Implementer for implementation defects, a fresh Contract Verifier for contract
defects, followed by affected downstream stages. Changes to approved semantics,
invariants, scope, or requirements need human approval. `BLOCKED` propagates a
reason-bearing blocked `ChangeResult`, with no success, PR replies, or thread
resolution; missing execution evidence alone does not call for solution edits.
Missing, unknown, or ambiguous results and other roles' or commands' successes
cannot establish final `PASS`.

Approved limitations cannot substitute for `PASS` or waive `FAIL` or `BLOCKED`.
A valid approved limitation strategy may receive `PASS` when its contract is
actually satisfied and assessable. Genuinely resolved blockers, including
independent contract repair, require appropriate contract/candidate reassessment,
review, and fresh final verification before judgment can reopen on fresh `PASS`.
Candidate changes invalidate affected review/final results and require necessary
review and fresh final verification; PR Resolver's frozen-patch reapproval still
applies.

## Repository Gates

Choose the smallest relevant command first, then run assigned broader gates:

```text
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm verify:gha
dotnet build src/sdks/dotnet/Envilder.sln
dotnet test tests/sdks/dotnet/
make check-sdk-python
make test-sdk-python
```

Agents must:

- run applicable repository-supported checks;
- surface non-zero exits and unavailable evidence;
- never bypass hooks or CI to claim success; and
- use artifact-appropriate validation rather than unrelated tests.

## Extending the System

### Add a Skill

1. Place it under `.github/skills/{name}/SKILL.md`.
2. Give it one normative topic and clear discovery triggers.
3. Reference existing skills rather than duplicating policy.
4. Update the skills catalog.

### Add an Agent

1. Place it under `.github/agents/{name}.agent.md`.
2. Give it one clear ownership boundary.
3. Grant only the tools and delegations it needs, including required descendant
   tools in every coordinator ancestor's inheritance envelope.
4. Reference skills instead of duplicating policy.
5. Validate every delegated agent name exists.
6. Synchronize the agent topology/inventory in `docs/ai-workflows.md` and
   `.github/skills/README.md`, including whether the agent is user-invocable or
   subagent-only.

## Maintenance Principles

- Prefer semantic handoffs over full histories.
- Keep artifact ownership strict.
- Remove aliases after intentional hard renames.
- Keep policy details in skills and general documentation concise.
- Measure escaped regressions, review findings, verification effectiveness,
  tool use, execution time, and unavailable evidence rather than ritual
  compliance.
