# Envilder Agent Skill

[`envilder`](envilder/SKILL.md) is an [Agent Skill](https://agentskills.io/specification)
that teaches AI coding agents to integrate Envilder into an existing project:
write and validate `envilder.json`, run the app locally with `envilder exec`,
load secrets in GitHub Actions, and choose a runtime SDK only when it is
justified. It uses the existing CLI, GitHub Action and SDKs, and it never reads
or prints secret values.

> This directory is the skill for **Envilder users**. The skills in
> [`.github/skills/`](../.github/skills/) are for contributors to this
> repository.

## What it covers

| Workflow | What the agent does |
|----------|---------------------|
| Initialize | Inventories the variables the app reads, picks AWS SSM or Azure Key Vault, writes `envilder.json`, runs `envilder validate --offline` |
| Mappings | Checks keys, secret identifiers and `$config` against the schema; reports missing, stale and drifting mappings |
| Local development | Wires `envilder exec -- <dev command>` into the existing task runner; pull to `.env` only when a tool needs a file |
| CI/CD | Adds `macalbert/envilder/github-action` with GitHub OIDC and least-privilege IAM or RBAC |
| Runtime | Uses the .NET, Python or Node.js SDK only when deployment-time injection is not enough |
| Migration | Maps an existing `.env` by key names only and hands the push command to the user |

Commands that read secret values (pull, `exec`, `validate --compare-values`)
or write them (`--push`) are never run without the user's explicit request.

## Install

The skill lives at `skills/envilder/` in this repository, the path the Agent
Skills tools look for. It is installable from a release that contains this
directory.

### GitHub CLI (any supported agent)

Requires GitHub CLI 2.90 or later (`gh skill` is in public preview):

```bash
gh skill install macalbert/envilder envilder --agent claude-code
gh skill install macalbert/envilder envilder --agent github-copilot
gh skill install macalbert/envilder envilder --agent codex --scope user
```

Without a version, `gh skill` installs from the latest tagged release, then
the default branch. Pin with `envilder@<tag>` or `--pin <tag-or-sha>`, and
update with `gh skill update`.

### skills CLI

```bash
npx skills add macalbert/envilder --skill envilder
```

### Manual copy

Copy `skills/envilder/` (the folder, with `references/`) into the skills
directory your agent reads:

| Agent | Project scope | User scope |
|-------|---------------|------------|
| Claude Code | `.claude/skills/envilder/` | `~/.claude/skills/envilder/` |
| GitHub Copilot (coding agent, CLI, VS Code) | `.github/skills/envilder/`, `.claude/skills/envilder/` or `.agents/skills/envilder/` | `~/.copilot/skills/envilder/` or `~/.agents/skills/envilder/` |
| OpenAI Codex | `.agents/skills/envilder/` | `~/.agents/skills/envilder/` |

Commit a project-scope copy so everyone on the team, and cloud agents such as
the Copilot coding agent, get the same instructions.

## Usage

Agents load the skill automatically when a request matches its description
(Envilder, `envilder.json`, moving `.env` files or hardcoded secrets to AWS
SSM or Azure Key Vault, loading cloud secrets in CI or at runtime). In Claude
Code you can also invoke it explicitly with `/envilder`.

Example requests:

1. "Add Envilder to this ASP.NET API. It reads `ConnectionStrings:Orders` and
   `Payments:ApiKey`, and our parameters live in SSM under `/orders-api/dev/`.
   Set up local development with `envilder exec`."
2. "Our GitHub Actions workflow passes `secrets.DATABASE_URL` and
   `secrets.SESSION_SECRET` to `npm test`. Move them to AWS SSM with Envilder
   and authenticate with OIDC."
3. "This FastAPI service already has an `envilder.json` for Azure Key Vault.
   Check it and load the secrets at startup."
4. "We have a `.env` with five variables. Migrate the secrets to Envilder
   without showing me their values."
5. "`envilder validate` fails on our map file. Explain why and fix it."

## Discovery and distribution

| Mechanism | Status |
|-----------|--------|
| Agent Skills specification (`SKILL.md` with `name` and `description`, `references/`) | Followed. Only standard frontmatter fields are used, so the same folder works in every compatible agent |
| `gh skill install` / `gh skill publish` discovery (`skills/*/SKILL.md`) | Supported: `gh skill publish --dry-run` passes |
| `npx skills add` discovery (`skills/` at the repository root) | Supported by the path convention |
| Claude Code, GitHub Copilot, OpenAI Codex | Manual copy or `gh skill install --agent ...` into their documented directories |
| Claude Code plugin marketplace (`.claude-plugin/marketplace.json`) | Not added. `gh skill` and `npx skills` already install the skill into Claude Code |
| `agent-skills` repository topic | Optional. `gh skill publish` offers to add it; how `gh skill search` ranks repositories is not documented |

A separate skills repository or registry has no documented discovery advantage:
`gh skill`, `npx skills` and the agents read skills from any repository. Keeping
the skill next to the CLI, Action, SDKs and schema lets the contract tests in
[`tests/skills/envilder/`](../tests/skills/envilder/) fail whenever the skill
and the implementation drift apart.

Do not run `gh skill publish` without `--dry-run` here: it creates its own
GitHub release and tag, and this repository's releases are cut by its release
workflow.

## Validation

- `pnpm vitest run tests/skills`: frontmatter rules, relative links, every
  JSON example against the schema and the CLI validator, every CLI option,
  subcommand, Action input and SDK call against the source, and the
  [validation scenarios](../tests/skills/envilder/SCENARIOS.md).
- `gh skill publish --dry-run`: Agent Skills naming and frontmatter rules.
- `claude plugin validate skills`: Claude Code's skill validation.
- [`skills-ref validate skills/envilder`](https://github.com/agentskills/agentskills/tree/main/skills-ref):
  the reference validator of the specification (installed from source).
