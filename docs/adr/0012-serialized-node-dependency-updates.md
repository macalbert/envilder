# ADR-0012: Serialized Node Dependency Updates

## Status

Accepted

## Context

Envilder is a pnpm workspace with one committed root `pnpm-lock.yaml` shared by
the root package and the Node.js SDK workspaces. Updating a dependency changes
both its manifest and the shared lockfile.

The previous Dependabot configuration split Node.js minor and patch updates into
separate AWS SDK, Azure SDK, development, and production groups. Dependabot
could therefore open several pull requests concurrently, each editing the same
lockfile. Merging one pull request regularly made the others conflict, delaying
routine production changes and creating avoidable manual work.

## Decision

Node.js version updates are configured as one Dependabot `npm` entry covering
the root package, Node.js SDK, and Node.js SDK tests. It follows these rules:

1. Dependabot opens at most one Node.js version-update pull request at a time.
2. Minor and patch updates in each manifest are matched by one
   `node-minor-patch` group.
3. Major updates are not part of that group, so they remain individually
   reviewable once the current version-update pull request has merged or closed.
4. The committed lockfile remains required and is updated by Dependabot.
5. The existing auto-merge workflow remains responsible for eligible minor and
   patch pull requests after required CI checks pass.

This policy applies to Dependabot version updates. Security-update handling is
not changed by this ADR.

## Consequences

### Positive

- No two Node.js version-update pull requests modify the shared lockfile at the
  same time.
- Minor and patch maintenance requires fewer reviews and produces fewer merge
  conflicts.
- The lockfile continues to provide reproducible dependency resolution.
- Major upgrades retain explicit review and can be addressed independently.

### Negative

- A failing or deferred Node.js update blocks later version updates until it is
  resolved or closed.
- A grouped minor or patch pull request can contain several dependency changes,
  increasing the scope of one review.

## When to Reconsider

- A Node.js workspace receives its own committed lockfile and no longer shares
  the root lockfile.
- A grouped update repeatedly causes failures that are difficult to isolate.
- A merge queue is introduced and demonstrably removes the lockfile-conflict
  cost while preserving deployment throughput.
