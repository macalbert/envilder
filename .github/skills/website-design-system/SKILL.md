---
name: website-design-system
description: >-
  Envilder website design system: themes, CSS variables, breakpoints, spacing,
  typography, and component patterns. Use when creating or editing Astro
  components, adding CSS, or styling website pages. Ensures visual consistency
  across retro and light themes.
---

# Website Design System

Rules and patterns for the Envilder website's pure CSS design system.

## When to Use

- Creating new Astro components or page sections
- Adding or modifying CSS (global or scoped)
- Choosing between existing utility classes
- Defining new CSS variables
- Reviewing PRs that touch website styling

## Themes

The site uses `data-theme` attribute on `<html>`. Two themes are supported:

| Theme | Selector | Palette |
|-------|----------|---------|
| Retro (default) | `:root` | Game Boy green |
| Light | `[data-theme="light"]` | Warm neutrals |

### Rules

- **All colors MUST use CSS variables** — never hardcode hex values
- New variables MUST be defined in **both** `:root` (retro) and
  `[data-theme="light"]` blocks in `global.css`
- Never modify the theme switcher mechanism or its localStorage key

```css
/* ✓ Correct */
color: var(--color-text);
background: var(--color-bg);

/* ✗ NEVER */
color: #8bac0f;
background: #1a1a2e;
```

## Responsive Breakpoints

Mobile-first approach. Default styles target mobile; expand with `min-width`.

| Breakpoint | Target | Pattern |
|------------|--------|---------|
| Default | Mobile | Single column, compact spacing |
| `min-width: 640px` | Tablet | 2-column grids, expanded spacing |
| `min-width: 1024px` | Desktop | 3-4 column grids, full layout |

### Grid Utilities

Use existing grid classes: `.grid-2`, `.grid-3`, `.grid-4`.

## Spacing & Layout

Use the spacing scale defined in `global.css`:

- Variables: `--space-xs` through `--space-4xl`
- Container max-width: `--max-width` (1200px)

## Typography

| Use | Font | Access |
|-----|------|--------|
| Section titles / pixel style | Press Start 2P | Via `.pixel-card h3` or custom class |
| Body text | Inter | Default (inherited) |
| Code / terminal | JetBrains Mono | `<code>`, `<pre>`, or mono class |

- Use `clamp()` for fluid typography
- Never use fixed `px` font sizes

## Component Patterns

Reuse existing CSS classes for visual consistency:

| Class | Purpose |
|-------|---------|
| `.pixel-card` | Bordered cards with pixel corner notches |
| `.pixel-icon` | Emoji with pixelated filter |
| `.pixel-shadow` | 4px offset retro shadow |
| `.badge` | Small label badges |
| `.pixel-divider` | Section separator |
| `.scanlines` | CRT overlay effect (use sparingly) |
| `.section` | Standard section wrapper with vertical padding |

## File Locations

| What | Where |
|------|-------|
| Global CSS | `src/website/src/styles/global.css` |
| Components | `src/website/src/components/*.astro` |
| Layout | `src/website/src/layouts/BaseLayout.astro` |

## Constraints

- DO NOT install CSS frameworks or UI libraries — use existing pure CSS
- DO NOT hardcode colors — always CSS variables from `global.css`
- DO NOT use fixed pixel font sizes — use `clamp()` or relative units
- DO NOT break existing responsive layouts when adding new sections
- DO NOT add JavaScript frameworks (React, Vue) — Astro components +
  `<script>` tags only
- ONLY add new CSS variables if defined in both theme blocks
