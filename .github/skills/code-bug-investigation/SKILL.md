---
name: code-bug-investigation
description: >-
  Investigate a reported defect, gather reproduction evidence, confirm root
  cause, and recommend a focused verification strategy without editing
  artifacts. Production defects require focused regression evidence;
  test-infrastructure defects start with consumer or direct-workflow evidence.
---

# Bug Investigation

Turn a bug report into a confirmed root-cause analysis and a
ready-to-establish verification plan. This skill investigates; it does not fix
code or edit verification.

Use `common-verification-first` as the governing policy. The intent is
`BUG_FIX`; infrastructure, configuration, and test infrastructure do not create
separate intents.

## When to Use

- A user or reviewer reports incorrect behavior.
- A GitHub issue describes a defect.
- A failing check suggests a regression.
- A patch seems obvious but the root cause has not been demonstrated.

## 1. Build the Fastest Feedback Loop

1. Restate observed behavior, expected behavior, trigger, and environment.
2. Find the narrowest existing way to trigger the symptom: test selector, API
   request, CLI command, build, validator, browser flow, or direct workflow.
3. Reproduce before proposing a fix. If the defect cannot be reproduced, stop
   and report the missing conditions or evidence.
4. Use temporary read-only diagnostics when the failure is otherwise invisible.
   Do not leave instrumentation or edit tracked artifacts during investigation.

### Production Behavior

Find whether existing behavioral verification can reproduce the defect
accurately. Recommend reusing or updating it when possible; otherwise recommend
one focused regression at the lowest level that crosses the failing boundary.
The Verifier will establish and prove that regression before implementation.

### Test Infrastructure

Start with a production-behavior consumer test or direct reproduction of the
affected test workflow. Shared, public, reusable, or independently versioned
support code does not justify direct tests.

Recommend the smallest focused test of a stable support contract only when
consumer or workflow evidence cannot localize the fault precisely enough, and
state the diagnostic precision gap.

## 2. Gather Evidence

From an issue, collect its title, description, reproduction steps, expected and
actual results, environment, labels, and relevant recent comments. From a user
report, resolve material ambiguity before continuing.

Capture command, input, output, and whether the evidence is repeatable.
Separate:

- confirmed observation;
- inference supported by code or runtime evidence; and
- unverified assumption.

## 3. Locate the Root Cause

1. Identify the affected domain, application, adapter, SDK, UI, workflow, or
   support layer.
2. Read the execution path and stable external boundary.
3. Inspect existing verification and explain why it missed the defect.
4. Trace the exact condition and code path that produce the wrong result.
5. Confirm the root cause with the reproduction; do not confuse it with the
   symptom.
6. Identify invariants and neighboring behavior that the fix must preserve.

## 4. Select the Proposed Verification Strategy

For production behavior, choose one focused regression plan:

- reuse an existing behavioral test unchanged;
- update an existing test whose expectation is wrong or incomplete; or
- add one focused regression because the behavior is absent.

Do not keep contradictory expectations or add redundant tests. Choose the
lowest level that proves the real defect without mocking away its cause:

| Defect boundary | Typical level |
| --- | --- |
| Pure domain rule | Unit |
| Application decision with stable ports | Unit or focused integration |
| File, HTTP, cloud provider, or external adapter | Integration |
| DI, command dispatch, or cross-layer wiring | Integration |
| CLI or GitHub Action contract | Integration or e2e |
| UI rendering or interaction | Component or browser test |
| Critical user journey | E2E |

For test infrastructure, use consumer or direct-workflow evidence instead of
this table unless the documented diagnostic exception applies.

## Output

```text
BugAnalysis

Observed behavior:
Expected behavior:
Trigger and environment:
Reproduction command and result:
Confirmed root cause:
Affected code and scope:
Preserved invariants:
Existing coverage and why it missed the defect:
Proposed strategy: reuse | update | add one focused regression | consumer/direct workflow
Proposed behavior and level:
Diagnostic precision gap: none | explanation
Assumptions and unresolved evidence:
Status: READY_TO_ESTABLISH_CONTRACT | NOT_REPRODUCED | BLOCKED
```

At an interactive checkpoint, present this analysis before implementation.
Calling workflows may fold it into their single specification checkpoint.

## Rules

- One defect per investigation.
- Never propose a production fix without confirmed reproduction evidence.
- Never edit production, verification, documentation, configuration, or test
  support.
- Never claim a planned regression has failed until the Verifier actually runs
  it.
- Never add direct support tests for coverage or methodology.
- Surface inability to reproduce instead of guessing.
