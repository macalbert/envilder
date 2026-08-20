---
name: common-verification-first
description: >-
  Normative verification-first policy for all change intents. Defines
  independent verification contracts, strategy selection, evidence rules, role
  ownership, and final evaluation without prescribing microscopic
  implementation steps.
user-invocable: false
---

# Verification-First Engineering

This is the normative policy for planning, implementing, reviewing, and
verifying repository changes across every Envilder stack.

## Core Principle

> The implementation must not define its own success criteria.

Expected results derive from approved requirements, invariants, acceptance
criteria, architecture constraints, and stable external contracts. Control the
correctness of the result without prescribing the microscopic process used to
produce it.

A passing command is evidence. It is not proof that the requirement was
interpreted correctly.

## Distinct Concepts

- **TDD** controls how implementation evolves through Red, minimal Green, and
  Refactor. An Implementer may use that loop when useful, but this workflow does
  not require it.
- **Test-first** establishes a test before implementation. The ordering can
  separate expected behavior from solution generation, but physical ordering
  alone does not guarantee independence.
- **Automated testing** executes test-based evidence against a system.
- **Verification-first** establishes the strongest practical,
  implementation-independent oracle before solution edits when meaningful. The
  oracle may be a test, compiler, type checker, schema validator, policy check,
  contract check, generated-artifact check, or direct workflow.

The goal is reliable evidence of correctness, not the maximum number of tests.

## Two Independent Dimensions

Classify every task by both intent and verification strategy. Neither dimension
mechanically determines the other.

### Intent

Choose exactly one:

| Intent | Meaning |
| --- | --- |
| `NEW_BEHAVIOR` | Introduces an observable capability or system property |
| `BEHAVIOR_CHANGE` | Intentionally changes an existing observable contract |
| `BUG_FIX` | Restores expected behavior by correcting a confirmed defect |
| `PURE_REFACTOR` | Changes structure while preserving observable behavior |
| `NON_BEHAVIORAL_CHANGE` | Changes artifacts without changing system behavior |

Infrastructure, configuration, migrations, generated artifacts, and test
infrastructure are subjects of work, not extra intents. Classify what the change
means, not which directory it touches.

### Verification Strategy

Select one or more strategies justified by the requirement:

| Strategy | Typical use |
| --- | --- |
| New, updated, or reused behavioral tests | Observable behavior and regressions |
| Existing-suite baseline | Pure refactors and already protected behavior |
| Consumer or direct-workflow evidence | Test infrastructure and operational workflows |
| Compiler, type, or static validation | API shape, type safety, architecture, lint, generated consistency |
| Schema, policy, migration, or contract validation | Configuration, data evolution, and external contracts |
| Explicit limitation | No meaningful executable oracle is available |

Prefer the fastest deterministic strategy that directly exercises the important
boundary. Add broader gates when a narrow oracle cannot expose integration risk.

## Role Ownership

### Change Orchestrator

- Owns one coherent approved change, its classification, routing, and final
  judgment.
- Preserves the approved requirement, invariants, scope, constraints, and
  limitations.
- Never edits artifacts or executes repository commands.
- Routes implementation defects to the Implementer, contract defects to the
  Verifier, and semantic changes to human approval.

### Verifier

- Is the sole editor of verification-contract artifacts.
- In `establish-contract`, selects, reuses, updates, or creates the required
  executable oracle before implementation.
- In a new `final-verification` context, edits nothing and reassesses the final
  candidate against the original approved intent.
- Never derives expected behavior from the candidate implementation.

### Implementer

- Is the sole editor of solution artifacts: production code, configuration,
  documentation, migrations, refactors, and test infrastructure.
- Never edits or weakens the established verification contract.
- May inspect, compile, test, debug, iterate, and refactor freely.
- Does not need to follow microscopic Red/Green/Refactor cycles.

### Reviewer

- Is strictly read-only and evaluates final artifacts rather than implementation
  history.
- Supports `candidate-review` for one orchestrated candidate and
  `change-set-review` for a staged, unstaged, branch, commit-range, or
  pull-request diff.
- Never edits or delegates fixes.
- May return no findings when the candidate is already correct and well
  factored.

## Artifact Ownership

Verification-contract artifacts encode success criteria: behavioral,
regression, contract, architecture, or acceptance tests; expectation snapshots;
and dedicated validation scripts or specifications created to express the
approved contract.

Solution artifacts include production code, configuration, documentation,
migrations, refactors, fixtures, builders, seeders, mocks, containers, data
loaders, runner setup, and other test infrastructure.

The Verifier may edit only verification-contract artifacts while establishing a
contract. The Implementer may edit only solution artifacts. The Reviewer and
final Verifier edit nothing.

## Semantic Handoffs

Fresh contexts provide separation of responsibilities and independent
evaluation. Fresh does not mean starved of context.

Every worker receives the approved semantic inputs it needs:

- requirement and observable outcome;
- intent and verification strategy;
- invariants and exact in-scope and out-of-scope boundaries;
- architecture, compatibility, security, and operational constraints;
- assumptions and explicit limitations;
- relevant repository context, commands, prior evidence, and required gates;
- the current `VerificationContract`;
- the exact candidate diff and path set when a candidate exists; and
- the latest relevant `ImplementationResult`, `ReviewResult`, or
  `FinalVerificationResult`.

Do not propagate transcripts, raw command logs, failed attempts, temporary
hypotheses, private reasoning, or obsolete result histories. Communicate
semantic results, not full working trajectories.

## Verification-First Workflow

1. Approve the requirement, observable outcome, invariants, scope, and
   constraints.
2. Classify intent and choose the verification strategy independently.
3. Delegate a fresh Verifier in `establish-contract` mode.
4. Confirm the `VerificationContract` derives from approved semantics and uses
   the narrowest credible oracle.
5. Delegate a fresh Implementer to produce the coherent solution.
6. Run a fresh read-only Reviewer in `candidate-review` mode unless the strict
   omission rule applies.
7. Route findings to their owner and repeat only the affected downstream
   stages.
8. Delegate a new fresh Verifier in `final-verification` mode.
9. Let the Change Orchestrator judge whether evidence, review, and engineering
   judgment satisfy the original requirement.

If any candidate artifact changes after review or final verification, rerun the
necessary review and final verification against the new candidate.

### Review Omission

Candidate review may be omitted only when every condition is true:

- intent is exactly `NON_BEHAVIORAL_CHANGE`;
- scope is trivial;
- the edit is mechanical;
- the subject is not infrastructure, configuration, migration, a generated
  artifact, or test infrastructure; and
- definitive artifact-appropriate validation passed.

Record the rationale, evidence, and residual risk. Any uncertainty requires
review. A lifecycle-level or complete change-set review may still be required by
the caller.

## Rules by Intent

### `NEW_BEHAVIOR`

- Identify the absent observable behavior and its invariants.
- Reuse verification that already expresses the requirement.
- Add verification only for uncovered behavior.
- Establish a meaningful expected-failure or absence signal when the oracle can
  do so.
- Use integration evidence when wiring or cross-layer collaboration is part of
  the risk.

### `BEHAVIOR_CHANGE`

- Update the existing behavioral contract before implementation when one
  exists.
- Remove or replace contradictory expectations.
- Add verification only for an uncovered part of the approved change.
- Record how current behavior differs from the newly approved expectation.

### `BUG_FIX`

- Investigate the symptom, trigger, root cause, affected scope, and existing
  coverage.
- Reuse or update existing verification when it reproduces the real defect.
- Otherwise add one focused regression at the lowest level that crosses the
  failing boundary.
- Demonstrate the defect on the pre-fix state whenever practical.
- Confirm that any failing signal matches the reported behavioral defect rather
  than a compilation, setup, dependency, or environment failure.
- Stop when the defect cannot be reproduced; do not guess at a fix.
- Keep regression protection and run the broader relevant suite.

### `PURE_REFACTOR`

- Establish a green baseline with existing behavioral verification.
- Keep behavioral verification unchanged.
- Preserve outputs, side effects, contracts, compatibility, and architecture
  invariants.
- If behavioral expectations must change, stop and reclassify the task.

### `NON_BEHAVIORAL_CHANGE`

- Use artifact-appropriate lint, parser, schema, reference, dry-run, or build
  checks.
- Establish a baseline only when comparison is meaningful.
- Do not create a test, force a failure, or run an unrelated suite for ceremony.
- Report when no automated validator exists.

## Infrastructure and Configuration

Classify by intent first, then choose the natural oracle. Appropriate evidence
can include workflow or configuration schema validation, policy validation,
migration checks, API or event contract validation, compiler checks, type
checking, lint, and generated-code consistency.

Do not force infrastructure behavior into a shallow unit test when policy,
contract, plan, or migration evidence expresses the real system property more
directly.

## Test Infrastructure

Fixtures, builders, mocks, stubs, seeders, containers, data loaders, and
test-runner configuration are solution artifacts.

Use this order:

1. Run a production-behavior consumer test that uses the support artifact.
2. Reproduce the affected test workflow directly when needed.
3. Add the smallest focused test of a stable support contract only when the
   first two paths cannot localize the defect with enough diagnostic precision.

The focused support test is diagnostic instrumentation, not a coverage target.
Record why consumer or workflow evidence was insufficient.

## Oracle Effectiveness

Physical test-first ordering is only a proxy for independence. The stronger
question is:

> Can the verification meaningfully reject an incorrect or previous behavior?

Useful effectiveness evidence may include:

- a focused failing regression;
- a known counterexample;
- a contract, schema, policy, or generated-artifact mismatch;
- a mutation that the oracle rejects; or
- another meaningful negative signal.

A failing signal counts only when its observed reason matches the expected
absent, previous, or defective behavior. Compilation, setup, dependency, and
environment failures are limitations to resolve or report, not evidence that
the behavioral oracle is effective.

Do not require visible Red merely as ritual. For critical behavior, consider
stronger techniques such as property-based testing, mutation testing, boundary
analysis, concurrency scenarios, contract validation, and independent review.

## Behavioral Test Strategy

Inside-out and outside-in are both valid ways to discover behavioral
verification. Neither dictates how the Implementer must construct the solution.

Use the lowest test level that can prove the requirement without mocking away
the risk:

| Level | Select when |
| --- | --- |
| Unit | Pure behavior has no I/O and a small stable boundary |
| Integration | Behavior crosses layers, persistence, HTTP, queues, or framework wiring |
| Acceptance | A stakeholder use case needs full application-path evidence |
| E2E | A small number of critical flows require real user and deployed-style boundaries |

Behavioral verification should be isolated, order-independent, deterministic,
readable as a requirement, specific enough to localize failure, insensitive to
private structure, and maintainable in proportion to the protected risk.

Coverage and test count are diagnostics, not goals. Prefer observable results
and required side effects over private methods, trivial storage, framework
registration in isolation, or mock interactions as ends in themselves.

## Compact Result Shapes

These are the canonical workflow envelopes. Role agents may add task-specific
detail but must not rename, remove, or contradict these fields.

```text
VerificationContract

Intent and strategy:
Behaviors and invariants:
Verification artifacts:
Targeted commands:
Pre-state effectiveness evidence:
Broader gates:
Assumptions:
Result:
Risks or limitations:
```

```text
ImplementationResult

Intent and strategy:
VerificationContract received:
Solution artifacts changed:
Candidate paths:
Design decisions:
Targeted command and result:
Broader gates and results:
Contract status: SATISFIED | UNSATISFIED | BLOCKED
Unresolved concerns or risks:
```

```text
ReviewResult

Mode and scope:
Summary:
Prioritized findings:
No-finding rationale:
Verification observations and commands:
Contract assessment: <assessment | NOT_PROVIDED>
Verdict: APPROVE | COMMENT | REQUEST_CHANGES | BLOCKED
Remaining risks:
```

```text
FinalVerificationResult

Candidate paths assessed:
Approved semantics assessed:
Review disposition assessment:
Behaviors and invariants assessed:
Targeted command results:
Broader gate results:
Contract assessment:
Final result: PASS | FAIL | BLOCKED
Risks or limitations:
```

```text
ChangeResult

Approved specification:
Intent and strategy:
VerificationContract:
Changed paths and candidate scope:
Latest ImplementationResult:
Latest ReviewResult or ReviewOmission:
FinalVerificationResult:
Final judgment:
Limitations and residual risks:
```

## What Remains Strict

- Approved requirements, invariants, scope, and constraints precede
  implementation.
- Expected behavior is established independently of the candidate
  implementation.
- Verification-contract artifacts remain Verifier-owned.
- Bug fixes reproduce the defect whenever practical.
- Pure refactors preserve behavior and behavioral verification.
- Test infrastructure uses consumer or direct-workflow evidence first.
- Required targeted and broader gates run before completion.
- Missing, failed, skipped, or unavailable evidence is reported honestly.
- Candidate review is mandatory except for the strict non-behavioral omission.
- A fresh final evaluator reassesses evidence against original intent.

## What Remains Flexible

- Whether the oracle is a test.
- Whether verification is new, updated, or reused.
- Whether an effectiveness signal is a failing test or another negative signal.
- The test level and inside-out or outside-in perspective.
- How many files or local implementation iterations are needed.
- When the Implementer compiles, tests, debugs, or refactors.
- Whether review finds anything; no findings is valid.

Never require a new test, a failing test, or a separate cleanup phase merely to
satisfy a ritual. Require independent criteria, appropriate evidence, sound
architecture, and a credible final judgment.
