# AI Workflows

This document describes the AI-assisted development workflows configured for
Envilder via VS Code Copilot agents, prompts, skills, and instructions.

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│  Hooks (lefthook)                                   │
│  pre-commit → biome check --write on staged files   │
├─────────────────────────────────────────────────────┤
│  Prompts (.github/prompts/)                         │
│  /scaffold-feature  /resolve-pr-comments  ...       │
├─────────────────────────────────────────────────────┤
│  Agents (.github/agents/)                           │
│  @TDD Coach  @Code Reviewer  @Bug Hunter  ...       │
├─────────────────────────────────────────────────────┤
│  Skills (.github/skills/)                           │
│  testing-conventions  smart-commit  pr-sync  ...    │
├─────────────────────────────────────────────────────┤
│  Instructions (.github/instructions/)               │
│  architecture · coding · git · review-response      │
└─────────────────────────────────────────────────────┘
```

## SDLC Cycle

Agents and prompts form a guided development cycle. Solid arrows represent
automatic delegation via the `agents:` frontmatter. Dashed arrows represent
suggestions shown to the user (user invokes the next step manually).

```text
/scaffold-feature ···► @TDD Coach ···► /smart-commit ···► /pr-sync
                          │                                    │
                  @TDD Red / Green /          @Code Reviewer ◄┘
                  @TDD Refactor                        │
                                                  @PR Resolver
                                                  ┌────┴─────┐
                                             bug? │          │ code fix
                                           @Bug Hunter   edit + commit
                                                  │
                                          @TDD Red / Green /
                                          @TDD Refactor

─── = suggestion (user invokes)
──► = real delegation (automatic)
```

## Agents

| Agent | Purpose | Can Edit? | Subagents | Next Step |
|-------|---------|-----------|-----------|-----------|
| **@TDD Coach** | Orchestrates TDD | No (coordinator) | TDD Red, TDD Green, TDD Refactor | `/smart-commit` → `/pr-sync`|
| **@TDD Red** | Writes one failing test | Yes | — | *(worker, not user-invocable)* |
| **@TDD Green** | Writes minimal passing code | Yes | — | *(worker, not user-invocable)* |
| **@TDD Refactor** | Improves structure, keeps tests green | Yes | — | *(worker, not user-invocable)* |
| **@Code Reviewer** | Multi-perspective review | No (delegates via agents) | TDD Coach, Code Refactorer, Bug Hunter, PR Resolver, Document Maintainer, Website Designer, i18n Reviewer | `@PR Resolver` |
| **@PR Resolver** | Resolves PR review comments | Yes | Bug Hunter, Code Reviewer, TDD Coach, Code Refactorer, Document Maintainer, Website Designer, i18n Reviewer | `/smart-commit` |
| **@Bug Hunter** | Reproduces and fixes bugs | No (coordinator) | TDD Red, TDD Green, TDD Refactor, TDD Coach, Code Reviewer, Code Refactorer | `/smart-commit` |
| **@Code Refactorer** | Code smell detection, SOLID improvements | Yes | — | `/smart-commit` |
| **@Document Maintainer** | Keeps docs in sync with code changes | Yes | — | — |

## Prompts

| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `/scaffold-feature` | Generate skeleton files for a new feature | Starting a new feature |
| `/resolve-pr-comments` | Process PR review feedback end-to-end | After receiving review comments |
| `/use-semantic-versioning` | Determine correct SemVer bump | Before releasing |

## Skills

| Skill | Purpose | Loaded By |
|-------|---------|-----------|
| `testing-conventions` | Vitest naming, AAA structure, mock patterns | TDD Red, TDD Green, TDD Coach |
| `smart-commit` | Generate conventional commit from staged changes | Any agent after code changes |
| `pr-sync` | Create or update a PR with auto-generated description | PR Resolver, any agent after pushing |
| `doc-sync` | Audit and sync docs across all surfaces | Document Maintainer, Code Reviewer |

## Instructions

| File | Scope | Purpose |
|------|-------|---------|
| `architecture-boundaries` | `src/**/*.ts` | Hexagonal architecture enforcement |
| `coding-and-testing-conventions` | `src/**`, `tests/**`, `e2e/**` | Biome style, logging, secret masking, test patterns|
| `git-conventions` | Git operations | Conventional commits, safe git workflow |
| `review-response` | PR reviews | Evidence-based review responses |

## Hooks

**Lefthook** runs automatically on git operations:

- **pre-commit**: `biome check --write --unsafe` on staged `.ts`, `.js`, `.json`
  files with auto-staging of fixes

## FAQ

### How do I add a new agent?

1. Create `.github/agents/{name}.agent.md` with YAML frontmatter
2. Define `name`, `description`, `tools`, and optionally `agents` (for subagent delegation)
3. Set `user-invocable: false` for worker subagents
4. Add a `## Next Steps` section to guide the SDLC cycle

### How do agents chain together?

Two mechanisms:

- **Automatic delegation**: The `agents:` frontmatter field lists subagents
  that the coordinator can invoke directly (e.g., TDD Coach → TDD Red/Green/Refactor)
- **Suggestions**: Each agent's `## Next Steps` section recommends the natural
  next action (e.g., "Run `/smart-commit`"). The user decides whether to follow.

### Why not full automation?

TDD requires human validation at each Red/Green checkpoint. The hybrid approach
(automatic delegation within a phase, suggestions between phases) preserves user
control where it matters while automating mechanical steps.

### How do I extend with a new secret provider?

No AI workflow changes needed. Implement `ISecretProvider` in
`src/envilder/core/infrastructure/`, then update
`configureInfrastructureServices()` in `ContainerConfiguration.ts`.
The hexagonal architecture keeps the domain and application layers unchanged.
