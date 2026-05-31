# ADR-0007: Trunk-Based Development

## Status

Accepted

## Context

Envilder is a multi-component monorepo (CLI, GitHub Action, SDKs, website, IaC)
with independent release cycles per component. The team needs a branching
strategy that supports continuous delivery, fast feedback, and low ceremony
while keeping `main` always deployable.

## Decision

### 1. Single Long-Lived Branch

`main` is the only long-lived branch. It is always in a deployable state.
There are no `develop`, `release/*`, or `hotfix/*` branches.

### 2. Short-Lived Feature Branches

All work happens in feature branches that merge to `main` via pull request.

| Rule | Detail |
| ---- | ------ |
| Naming | `{usergithub}/{type}/{name}` (e.g., `macalbert/feat/go-sdk`) |
| Lifetime | < 2-3 days (shorter is better) |
| Merge strategy | Squash merge by default (clean linear history) |
| Direct push to main | Never — always via PR |

### 3. Quality Gates Before Merge

CI must pass before a PR can be merged:

- All tests (unit + acceptance where applicable)
- Lint + format check
- Commitlint validation (enforced locally via lefthook `commit-msg` hook)

### 4. Releases from Main via Version Bumps

Releases are triggered by version-bump detection on push to `main`. The CI
workflow publishes the artifact and then creates a Git tag following the pattern
`{component}/v{semver}` (e.g., `sdk-dotnet/v1.2.0`, `cli/v3.1.0`). No release
branches needed.

### 5. Feature Flags for Incomplete Features

When a feature requires multiple PRs to complete, use feature flags to keep
incomplete code behind a toggle. This allows merging to `main` without exposing
unfinished functionality to users. Feature flags are removed once the feature
is complete.

### 6. Relationship with Continuous Delivery

Trunk-Based Development is inseparable from Continuous Delivery. `main` being
always deployable means any commit can be released at any time. This is a
fundamental property of the workflow, not a side effect.

## Alternatives Considered

### Git Flow (develop + release + hotfix branches)

Over-engineering for a project without multiple major versions in production
simultaneously. Adds ceremony (merge develop → release → main → hotfix →
develop) without value.

**Rejected:** Complexity disproportionate to project needs.

### GitHub Flow with long-lived feature branches

Allow feature branches to live for weeks or months.

**Rejected:** Long-lived branches generate merge conflicts, delay integration
feedback, and break the continuous integration principle. The longer a branch
lives, the riskier the merge.

### Release branches per component

Maintain a `release/sdk-dotnet-1.x` branch for each component's release cycle.

**Rejected:** Tags per component (see monorepo ADR) achieve the same goal
without the branch management overhead. Release branches add complexity when
`main` is always deployable.

## Consequences

### Positive

- Fast feedback loop — changes integrate into main within hours, not days
- No merge hell — short branches rarely conflict
- Always deployable — any commit on main can be released
- Simple mental model — one branch, one truth
- Clean history — squash merge keeps the log readable

### Negative

- Requires discipline — incomplete features must use flags, not long branches
- CI must be fast — slow pipelines block the entire workflow
- Not suitable for maintaining multiple major versions simultaneously

## When to Reconsider

Reconsidering TBD is effectively a step backwards from Continuous Delivery.
The only valid reason would be the emergence of a branching strategy that is
objectively superior to TBD for continuous delivery — which is unlikely given
TBD+CD is the current industry gold standard.

Practical scenarios that might force adaptation (not abandonment):

- Maintaining multiple major versions simultaneously (v1.x + v2.x) — would
  require long-lived support branches alongside TBD on main
- Team scaling issues where merge queues or stricter branch protection become
  necessary — these are additive (complement TBD, not replace it)
