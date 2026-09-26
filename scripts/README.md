# Scripts

This directory contains utility scripts for the Envilder project.

## `pack-and-install.ts`

This script is used to build the Envilder project, create a local tarball package (similar to `npm pack`),
and then install it globally from the local tarball. This allows for testing the `envilder` CLI as if it were
installed from npm, ensuring that packaging and global installation work correctly.

### Usage

You can run this script using the following npm command defined in `package.json`:

```bash
npm run local:install
```

This command will first build the project (`pnpm build`) and then execute `pack-and-install.ts`.
Behind the scene it runs:

```bash
pnpm build
pnpm exec tsx scripts/pack-and-install.ts
```

You can also run this command directly if you prefer.

## Publishing Workflows

### GitHub Action Publishing (`.github/workflows/publish-action.yml`)

The GitHub Action publish workflow bundles the action into a single optimized minified file using esbuild,
making it fast to load and ready to use without any build steps for users.

**The Solution:**

The workflow is started manually (`workflow_dispatch`) with a `version` input
(`MAJOR.MINOR.PATCH`, without the `v` prefix or leading zeros; anything else fails fast).

1. Uses esbuild to bundle compiled JavaScript + all dependencies → single minified `github-action/dist/index.js`
2. Validates the `version` input and checks whether tag `v<version>` already exists
3. **New version** (no tag yet):
   1. Builds bundle with `pnpm build:gha`, with minification configured in the
      esbuild script
   2. Commits the generated `github-action/dist/index.js` and root `action.yml`
      to current branch
   3. Creates and pushes the version tag (e.g., `v0.7.0`)
   4. Moves the major tag (e.g., `v0`) to the new version
   5. Creates the GitHub release
4. **Existing version** (tag already created, e.g. by `publish-npm.yml` when the
   CLI and the Action share a version):
   1. Checks out the existing tag, asserts that `github-action/dist/index.js`,
      `github-action/action.yml` and `action.yml` are tracked in it, and runs
      `pnpm verify:gha` against it (fails if any file is missing or stale)
   2. Moves the major tag (e.g., `v0`) to that tag; no commit, version tag or
      release is created

This approach ensures:

- ✅ Users can use the action immediately without building
- ✅ Single optimized minified bundle with all dependencies
- ✅ Fast startup time (no node_modules resolution)
- ✅ Re-running for an existing version is safe: it never re-creates the version tag, and only moves the major tag after the bundle is verified
  - ⚠️ The major tag always follows the dispatched version, so dispatching a version older than the one `v0` points to moves `v0` backwards. Always dispatch the latest published version.
- ✅ Repository stays ultra-clean (only the minified bundle and the action manifests are tracked, no source maps or type definitions)

**Key workflow steps:**

The version is passed to every `run` block through the `VERSION` environment
variable (never interpolated with `${{ inputs.version }}` inside shell code),
and tags are always referenced as `refs/tags/...` so a branch with the same
name is never picked up.

```yaml
env:
  VERSION: ${{ inputs.version }}

steps:
  - name: 🔍 Check if Already Published
    id: version-check
    run: |
      if git rev-parse -q --verify "refs/tags/v$VERSION" >/dev/null; then
        echo "should_publish=false" >> "$GITHUB_OUTPUT"
      else
        echo "should_publish=true" >> "$GITHUB_OUTPUT"
      fi

  - name: 🕹️ Warp to the Existing Level (Checkout version tag)
    if: steps.version-check.outputs.should_publish == 'false'
    run: git checkout --detach "refs/tags/v$VERSION"

  # ... install pnpm + dependencies (uses the checked-out packageManager) ...

  - name: 🔎 Inspect the Existing Castle (Verify tagged bundle is fresh)
    if: steps.version-check.outputs.should_publish == 'false'
    run: |
      # verify:gha ignores untracked files, so make sure the tag really ships them
      git ls-files --error-unmatch github-action/dist/index.js github-action/action.yml action.yml >/dev/null
      pnpm verify:gha

  # ... new versions only: build, commit bundle, create version tag ...

  - name: ⭐ Collect the Star (Update major tag)
    run: |
      MAJOR_VERSION=$(echo "v$VERSION" | cut -d. -f1)
      TARGET_COMMIT=$(git rev-parse "refs/tags/v$VERSION^{commit}")
      git tag -fa "$MAJOR_VERSION" "$TARGET_COMMIT" -m "⭐ Power-up $MAJOR_VERSION now at v$VERSION"
      git push origin "refs/tags/$MAJOR_VERSION" --force
```

### NPM Package Publishing (`.github/workflows/publish-npm.yml`)

Standard npm publishing workflow - compiled files are included in the package tarball via `package.json`
`files` field.
