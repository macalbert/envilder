---
name: website-content-strategy
description: >-
  Content strategy and audience-aware guidelines for the Envilder website.
  Use when writing page copy, structuring documentation sections, or crafting
  messaging that targets both developers and technical leaders (CTOs).
  Provides product context and selling points per audience.
---

# Website Content Strategy

Guidelines for creating content that communicates Envilder's value to two
distinct audiences: **developers** and **CTOs / technical leaders**.

## When to Use

- Writing new page copy or section content
- Structuring documentation for the website
- Creating comparison tables or feature highlights
- Reviewing content for audience appropriateness
- Adding testimonial-style or value-proposition sections

## Product Context

Envilder is a TypeScript CLI tool and GitHub Action that securely centralizes
environment variables from AWS SSM Parameter Store or Azure Key Vault.

### Three core problems solved

1. **Security**: Secrets never live in `.env` files, git repos, or CI logs —
   fetched from cloud vault at runtime
2. **Consistency**: One `param-map.json` = single source of truth for all
   environments (dev, staging, production)
3. **Developer Experience**: One command replaces manual secret copying,
   reducing onboarding from hours to seconds

## Audience: Developers (Technical Depth)

Developers want to know **how it works** and **how to use it quickly**.

### Content guidelines

- Show real CLI commands and `param-map.json` examples
- Explain `--exec` mode, push mode, and GitHub Action inputs
- Use terminal mockups (`TerminalMockup.astro`) for live demos
- Keep language direct and concise — no marketing fluff
- Include code blocks with copy buttons
- Show common workflows (local dev, CI/CD, team onboarding)

### Key selling points

- One command replaces manual secret management
- Works with existing `.env` workflows — zero migration cost
- Supports `--exec` mode to inject secrets without writing files
- Type-safe configuration via `param-map.json`
- Works locally, in CI, and in production

## Audience: CTOs / Technical Leaders (Strategic Value)

Leaders want to know **business impact** and **risk reduction**.

### Content guidelines

- Lead with business outcomes: compliance, reduced risk, faster onboarding
- Use comparison tables (before/after, with/without Envilder)
- Highlight multi-cloud flexibility and vendor independence
- Quantify impact: "onboard in 1 command instead of 12 manual steps"
- Include trust signals: open-source, MIT license, hexagonal architecture
- Use clear section headers they can scan quickly

### Key selling points

- Zero secrets in source control (compliance-ready)
- Multi-cloud support (AWS SSM + Azure Key Vault) without vendor lock-in
- GitHub Action integration for CI/CD pipelines with no code changes
- Open-source with MIT license — no licensing costs
- Hexagonal architecture — easy to extend with new providers
- Runtime SDKs (.NET, Python, Node.js) for direct app integration

## Content Patterns

### Comparison tables

Use before/after format to show improvement:

```markdown
| Without Envilder | With Envilder |
|------------------|---------------|
| Copy secrets manually from AWS console | `npx envilder --map=map.json` |
| 12 steps to onboard a new developer | 1 command |
| Secrets scattered in .env files | Single source of truth in SSM |
```

### Terminal mockups

For developer-facing content, use `TerminalMockup.astro` to show real
CLI output. More compelling than static code blocks.

### Feature cards

Use `.pixel-card` with emoji icons for feature grids. Group by audience
concern (security, DX, compliance, multi-cloud).

## Constraints

- Never invent features not present in code
- Never make unverifiable performance claims
- Keep technical accuracy — verify against actual CLI flags and behavior
- Balance both audiences on the same page (don't alienate either)
- Product names and CLI flags stay in English (see `website-i18n` skill)
