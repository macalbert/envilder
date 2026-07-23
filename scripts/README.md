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

1. Uses esbuild to bundle compiled JavaScript + all dependencies → single minified `github-action/dist/index.js`
2. Workflow checks if version tag already exists (skip if duplicate)
3. Builds bundle with `pnpm build:gha` (includes `--minify` flag)
4. Commits only `github-action/dist/index.js` to current branch
5. Creates version tag (e.g., `v0.7.0`)
6. Pushes tag to GitHub

This approach ensures:

- ✅ Users can use the action immediately without building
- ✅ Single optimized minified bundle with all dependencies
- ✅ Fast startup time (no node_modules resolution)
- ✅ Version check prevents duplicate publishes
- ✅ Repository stays ultra-clean (only index.js tracked, no source maps or type definitions)

**Key workflow steps:**

```yaml
- name: 🔍 Check if Already Published
  id: version-check
  run: |
    if git rev-parse "v${{ inputs.version }}" >/dev/null 2>&1; then
      echo "should_publish=false" >> $GITHUB_OUTPUT
    else
      echo "should_publish=true" >> $GITHUB_OUTPUT
    fi

- name: 🏗️ Build the Castle
  if: steps.version-check.outputs.should_publish == 'true'
  run: pnpm build:gha

- name: 📝 Commit Built Files
  if: steps.version-check.outputs.should_publish == 'true'
  run: |
    git add -f github-action/dist/index.js
    git commit -m "build: update compiled files for v${{ inputs.version }}"
    git push origin HEAD

- name: 🏁 Place the Flagpole
  if: steps.version-check.outputs.should_publish == 'true'
  run: |
    git tag -a "v${{ inputs.version }}" -m "Release v${{ inputs.version }}"
    git push origin "v${{ inputs.version }}"
```

### NPM Package Publishing (`.github/workflows/publish-npm.yml`)

Standard npm publishing workflow - compiled files are included in the package tarball via `package.json`
`files` field.
