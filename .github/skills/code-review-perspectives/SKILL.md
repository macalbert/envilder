---
name: code-review-perspectives
description: >-
  Five independent analysis perspectives for code review: correctness,
  architecture, security, conventions, and complexity. Use when reviewing
  PRs, commits, or local changes. Includes severity model and output format.
---

# Code Review Perspectives

Five parallel analysis perspectives for comprehensive code review.
Run independently, then synthesize into a deduplicated prioritised report.

## When to Use

- Reviewing PRs or commit ranges
- Auditing code quality before release
- Post-implementation review
- Any read-only code analysis task

## Perspectives

### 1. Correctness

- Runtime errors, logic bugs, off-by-one mistakes
- Unhandled promises, null/undefined risks
- Missing error propagation
- Regressions from changed behavior

### 2. Architecture

- Hexagonal architecture boundary violations (domain importing infrastructure)
- Port/adapter misuse, DI wiring gaps
- Command/Handler pattern violations
- Layer dependency direction (domain → application → infrastructure)

### 3. Security

- OWASP Top 10 adapted to this stack (injection, secrets exposure, SSRF)
- Raw secret logging (must use `EnvironmentVariable.maskedValue`)
- Unsafe `process.env` access patterns
- Dependency-related CVE signals

### 4. Conventions

- Biome style (single quotes, semicolons, 2-space indent, trailing commas)
- Test naming: `Should_<Expected>_When_<Condition>`
- AAA markers: `// Arrange`, `// Act`, `// Assert` — each at most once per test
- InversifyJS decorator usage: `@injectable()`, `@inject(TYPES.X)`
- Conventional commits in PR title

### 5. Complexity (CRAP)

See `code-quality-crap` skill for formula and thresholds.

- Flag methods with cyclomatic complexity ≥ 4 lacking proportional coverage
- Flag methods with complexity ≥ 6 — recommend extraction

## Severity Model

| Severity | Criteria |
|----------|----------|
| **Critical** | Security, data loss, broken release, major regression |
| **High** | Likely runtime failure, incorrect business behavior |
| **Medium** | Correctness risk with limited blast radius, test gaps |
| **Low** | Maintainability concern worth addressing soon |

## Synthesis Procedure

1. Run all 5 perspectives (can be parallel)
2. Merge findings, deduplicate overlaps
3. Assign severity per the model above
4. Order by severity descending
5. For each finding: severity, why it matters, file:line evidence, fix direction

## Output Format

```text
## Findings

### [Critical/High/Medium/Low] — {title}
**File:** {path}:{line}
**Why:** {explanation}
**Fix:** {direction}

## Open Questions
- {assumptions or clarifications needed}

## Summary
{1-2 sentence overview — AFTER findings, not before}
```

## Verification

After analysis, verify findings before reporting:

1. `pnpm test` — confirm test suite passes
2. `biome check && tsc --noEmit` — lint compliance (no modifications)
3. `pnpm format:check` — formatting (no modifications)
4. Browser checks for website/UI changes (Playwright)
5. Stack-specific: `dotnet build`/`dotnet test`, `make check-sdk-python`

Only report **confirmed** findings. Downgrade unverified suspicions.

## Constraints

- Do not report style-only nits unless they block quality gates
- State assumptions explicitly
- Never modify files during review — read-only analysis only
