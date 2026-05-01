# Git — Quick Reference

## Commit Types

| Type | When |
| ---- | ---- |
| `feat` | New feature for the user |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding/updating tests |
| `chore` | Build, deps, tooling |

## Commit Format

```txt
<type>(<scope>): <subject>

<optional body>
```

Subject: imperative mood, ≤50 chars, no period, capitalized.

## Branch Naming

```txt
feature/add-group-coupons
fix/stripe-webhook-validation
refactor/split-repositories
docs/update-architecture-adr
```

## PR Workflow

1. Create branch from `main`
2. Small, frequent commits
3. Open PR with conventional title: `feat(groups): add active coupon support`
4. Get review
5. **Squash and merge** to keep linear history
6. Delete branch

## Tagging

```bash
git tag -a v2.1.0 -m "Release v2.1.0 - Add group coupons feature"
git push origin v2.1.0
```

Semantic Versioning: `vMAJOR.MINOR.PATCH`

## CI Workflow Triggers

```yaml
on:
  pull_request:
    branches: ["*"]
    types: [ready_for_review, opened, reopened, synchronize]
    paths:
      - "Envilder/**"
      - "!Envilder/src/apps/frontend/**"  # Exclude frontend

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.sha }}
  cancel-in-progress: true
```

## Workflows

| Workflow | File | Triggers |
| -------- | ---- | -------- |
| Backend tests | test-backend.yml | .NET source changes |
| Shared tests | test-backend-shared.yml | Shared library changes |
| Frontend tests | test-frontend.yml | Frontend changes |
| E2E tests | test-e2e.yml | Frontend + E2E changes |
| IaC tests | test-iac.yml | CDK changes |
| Coverage | coverage-report.yml | After test runs |
| Markdown lint | markdownlint.yml | .md file changes |
