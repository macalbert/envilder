---
name: to-issues
description: >-
  Break a plan or feature into vertical-slice GitHub issues. Each issue is a
  tracer bullet — independently deliverable, testable, and mergeable.
  Use when decomposing work from ROADMAP.md, a PRD, or a conversation.
---

# Plan to Issues

Turn the current plan into a set of vertical-slice GitHub issues ready for
implementation.

## Workflow

### 1. Understand the Plan

If the plan is vague, interview the user briefly (max 3 questions) to clarify
scope and boundaries. Check ROADMAP.md and existing issues for overlap.

### 2. Slice Vertically

Each issue must be a **tracer bullet** — a thin vertical slice that:

- Touches all necessary layers (domain → application → infrastructure → entry point)
- Is independently testable and mergeable
- Delivers observable value (even if small)

**Anti-pattern:** Horizontal slices like "add all domain entities", "add all tests",
"wire DI for everything". These delay feedback.

### 3. Order by Dependencies

Number issues in implementation order. Earlier issues should unblock later ones.
First issue should be the **thinnest possible end-to-end** path (the tracer bullet).

### 4. Format Each Issue

```markdown
## Title

feat(scope): concise description

## Description

What this slice delivers and why it matters independently.

## Acceptance Criteria

- [ ] Criterion using Should/When language
- [ ] Tests pass: `{test command}`
- [ ] Lint passes: `{lint command}`

## Technical Notes

- Affected files/modules
- Key design decisions (reference ADRs if applicable)
- Dependencies on other issues (if any)
```

### 5. Present for Approval

Show the full issue list as a numbered table before creating anything:

```text
| # | Title | Scope | Depends On |
|---|-------|-------|------------|
| 1 | feat(sdk-dotnet): add ISecretProvider port | Domain | — |
| 2 | feat(sdk-dotnet): implement AWS SSM provider | Infra | #1 |
```

Wait for user confirmation. Then create issues via `gh issue create`.

## Rules

- **Max 8 issues per plan** — if more are needed, split into phases
- **Each issue ≤ 1 day of work** — if larger, slice thinner
- Use Conventional Commit format for titles
- Reference ADRs in technical notes when relevant
- Label issues with `needs-triage` unless user specifies otherwise
