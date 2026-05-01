---
name: code-bug-investigation
description: >-
  Workflow for investigating and reproducing bugs before fixing via TDD.
  Use when a bug report or GitHub issue is received. Covers issue fetching,
  root cause analysis, reproduction planning, and handoff to TDD cycle.
---

# Bug Investigation

Structured workflow for going from bug report to reproduction-ready TDD plan.

## When to Use

- A GitHub issue is referenced (e.g., "#42", issue URL)
- A reviewer describes incorrect behavior
- A user reports unexpected output or error
- A test failure indicates a regression

## Phase 1 — Build a Feedback Loop

**This is the skill.** Everything else is mechanical. Before investigating
anything, establish a tight loop that lets you observe the bug:

1. **Can you trigger the bug right now?** Find the fastest command or action
   that demonstrates the failure (CLI invocation, test command, API call).
2. **Minimize the loop.** Strip to the simplest reproduction: fewest inputs,
   shortest path. A 2-second feedback loop beats a 30-second one.
3. **Instrument if needed.** If the bug isn't directly observable (silent
   failure, wrong value in cloud), add a temporary log or assertion that
   makes it visible. Remove instrumentation after fix.

If you can't reproduce → stop and report to the user immediately. No guessing.

## Phase 2 — Gather Issue Details

**From GitHub issue:**

```bash
gh issue view {number} --json title,body,labels,assignees,comments
```

Extract: title, description, steps to reproduce, expected vs actual behavior.

**From user description:**

Summarize: what's happening, what should happen, reproduction conditions.

## Phase 3 — Investigate and Locate

1. Identify the domain area — which handler, service, or component
2. Read the affected code — understand current behavior
3. Check existing tests — why didn't they catch this?
4. Identify root cause — pinpoint the exact code path

## Phase 4 — Present Analysis

Before writing any code, present findings:

```text
## Bug Analysis

**Issue:** {title or summary}
**Root cause:** {explanation}
**Affected code:** {file}:{line range} — {what's wrong}
**Existing coverage:** {tests that exist but missed the bug}

**Reproduction plan:**

| # | Test behavior | Level | Justification |
|---|---------------|-------|---------------|
| 1 | Should_{X}_When_{Y} | Unit | {why} |

Proceed with reproduction test? (Y/n)
```

Wait for user confirmation before proceeding to TDD cycle.

## Phase 5 — Handoff to TDD

After analysis is confirmed:

1. **RED** — Write a failing test that reproduces the bug (asserts correct
   behavior, fails because bug exists)
2. **GREEN** — Fix the production code minimally
3. **REFACTOR** — Clean up if needed

## Investigation Tools

- **Terminal**: Run CLI commands, `pnpm test`, `dotnet test`, reproduce failures
- **Browser/Playwright**: Navigate website, take screenshots, check console errors
- **Read/Search**: Explore codebase, trace code paths
- **`gh` CLI**: Fetch issue details, comments, labels

## Rules

- **Never fix without reproducing first** — a failing test is mandatory
- **One bug per cycle** — multiple bugs need separate investigations
- **Present analysis before acting** — user validates understanding first
- **Report blockers immediately** — if reproduction fails, stop and explain

## Summary Format

After fix is complete:

```text
## Bug Fix Complete

**Issue:** {title}
**Root cause:** {one-line explanation}
**Red:** {test_file}::{test_name} — reproduced ✓
**Green:** {production_file} — {what was fixed}
**Refactor:** {what improved, or "no changes needed"}
**Tests:** pnpm test — {N} passed, 0 failed
```
