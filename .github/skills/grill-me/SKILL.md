---
name: grill-me
description: >-
  Interview the user relentlessly about a plan or design until reaching shared
  understanding. Resolves each branch of the decision tree one at a time.
  Use when stress-testing a plan, exploring trade-offs, or validating a design.
---

Interview me relentlessly about every aspect of this plan until we reach a
shared understanding. Walk down each branch of the design tree, resolving
dependencies between decisions one by one.

## Rules

- Ask questions **one at a time**
- For each question, provide your **recommended answer** with brief rationale
- If a question can be answered by **exploring the codebase**, explore it instead of asking
- Reference existing ADRs in `docs/architecture/adr/` — don't re-litigate settled decisions
- Use project domain vocabulary (map-file, provider, facade, etc.)
- When a decision crystallizes that contradicts an existing ADR, flag it explicitly
- Stop when all branches are resolved or user says "enough"
