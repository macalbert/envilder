---
name: sdk-release-checklist
description: >-
  Checklist for adding a new SDK or releasing a new SDK version. Covers code,
  tests, website integration (docs page, version badge, changelog sidebar,
  i18n keys), and CI wiring. Use when creating a new runtime SDK, bumping an
  SDK version, or auditing that all integration points are connected.
---

# SDK Release Checklist

Mandatory steps when adding a **new SDK** or **releasing a new version** of an
existing SDK. Prevents drift between code, website, changelogs, and CI.

## When to Use

- Creating a new runtime SDK (e.g., Go, Java, Ruby)
- Releasing a new version of any existing SDK (.NET, Python, TypeScript)
- Auditing that an SDK is fully wired into the website and build system
- After a version bump to verify all integration points are updated

## New SDK — Full Checklist

When adding a brand-new SDK to the project, complete **every** item:

### 1. Code & Tests

- [ ] SDK source under `src/sdks/{runtime}/`
- [ ] Unit tests under `tests/sdks/{runtime}/`
- [ ] Acceptance tests with LocalStack + Lowkey Vault containers
      (see `sdk-acceptance-testing` skill)
- [ ] README.md in SDK root with install, quick start, and API reference

### 2. Version Source File

Every SDK must have a canonical version source read at build time:

| Runtime    | File                               | Field / Tag            |
|------------|------------------------------------|------------------------|
| .NET       | `src/sdks/dotnet/Envilder.csproj`  | `<Version>X.Y.Z</Version>` |
| Python     | `src/sdks/python/pyproject.toml`   | `version = "X.Y.Z"`   |
| Node.js    | `src/sdks/nodejs/package.json` | `"version": "X.Y.Z"`  |
| Go         | Git tag / `go.mod` convention      | `vX.Y.Z` tag          |
| Java       | `pom.xml` or `build.gradle`        | `<version>` / `version =` |

### 3. Website — Version Badge Wiring

The website reads SDK versions at **build time** via `astro.config.mjs`:

- [ ] Add version extraction in `src/website/astro.config.mjs`:
  - For `package.json`: read + `JSON.parse` (see Node.js SDK pattern)
  - For `.csproj`: use `extractCsprojVersion()` helper (regex on `<Version>`)
  - For `pyproject.toml`: use `extractPyprojectVersion()` helper (regex)
- [ ] Add Vite `define` global: `__SDK_{RUNTIME}_VERSION__`
- [ ] Declare in `src/website/src/env.d.ts`: `declare const __SDK_{RUNTIME}_VERSION__: string;`
- [ ] Use dynamic variable in `DocsContent.astro` badge (never hardcode versions)

### 4. Website — Documentation Page Section

- [ ] Add SDK section in `src/website/src/components/DocsContent.astro`
      (install command, quick start code, badge, link to full docs)
- [ ] Add i18n keys to `src/website/src/i18n/types.ts` for all new strings
- [ ] Add translations to every locale file: `en.ts`, `ca.ts`, `es.ts`

### 5. Website — Changelog Integration

- [ ] Create `docs/changelogs/sdk-{runtime}.md` with initial release entry
- [ ] Read changelog in `astro.config.mjs` via `readChangelog()` helper
- [ ] Add Vite `define` global: `__CHANGELOG_SDK_{RUNTIME}__`
- [ ] Declare in `env.d.ts`: `declare const __CHANGELOG_SDK_{RUNTIME}__: string;`
- [ ] Add product entry to `products` array in **all 3** changelog pages:
  - `src/website/src/pages/changelog.astro`
  - `src/website/src/pages/ca/changelog.astro`
  - `src/website/src/pages/es/changelog.astro`
- [ ] Add sidebar nav block (button + version list) in the SDKs group for
      **all 3** changelog pages — maintain correct `parsed[N]` indices
- [ ] Add i18n key `categorySdk{Runtime}` to `types.ts` and all locale files
- [ ] Add to mobile product selector dropdown (automatic if in `products` array)

### 6. Website — SDK Cards Component

- [ ] Add card in `src/website/src/components/Sdks.astro` with install
      command and package manager link

### 7. Copilot Instructions & Build Config

- [ ] Update `.github/copilot-instructions.md` with SDK architecture notes
- [ ] Add to `pnpm-workspace.yaml` if TypeScript/Node-based
- [ ] Add build/test commands to CI workflow

### 8. Documentation Cross-References

- [ ] Add SDK to root `README.md` SDK section
- [ ] Add SDK to `ROADMAP.md` if tracked there
- [ ] Add to `docs/changelogs/` index if one exists
- [ ] Run `doc-sync` skill to verify alignment

## Existing SDK — Version Bump Checklist

When releasing a new version of an already-wired SDK:

- [ ] Bump version in the canonical source file (csproj / pyproject.toml / package.json)
- [ ] Add changelog entry to `docs/changelogs/sdk-{runtime}.md`
- [ ] Verify `pnpm build` in `src/website/` picks up the new version automatically
- [ ] No manual edits needed in `DocsContent.astro` (version is dynamic)

## Validation

After completing the checklist:

```bash
# Build website and verify all versions render
cd src/website && pnpm build

# Grep built HTML for version badges
node -e "const h=require('fs').readFileSync('dist/docs/index.html','utf-8'); \
  console.log(h.match(/NuGet v[\d.]+/)?.[0]); \
  console.log(h.match(/PyPI v[\d.]+/)?.[0]); \
  console.log(h.match(/npm v[\d.]+/)?.[0])"

# Verify changelog page includes all SDKs
node -e "const h=require('fs').readFileSync('dist/changelog/index.html','utf-8'); \
  console.log('dotnet:', h.includes('sdk-dotnet')); \
  console.log('python:', h.includes('sdk-python')); \
  console.log('nodejs:', h.includes('sdk-nodejs'))"
```

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Hardcoded version in badge | Always use `__SDK_*_VERSION__` globals |
| Missing changelog sidebar entry | Check all 3 locale pages, not just `en` |
| Wrong `parsed[N]` index after adding SDK | Count products array entries carefully |
| Forgot i18n key in one locale | Add to `types.ts` first — TypeScript errors catch missing keys |
| Version not updating after bump | Restart dev server (Vite caches `define` values) |
