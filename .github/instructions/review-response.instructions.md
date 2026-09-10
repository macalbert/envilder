---
description: "Use when replying to pull request review comments or change requests. Enforces clear, evidence-based responses tied to concrete file updates and validation results."
name: "PR Review Response Conventions"
---

# PR Review Response Conventions

Apply these rules when drafting responses to PR comments.

**Every review comment MUST receive a reply on GitHub: no exceptions.**
Whether addressed, skipped, or answered, always post a reply in the review
thread. A comment without a GitHub reply is never considered done.

An approved action or disposition intrinsically includes its normal factual
outcome reply; do not request separate reply authorization or wording approval.
For PR Resolver, disclose the applicable bundled lifecycle and scope before
action approval: implement, stage the separately approved exact patch, create a
separate conventional commit, make any necessary non-force push to the actual PR
head remote/branch, reply with action and reason, then confirm resolution after
the reply is confirmed. Record authorization and explicit limits in the
action/handoff; no action approval means no execution. Do not request repeated
commit/push/reply/resolve or generated-wording permission. Exact-patch content
approval remains separate and mandatory before staging; never approve unseen
future hunks. Honor local-only/no-push limits and report blocked gates without
pressure to remove limits. Questions/disagreements/skips authorize
reply/resolution, not manufactured artifacts, commits, or pushes. This is not a
message-approval exception for standalone Smart Commit or unrelated workflows.

Prepare replies while processing comments. Publish only after completion of the
decided actions and successful existing aggregate validation, at the workflow's
existing batch boundary. For PR Resolver, also require every applicable
[final-PASS, committed-candidate, and remote-containment gate](../agents/pr-resolver.agent.md#workflow);
no-artifact-only batches retain their existing exemptions, and any required
failure holds mixed batches in full. Failed, missing, ambiguous, or `BLOCKED`
evidence means no publication: leave threads open and report the blocker.
Preserve duplicate/uncertain-mutation checks; confirm the mandatory reply in the
existing thread before resolving the correct thread.

- Always write GitHub replies in English, regardless of the conversation language.
- Start with the actual outcome: describe the action actually taken, direct
  answer, or decided disposition.
- Always explain why, including relevant technical reasoning, tradeoffs, or
  protected behavior, so the reviewer understands the decision.
- Reference concrete evidence using file paths with line references where
  possible.
- Include actual validation evidence when relevant (`pnpm lint`, `pnpm test`,
  targeted test names). Never invent fixes, commits, or verification results.
- If not implemented, explain the decided reason and propose a safe alternative
  when useful.
- Keep the tone educational, respectful, collaborative, and concise. Share useful
  reasoning without defensiveness, patronizing language, verbose boilerplate, or
  replies that only say "Fixed".
- For multi-comment updates, provide one response block per comment.
- End with explicit next step when reviewer action is needed.
