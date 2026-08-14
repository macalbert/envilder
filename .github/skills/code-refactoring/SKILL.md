---
name: code-refactoring
description: >-
  Code-smell detection and safe incremental refactoring patterns. Use when
  reviewing or implementing a PURE_REFACTOR contract, reducing technical debt,
  or assessing structural findings. Covers SOLID principles and
  behavior-preserving execution.
---

# Code Refactoring

Detect concrete code smells and improve structure while preserving all
observable behavior. `common-verification-first` governs intent, protected
artifacts, and evidence.

## When to Use

- Implementing an approved `PURE_REFACTOR`.
- Reviewing a candidate for justified structural findings.
- Reducing technical debt within approved scope.
- Reducing complexity flagged by CRAP evidence.

## Preconditions

- Establish an existing-suite baseline before solution edits.
- Freeze and protect behavioral verification; do not rewrite it for the
  refactor.
- State architecture constraints and the behavior that must remain unchanged.
- Only `@Implementer` applies workflow changes. `@Reviewer` remains read-only
  and reports findings to the orchestrator.

## Smell Catalog

| Smell | Indicator |
| --- | --- |
| Long method | Excessive branches, mixed levels, or multiple responsibilities |
| Large class | Multiple independent reasons to change |
| Duplicated logic | The same decision or transformation exists in multiple places |
| Tight coupling | High-level behavior depends directly on replaceable details |
| Mixed abstraction | Policy and low-level mechanics are interleaved |
| Architecture violation | A dependency crosses a prohibited layer boundary |
| Feature envy | Behavior primarily manipulates another owner's data |
| Shallow module | Interface complexity approaches implementation complexity |
| Primitive obsession | Domain concepts lack meaningful types and invariants |
| Speculative generality | Abstraction exists without a current requirement |

## Review Method

1. Read target files, callers, verification contract, and architecture rules.
2. Identify only concrete smells with maintenance or correctness risk.
3. Apply the deletion test to shallow modules: retain an abstraction when
   removing it concentrates complexity; inline it when removal merely shortens
   the call path.
4. Report location, evidence, proposed structural outcome, and risk.
5. Accept `no changes required` when the candidate is already clear and
   cohesive.

## Implementation Method

For each approved structural change:

1. Make one coherent transformation.
2. Keep protected verification artifacts unchanged.
3. Run the targeted existing verification.
4. Run the stack formatter and static or build checks in the appropriate mode.
5. Continue only while behavior and architecture constraints remain protected.
6. Run the broader relevant suite before completion.

If a behavioral test must change, stop. The task may be a behavior change, the
test may be coupled to private structure, or the contract may be defective.
Route that decision to the orchestrator instead of silently reclassifying it.

## Stack Checks

| Stack | Typical verification | Formatter |
| --- | --- | --- |
| TypeScript core, Node.js SDK, website | Targeted Vitest or build, type check | `pnpm format` |
| .NET SDK | Targeted and broader `dotnet test`, build | `dotnet format` |
| Python SDK | Targeted and broader pytest, mypy | `make format-sdk-python` |

## Constraints

- Never change observable outputs, side effects, compatibility, or domain
  invariants.
- Respect Domain -> Application -> Infrastructure dependency rules.
- Do not add tests merely to raise coverage or satisfy a refactoring ritual.
- If important behavior truly lacks evidence, report a separate verification
  need; do not expand the frozen refactor contract.
- Do not force a modification after review; no findings is valid.

## SOLID Reference

| Principle | Check |
| --- | --- |
| Single Responsibility | Does this unit have one reason to change? |
| Open/Closed | Can required variation be added without unstable branching? |
| Liskov Substitution | Can subtypes replace the abstraction without surprises? |
| Interface Segregation | Do clients depend only on operations they need? |
| Dependency Inversion | Does policy depend on abstractions rather than details? |
