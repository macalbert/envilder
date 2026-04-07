---
name: common-git
description: Git commit messages, PR workflow, and branching strategy using Conventional Commits and Semantic Versioning. Use when creating commits, pull requests, or managing Git workflow.
---

# Git Conventions

This skill defines Git commit and PR conventions.

## Commit Message Format

Use **Conventional Commits** format:

```xml
<type>(<scope>): <subject>

<body>
```

### Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code formatting (no logic changes)
- **refactor**: Code refactoring (no behavior changes)
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling
- **BREAKING CHANGE**: Introduces breaking changes

### Examples

```bash
feat(groups): add active coupon support

Implements the ability to assign a single active public coupon to a group.
This replaces the previous visibility-based approach.

Closes #123
```

```bash
fix(stripe): correct webhook signature validation

The webhook signature was not being validated correctly due to
incorrect header parsing. This fix ensures proper validation.
```

```bash
refactor(repository): separate read and write repositories

Implements CQRS pattern by splitting IXXTemplateXXRepository into
separate read and write interfaces for better optimization.
```

### Commit Guidelines

1. **Separate subject from body** with a blank line
2. **Limit subject line** to 50 characters
3. **Capitalize subject line**
4. **No period at end** of subject
5. **Use imperative mood** ("add" not "added")
6. **Wrap body at 72 characters**
7. **Explain what and why**, not how

## Pull Request Workflow

### PR Title

Follow same convention as commits:

```txt
feat(groups): add collaborative group ownership
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Added X functionality
- Updated Y component
- Fixed Z issue

## Screenshots (if applicable)
![Screenshot](url)

## Checklist
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build passes locally
- [ ] No breaking changes (or documented)
```

### Merge Strategy

Use **Squash and Merge** to keep main branch clean:

- All commits in PR squashed into single commit
- Commit message follows conventional commits
- History remains linear and readable

## Branching Strategy

### Trunk-Based Development

- **main** - Production-ready code
- **feature/** - Feature branches (short-lived)
- **fix/** - Bug fix branches (short-lived)

### Branch Naming

```txt
feature/add-group-coupons
fix/stripe-webhook-validation
refactor/split-repositories
docs/update-architecture-adr
```

### Workflow

1. Create branch from `main`
2. Make small, frequent commits
3. Push to remote frequently
4. Open PR when ready
5. Get approval from team member
6. Squash and merge to `main`
7. Delete feature branch
8. Tag release if deploying

## Tagging Releases

Use **Semantic Versioning**:

```txt
vMAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Examples tag

```bash
# Create tag
git tag -a v2.1.0 -m "Release v2.1.0 - Add group coupons feature"

# Push tag
git push origin v2.1.0
```

## Summary

- **Conventional Commits** for all commits
- **Squash and merge** for PRs
- **Trunk-based development** on main
- **Semantic versioning** for releases
- **Short-lived branches** (delete after merge)
- **Descriptive PR titles** and descriptions

When working with Git:

1. Use conventional commits format
2. Write descriptive commit messages
3. Create focused, small PRs
4. Get code reviews before merging
5. Squash and merge to main
6. Delete branches after merge
7. Tag releases with semantic versioning
