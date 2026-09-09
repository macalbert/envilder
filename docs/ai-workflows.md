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
6. Accept only when evidence and engineering judgment satisfy the original
   requirement.

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
action, and obtains explicit approval. It then follows one of two branches:

- For artifact-changing feedback, delegate the approved change through Change
  Orchestrator, validate it, create exactly one separate commit, and prepare
  the thread reply.
- For a question, disagreement, or approved skip, prepare a reply with
  repository evidence. Do not create a commit.

PR Resolver owns each artifact-changing comment's separate commit, every
mandatory reply, and review-thread resolution. It requires a clean index for
each isolated commit and verifies that the staged diff exactly matches the
approved patch. After all comments and completion of the approved actions, it
follows the [PR Resolver committed-candidate guard](../.github/agents/pr-resolver.agent.md#workflow):
record candidate HEAD and establish a clean index and worktree (no staged or
unstaged tracked changes or nonignored untracked files) before aggregate
validation, then confirm unchanged HEAD and the same clean state afterward.
For any artifact-changing batch, successful validation and these checks must be
followed by PR Resolver's remote-availability gate. Push only if needed and
explicitly user-approved, or wait for the responsible calling workflow to push.
Before publishing any batch reply or resolving any thread, confirm from current
authoritative history that the actual PR remote repository's head branch contains
the validated candidate and every corrective commit in the batch. An advanced
descendant containing all qualifies; a commit URL, push success, stale tracking
ref, wrong repository/branch, or unconfirmed handoff does not. Already-present
commits need no push or push approval. Entirely no-artifact batches are exempt
only from the push/remote gate, not existing approvals or aggregate guards.
Only when all applicable gates pass may replies be published and threads resolved
under the existing publication safeguards, without another reply or resolution
approval checkpoint. Missing needed push approval, failed push, or any failed,
unavailable, or unconfirmed gate holds all replies (including mixed-batch questions
and skips) and leaves all threads open; report the blocker and preserve user work.
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

If candidate artifacts change after review or final verification, the affected
evaluation must run again against the new candidate.

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
