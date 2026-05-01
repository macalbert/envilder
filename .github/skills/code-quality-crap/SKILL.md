---
name: code-quality-crap
description: >-
  CRAP score quality gate for code complexity and test coverage. Use when
  reviewing methods for complexity risk, deciding whether to split methods,
  or determining minimum test coverage requirements.
---

# Code Quality — CRAP Score

CRAP (Change Risk Anti-Patterns) measures the risk of a method based on
cyclomatic complexity and test coverage.

## When to Use

- Reviewing new or changed methods for complexity risk
- Deciding whether a method needs splitting
- Determining minimum test coverage for a given complexity
- During TDD Refactor phase to validate structural improvements

## Formula

$$\text{CRAP}(m) = \text{comp}(m)^2 \times (1 - \text{cov}(m))^3 + \text{comp}(m)$$

Where:

- $\text{comp}(m)$ = cyclomatic complexity of method $m$
- $\text{cov}(m)$ = test coverage ratio (0 to 1) of method $m$

## Quality Gate

Every method MUST have a CRAP score below 6.

## Coverage Thresholds

These thresholds are intentionally stricter than the mathematical minimum,
providing a safety margin:

| Complexity | Recommended coverage for CRAP < 6 |
|-----------|-----------------------------------|
| 1 | 0% (any) |
| 2 | > 0% |
| 3 | 40%+ |
| 4 | 60%+ |
| 5 | 80%+ |
| 6+ | **Not achievable** — must split to reduce complexity |

## Actions by Scenario

| Scenario | Action |
|----------|--------|
| CRAP >= 6 due to high complexity | Extract complex branches into smaller methods |
| CRAP >= 6 due to low coverage | Add tests (new Red/Green cycle) |
| Complexity 6+ regardless of coverage | Must split — CRAP floor equals complexity |

## Severity Classification

- **Medium**: complexity 4–5 without proportional test coverage
- **High**: complexity 6+ (must split, no amount of testing fixes it)
