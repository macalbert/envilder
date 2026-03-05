---
description: "Use when replying to pull request review comments or change requests. Enforces clear, evidence-based responses tied to concrete file updates and validation results."
name: "PR Review Response Conventions"
---

# PR Review Response Conventions

Apply these rules when drafting responses to PR comments.

- Start with outcome first: state whether the comment was addressed, partially
  addressed, or needs clarification.
- Reference concrete evidence using file paths with line references where
  possible.
- Explain what changed and why in one or two concise bullets.
- Include validation evidence when relevant (`pnpm lint`, `pnpm test`, targeted
  test names).
- If not implemented, state reason and propose a safe alternative.
- Keep tone collaborative and direct; avoid defensive language.
- For multi-comment updates, provide one response block per comment.
- End with explicit next step when reviewer action is needed.
