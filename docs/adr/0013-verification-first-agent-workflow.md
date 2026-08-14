# ADR-0013: Verification-First Agent Workflow

## Status

Accepted

## Context

The Red-Green-Refactor agent workflow prescribed a human construction loop to
coding agents and could let implementation details influence later
expectations. Tests remain valuable, but not every change needs a new test or
has a test as its most direct executable oracle.

A failing test is meaningful only when its observed failure matches the
expected behavioral mismatch rather than a compilation, setup, dependency, or
environment problem. Documentation, configuration, pure refactors, generated
artifacts, and test infrastructure also need verification strategies that
match their actual risks.

## Decision

Replace mandatory Red-Green-Refactor orchestration with verification-first as
the conceptual model.
[`common-verification-first`](../../.github/skills/common-verification-first/SKILL.md)
is the normative source for operational detail.

Classify every task on two independent dimensions:

1. One intent: `NEW_BEHAVIOR`, `BEHAVIOR_CHANGE`, `BUG_FIX`,
   `PURE_REFACTOR`, or `NON_BEHAVIORAL_CHANGE`.
2. A task-selected executable strategy such as behavioral tests, an existing
   baseline, a consumer workflow, static analysis, schema or contract
   validation, generated-artifact consistency, or an explicit limitation.

The Change Orchestrator coordinates one coherent approved change. The Verifier
owns independent success criteria and returns in a fresh read-only context for
final verification. The Implementer edits solution artifacts but never defines
or weakens success criteria. The Reviewer is strictly read-only, and no
findings is a valid result.

Use fresh contexts for separation of concerns and independent evaluation. Pass
concise semantic handoffs of requirements, invariants, constraints, contracts,
evidence, and results rather than transcripts or problem-solving trajectories.

## Consequences

### Positive

- Verification matches the change's actual risk instead of a methodology
  ritual.
- Expected behavior remains independent from solution generation.
- Non-test oracles can protect configuration, documentation, infrastructure,
  and generated artifacts directly.
- Review and final verification assess the exact current candidate.

### Negative

- The workflow adds role handoffs and repeated repository reading.
- Selecting a credible oracle requires engineering judgment.
- Unavailable verification and residual risk must be reported explicitly.

## When to Reconsider

- Independent contracts produce more ambiguity than the previous workflow.
- Measured escaped regressions or review findings increase materially.
- Tooling can enforce equivalent role separation with less orchestration.

This decision remains empirical. Directional evidence includes Birgitta
Boeckeler's Fowler article,
[TDD in the Agent Loop](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html).
