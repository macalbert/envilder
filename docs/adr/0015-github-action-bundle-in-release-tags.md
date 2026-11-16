# ADR-0015: GitHub Action Bundle in Release Tags

## Status

Accepted. Amends how [ADR-0010](./0010-github-action-bundler.md) distributes
the bundle; the bundler choice is unchanged.

## Context

The GitHub Action runs `github-action/dist/index.js`, a single esbuild bundle
of the TypeScript source and its production dependencies. `main` tracked that
file, and CI (`verify-build`, `test-action`) failed whenever it no longer
matched a fresh build.

Dependabot updates the manifests and `pnpm-lock.yaml` but never rebuilds the
bundle. Every Node.js dependency update that changed the bundle therefore
failed CI, or merged with a stale bundle when the checks were not required.
Rebuilding it automatically on the Dependabot branch needs a write token in
the same job that installs and runs the updated dependencies (a supply-chain
risk), or a separate GitHub App or personal access token so the push
retriggers the required checks.

## Decision

1. `main` does not track `github-action/dist/index.js` (it is gitignored).
   The root `action.yml` stays tracked: it is generated from
   `github-action/action.yml` and does not depend on dependency versions.
2. `scripts/tag-action-release.sh` builds the bundle, commits it on top of
   the checked-out commit and pushes only the release tag. The release commit
   is reachable from the tag, never from `main`.
3. Both release workflows use that script: `publish-npm.yml`, which creates
   the `v<version>` tag shared by the CLI and the Action, and
   `publish-action.yml` for a version that has no tag yet. For an existing
   tag, `publish-action.yml` keeps verifying that the tag ships a fresh bundle
   before moving the major tag.
4. CI builds the bundle from source. `test-action.yml` runs
   `node github-action/dist/index.js` with the inputs as `INPUT_*` variables,
   as `github-action/action.yml` does, because `$/github-action` runs the
   committed action (which has no bundle) and `actions.lock` cannot cover
   `./github-action`.

## Consequences

### Positive

- Dependency updates can no longer leave a stale bundle on `main`, and need
  no rebuild, credential or write token.
- CI tests the bundle built from the code under review.
- Pull request diffs no longer include a minified bundle.

### Negative

- Referencing the Action at `@main`, or at any branch, no longer works; only
  release tags ship the bundle.
- Release tags point to commits that are not on `main`.
- `test-action.yml` no longer exercises the input wiring of
  `github-action/action.yml`; it mirrors it instead.
- The tagging path only runs when a release is published.

## When to Reconsider

Reconsider if GitHub Actions gains a supported way to run a JavaScript action
built during the workflow, or if users need to reference the Action at a
branch.
