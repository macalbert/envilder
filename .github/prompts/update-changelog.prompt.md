---
name: "Update Changelog"
description: "Add new entries to docs/changelogs/cli.md following the project's Keep a Changelog format and Conventional Commits mapping."
argument-hint: "version number and change summary, or 'from staged'"
agent: "agent"
---

Update `docs/changelogs/cli.md` with new release entries.

## Inputs

- A version number (e.g., `0.9.0`) and change summary, **or**
- `from staged` to infer changes from `git diff --cached`

If no version is provided, add entries under an `[Unreleased]` section at the
top of the file.

## File Format Rules

The changelog is a **website-ready** markdown file consumed directly by the
Astro documentation site. It must **not** contain:

- A top-level `# Changelog` heading (the website page provides its own)
- Meta sections like "How to Update This Changelog" or "Maintenance"
- Markdown link-reference definitions (`[x.y.z]: https://...`)
- HTML comments (`<!-- ... -->`)

Each version entry follows this structure:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
* Item description ([#PR](https://github.com/macalbert/envilder/pull/PR))

### Changed
* Item description

### Fixed
* Item description

---
```

## Allowed Categories

Use only these H3 categories (omit empty ones):

| Category | Maps from commit type |
|---|---|
| `Added` | `feat` |
| `Changed` | `refactor`, `chore`, `ci`, `style`, `perf` |
| `Fixed` | `fix` |
| `Removed` | when features/options are deleted |
| `Security` | security patches |
| `Documentation` | `docs` |
| `Dependencies` | dependency bumps |
| `Tests` | `test` |

## Workflow

1. Read `docs/changelogs/cli.md` to understand the current top entry.
2. If `from staged`, run `git diff --cached` and categorize changes.
3. Build the new version section following the format above.
4. Insert the new section **at the top** of the file, before existing entries.
5. Separate version sections with `---`.
6. Keep bullets concise and user-impact oriented.
7. Include PR links where available.
8. Run `pnpm lint` to validate.

## Style

- Imperative mood for descriptions ("Add support for…", not "Added support…")
- Bold the scope or component when relevant: `**cli:** description`
- One bullet per logical change; don't merge unrelated items
- Trailing newline at end of file
