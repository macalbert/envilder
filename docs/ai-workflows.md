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
mandatory reply, and review-thread resolution. At comment admission it records
the initial per-comment HEAD alongside the clean-index, tracked-worktree diff,
and untracked path/content-hash snapshots. Isolatable pre-existing unstaged user
work is allowed, preserved, and excluded from the fix.

The delegated packet bans worker staging, commits, branch/ref changes, and other
Git lifecycle mutations, including through helpers, hooks, or scripts. Change
Orchestrator retains this restriction through every stage and retry, including
contract repair, implementation correction, review, and final verification;
Implementer observes it during execution and preparation. Nonmutating Git and
role-authorized in-scope edits/formatters remain allowed.

On receiving the delegated result, before deriving the candidate patch, and
again immediately before approved staging after any approval wait, PR Resolver
must successfully confirm the original per-comment HEAD and a clean index.
Unexpected HEAD or staging, or failed, unavailable, or ambiguous HEAD/index
inspection, blocks even nominal success or final `PASS`: report the reason and
preserve state, without automatically reverting, resetting, stashing,
discarding, absorbing changed history into the fix, or restoring old HEAD to
hide a change. Resume only after legitimate reassessment and applicable approval
under existing review/verification guards. These are point-in-time checks, not a
runtime lock. PR Resolver retains authority to stage the exact approved frozen
patch and commit it separately, verifying staged equality before committing.
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
For any artifact-changing batch, successful validation and these checks must be
followed by PR Resolver's remote-availability gate. Recorded action approval
authorizes a needed non-force push unless explicitly limited. Never include
unrelated commits/user work; if the responsible calling workflow owns the push,
wait for its confirmed handoff instead.
Before publishing any batch reply or resolving any thread, confirm from current
authoritative history that the actual PR remote repository's head branch contains
the validated candidate and every corrective commit in the batch. An advanced
descendant containing all qualifies; a commit URL, push success, stale tracking
ref, wrong repository/branch, or unconfirmed handoff does not. Already-present
commits need no push or push approval. Entirely no-artifact batches are exempt
only from the push/remote gate, not existing approvals or aggregate guards.
Only when all applicable gates pass may replies be published and threads resolved
under the existing publication safeguards, without another reply or resolution
approval checkpoint. An explicit limit preventing a needed push, failed push, or
any failed, unavailable, or unconfirmed gate holds all replies (including
mixed-batch questions and skips) and leaves all threads open; report the blocker
and preserve user work.
Do not bypass failures by rebasing, merging, or rewriting history; local candidate
changes require the existing stop/review/revalidation guards. The calling user or
workflow retains ownership of the branch and overall pull-request lifecycle.

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
