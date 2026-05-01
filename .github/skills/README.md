# Copilot Skills & Agents

This directory contains VS Code Copilot agent customizations for the Envilder
repository: **skills** (reusable knowledge modules) and **agents** (specialized
personas that orchestrate work).

## How It Works

```text
User ──→ Agent (persona + workflow) ──→ loads Skills (domain knowledge)
                                    ──→ delegates to Sub-agents
```

- **Skills** live in `.github/skills/{name}/SKILL.md` — domain knowledge,
  conventions, and procedures that agents load on demand.
- **Agents** live in `.github/agents/{name}.agent.md` — personas with specific
  tools, workflows, and delegations.
- **Instructions** live in `.github/instructions/` — always-on rules scoped by
  file pattern (architecture boundaries, coding conventions, git).

## Skills (24)

### Category: Code Quality

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `code-bug-investigation` | ✅ | Bug report → feedback loop → reproduction → TDD fix |
| `code-quality-crap` | ✅ | CRAP score formula, thresholds, when to split methods |
| `code-refactoring` | ✅ | Smell catalog, safe incremental refactoring patterns |
| `code-review-perspectives` | ✅ | 5 analysis perspectives: correctness, architecture, security, conventions, complexity |

### Category: Common (auto-loaded, not user-invocable)

| Skill | Purpose |
|-------|---------|
| `common-architecture-decisions` | ADR index — check before proposing changes |
| `common-git` | Conventional commits, branching, PR workflow |
| `common-security` | Secret handling, Secretlint, OIDC, input validation |
| `common-testing-conventions` | AAA pattern, naming, assertions across all stacks |

### Category: Stack-Specific Testing

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `core-testing` | ✅ | Vitest conventions for Envilder TypeScript core |
| `dotnet-test-doubles` | ✅ | Bogus, AutoFixture, NSubstitute, WireMock patterns |
| `python-testing` | ✅ | pytest conventions, mocking, async testing |
| `typescript-cdk-testing` | ✅ | CDK snapshot tests, Template.fromStack() assertions |

### Category: SDK

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `sdk-acceptance-testing` | ✅ | TestContainers + LocalStack + Lowkey Vault patterns |
| `sdk-release-checklist` | ✅ | New SDK or version release checklist |

### Category: Documentation

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `doc-maintenance` | ✅ | Changelog entries, README updates, doc format |
| `doc-sync` | ✅ | Audit docs vs code drift across website/READMEs/docs |

### Category: Website

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `website-content-strategy` | ✅ | Audience-aware copy (developers + CTOs) |
| `website-design-system` | ✅ | Themes, CSS variables, breakpoints, components |
| `website-i18n` | ✅ | i18n workflow: type def → locale files → pages |
| `website-responsive-validation` | ✅ | Playwright viewport validation procedure |

### Category: Workflow

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `workflow-pr-sync` | ✅ | Create/update PR with auto-generated title+description |
| `workflow-smart-commit` | ✅ | Stage + conventional commit from diff analysis |

### Category: Planning

| Skill | Invocable | Purpose |
|-------|-----------|---------|
| `grill-me` | ✅ | Stress-test a plan — interview relentlessly |
| `to-issues` | ✅ | Break plan into vertical-slice GitHub issues |
| `zoom-out` | `/zoom-out` only | Map modules/callers at higher abstraction level |

## Agents (7)

| Agent | Role | Delegates to |
|-------|------|-------------|
| **TDD Coach** | Orchestrates Red-Green-Refactor. Plans, delegates, never writes code. | TDD Red, TDD Green, TDD Refactor |
| **TDD Red** | Writes one failing test | — |
| **TDD Green** | Writes minimum code to pass | — |
| **TDD Refactor** | Improves structure, keeps tests green | — |
| **Code Reviewer** | 5-perspective analysis + verification | TDD Coach, PR Resolver |
| **Content Designer** | Website, docs, changelogs, translations, CSS | Code Reviewer |
| **PR Resolver** | Processes PR review comments, commits fixes, replies on GitHub | TDD Coach |

## Key Properties

### Skill YAML Frontmatter

```yaml
---
name: skill-name              # Must match parent directory name
description: >-               # One-liner for discovery
  What this skill does...
user-invocable: false          # Hide from / menu (optional, default: true)
disable-model-invocation: true # Only via /slash-command (optional)
---
```

### Agent YAML Frontmatter

```yaml
---
name: Agent Name
description: >
  What this agent does...
tools: [read, search, edit, execute, agent]
agents: ['Sub Agent 1', 'Sub Agent 2']
argument-hint: "what to pass"
user-invocable: true
---
```

## Conventions

1. **Naming**: lowercase + hyphens, max 64 chars. Category prefix groups related
   skills (`code-*`, `common-*`, `sdk-*`, `website-*`, `workflow-*`, `doc-*`).
2. **ADR-awareness**: Agents check `docs/architecture/adr/` before proposing
   structural changes.
3. **Domain vocabulary**: Use terms from `CONTEXT.md` (map file, provider,
   facade, port, adapter, etc.).
4. **`common-*` skills are auto-loaded** (`user-invocable: false`) — they apply
   silently when relevant via instruction file `applyTo` patterns.
5. **`disable-model-invocation: true`** means the skill is only triggered by the
   user typing `/skill-name` — the model won't auto-load it.

## Influences

- [Matt Pocock's skills](https://github.com/mattpocock/skills) — Patterns adopted:
  `grill-me`, `to-issues`, `zoom-out`, "build a feedback loop first" philosophy
  in bug investigation, deep modules heuristic in TDD planning, and the
  `CONTEXT.md` domain glossary convention.
- [VS Code Copilot docs — Nested subagents](https://code.visualstudio.com/docs/copilot/agents/subagents#_nested-subagents) —
  Inspiration for the TDD Coach multi-agent architecture (coordinator +
  specialized workers).
