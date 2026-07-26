# ADR-0010: GitHub Action Bundler

## Status

Accepted

## Context

The GitHub Action must commit a single JavaScript bundle that runs without
installing dependencies. Its previous ncc bundler depends on TypeScript's
compiler API and cannot build with TypeScript 7.0.

## Decision

Use esbuild to bundle the JavaScript emitted by `tsc` into
`github-action/dist/index.js`.

The `build:gha` command compiles the TypeScript source first, preserving
decorator metadata required by Inversify. The esbuild configuration emits an
ES module targeted at Node.js 22 and provides `createRequire` for dependencies
that dynamically load Node.js built-ins.

The composite Action configures Node.js 22 before executing the bundle so its
runtime contract matches the bundle target.

Use tsx rather than ts-node for development scripts that execute TypeScript
directly, because TypeScript 7 no longer provides the compiler API required by
ts-node.

## Consequences

### Positive

- Type checking remains TypeScript's responsibility.
- Bundling no longer depends on TypeScript's compiler API.
- The Action continues to be distributed as one minified file.

### Negative

- The generated bundle is larger than the previous ncc output.
- The build now has separate compilation and bundling steps.

## When to Reconsider

Reconsider if esbuild no longer bundles a GitHub Action dependency correctly,
or if GitHub Action runtime requirements change from Node.js 22.
