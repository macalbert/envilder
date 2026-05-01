---
name: code-refactoring
description: >-
  Code smell detection and safe incremental refactoring patterns. Use when
  improving code structure, reducing technical debt, or cleaning up after
  a TDD cycle. Covers SOLID principles, smell catalog, and the propose-apply
  workflow.
---

# Code Refactoring

Detect code smells and apply safe, incremental refactoring while preserving
all existing behavior.

## When to Use

- TDD Refactor phase (after Green)
- Cleaning up technical debt
- Improving code structure after review findings
- Reducing complexity flagged by CRAP score

## Smell Catalog

| Smell | Indicator |
|-------|-----------|
| Long method | > 20 lines or doing multiple things |
| Large class | Multiple responsibilities |
| Duplicated logic | Same pattern in 2+ places |
| Tight coupling | Direct dependency on concrete implementations |
| Mixed abstraction levels | High/low-level operations in same method |
| SRP violation | Class/method has multiple reasons to change |
| Architecture boundary violation | Domain importing infrastructure |
| Feature envy | Method uses another class's data more than its own |

## Workflow

### 1. Analyze

- Read target file(s) and surrounding context
- Identify smells from the catalog above
- Check architecture boundary compliance

### 2. Propose

Present opportunities before applying:

```text
## Refactoring Opportunities

| # | Smell | Location | Proposed Change | Risk |
|---|-------|----------|-----------------|------|
| 1 | {smell} | {file:line} | {what to do} | Low/Med |
```

Wait for confirmation before applying.

### 3. Apply

For each approved refactoring:

1. Apply **one change at a time**
2. Run `pnpm test` after each change
3. Run `pnpm lint` to verify formatting
4. Report result before proceeding to next

### 4. Report

```text
## Refactoring Complete

**Applied:** {N} of {M} proposed changes
**Tests:** all passing ✓
**Formatter:** ran ✓

### Changes
1. {file} — {what changed}
```

## Constraints

- **Never change observable behavior** — refactoring preserves outputs
- Respect hexagonal architecture boundaries
- Preserve existing DI wiring patterns (InversifyJS)
- If a refactoring breaks a test, **revert it** and report
- One change per step — never batch multiple refactorings without testing

## SOLID Reference

| Principle | Quick check |
|-----------|-------------|
| **S**ingle Responsibility | Does this class/method have one reason to change? |
| **O**pen/Closed | Can I extend without modifying existing code? |
| **L**iskov Substitution | Can subtypes replace base without breaking behavior? |
| **I**nterface Segregation | Are interfaces focused (no unused methods)? |
| **D**ependency Inversion | Do high-level modules depend on abstractions? |
