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

Envilder defines six agents:

| Agent | Purpose | Artifact edits | Delegates to |
| --- | --- | --- | --- |
| **Change Orchestrator** | Coordinates one coherent approved change | No | Verifier, Implementer, Reviewer |
| **Verifier** | Establishes independent contracts and runs final evidence | verification-contract artifacts only during contract establishment | None |
| **Implementer** | Produces the coherent contracted solution | Solution artifacts | None |
| **Reviewer** | Reviews one candidate or a complete change set | No | None |
| **Content Designer** | Coordinates website and documentation outcomes | No | Change Orchestrator, Reviewer |
| **PR Resolver** | Processes review feedback one comment at a time | No | Change Orchestrator, Reviewer |

`Verifier` and `Implementer` are subagent-only. The other agents are
user-invocable.

### Nested Delegation

PR Resolver and Content Designer may delegate a coherent change to Change
Orchestrator, which then delegates to its workers. The tracked VS Code setting
enables this topology:

```json
{
  "chat.subagents.allowInvocationsFromSubagents": true
}
```

### One Coherent Change

```text
Approved requirement and invariants
                |
                v
         fresh Verifier
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
      fresh final Verifier
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
2. Let Verifier establish independent evidence.
3. Let Implementer produce the solution.
4. Review the candidate independently.
5. Run fresh final verification.
6. Accept only when evidence and engineering judgment satisfy the original
   requirement.

For multi-item work, plan vertical slices and run each approved coherent item
through Change Orchestrator. The calling workflow or user owns branch, commit,
and pull-request lifecycle.

### Scaffold a Feature

Use `/scaffold-feature`.

The prompt runs through Change Orchestrator. Verifier owns
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

For each comment:

1. analyze and present the proposed action;
2. obtain explicit approval;
3. delegate artifact changes through Change Orchestrator;
4. create one commit for that comment;
5. reply in the existing review thread;
6. resolve the thread; and
7. continue to the next comment.

Every comment receives a reply, including questions, disagreements, and
approved skips.

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

Verifier modes:

- `establish-contract` may edit verification-contract artifacts.
- `final-verification` runs in a new read-only context after review.

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
3. Grant only the tools and delegations it needs.
4. Reference skills instead of duplicating policy.
5. Validate every delegated agent name exists.

## Maintenance Principles

- Prefer semantic handoffs over full histories.
- Keep artifact ownership strict.
- Remove aliases after intentional hard renames.
- Keep policy details in skills and general documentation concise.
- Measure escaped regressions, review findings, verification effectiveness,
  tool use, execution time, and unavailable evidence rather than ritual
  compliance.
