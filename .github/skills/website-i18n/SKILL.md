---
name: website-i18n
description: >-
  Envilder website internationalization workflow. Use when adding, editing, or
  reviewing translated strings, creating localized pages, or verifying i18n
  completeness. Covers the full lifecycle from type definition to locale files.
---

# Website i18n

Every user-visible string on the Envilder website MUST go through the i18n
system. Never hardcode text in components.

## When to Use

- Adding new user-visible text to any component or page
- Creating a new page (must create locale variants)
- Reviewing PRs that add/change website content
- Checking i18n completeness after content changes

## File Locations

| What | Where |
|------|-------|
| Translation types | `src/website/src/i18n/types.ts` |
| Locale files | `src/website/src/i18n/{en,ca,es}.ts` (one per locale) |
| i18n utilities | `src/website/src/i18n/utils.ts` |
| Astro i18n config | `src/website/astro.config.mjs` → `i18n.locales` |
| Pages (default locale) | `src/website/src/pages/*.astro` |
| Pages (other locales) | `src/website/src/pages/<locale>/*.astro` |

## Adding New Translations — 4-Step Workflow

### 1. Define the type

Add the new key structure in `src/website/src/i18n/types.ts`:

```typescript
// In the Translations interface
section: {
  title: string;
  description: string;
};
```

### 2. Add strings to every locale file

Update **all** locale files in `src/website/src/i18n/`:

- `en.ts` — English (source)
- `ca.ts` — Catalan
- `es.ts` — Spanish

TypeScript will error if any locale is missing a key defined in `types.ts`.

### 3. Use in component

Access translations via the `useTranslations` helper:

```astro
---
import { useTranslations } from '../i18n/utils';
const { lang = 'en' } = Astro.props;
const t = useTranslations(lang);
---
<h2>{t.section.title}</h2>
<p>{t.section.description}</p>
```

### 4. Create localized pages

For new pages:

- Default locale: `src/website/src/pages/new-page.astro`
- Other locales: `src/website/src/pages/<locale>/new-page.astro`

Check `astro.config.mjs` → `i18n.locales` to discover all active locales.

## Terms That MUST NOT Be Translated

Product names, CLI flags, code tokens, and acronyms stay in English:

`envilder`, `AWS SSM`, `Azure Key Vault`, `GitHub Action`, `param-map.json`,
`.env`, `--map`, `--envfile`, `--exec`, `--provider`, `--push`, `CI/CD`, `IAM`,
`RBAC`, `CLI`, `API`, `JSON`, `YAML`, `Node.js`, `pnpm`, `npx`

## Constraints

- Never hardcode user-visible text — always use i18n keys
- Never hardcode version numbers — use `__SDK_*_VERSION__` / `__APP_VERSION__`
  globals from `astro.config.mjs`
- All 3 locales must be updated simultaneously (TypeScript catches mismatches)
- Preserve existing key structure — add new keys, don't rename existing ones
  without updating all references

## Verification

After adding translations:

1. TypeScript compilation catches missing keys (`tsc --noEmit` or dev server)
2. Navigate to each locale in dev server to verify text renders
3. Optionally delegate to `@i18n Reviewer` for linguistic quality check
