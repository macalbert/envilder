---
name: website-design-system
description: >-
  Envilder website design system: themes, CSS variables, breakpoints, spacing,
  typography, and component patterns. Use when creating or editing Astro
  components, adding CSS, or styling website pages. Ensures visual consistency
  across retro, light and cream themes.
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

The site uses `data-theme` attribute on `<html>`. Three themes are supported:

| Theme | Selector | Palette |
|-------|----------|---------|
| Retro (default) | `:root` | Game Boy green |
| Light | `[data-theme="light"]` | US SNES (lavender, violet) |
| Cream | `[data-theme="cream"]` | Cream paper, forest ink, lime CTA |

### Rules

- **All colors MUST use CSS variables**: never hardcode hex values
- New variables MUST be defined in `:root` (retro) and in every theme
  block that needs a different value in `global.css`
- Light-theme overrides (`[data-theme="light"]`) usually also apply to
  `[data-theme="cream"]`: list both selectors
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
| Headings (`h1`–`h4`) | Fraunces | `var(--font-display)` (default for headings) |
| Pixel accents (logo, buttons, labels) | Press Start 2P | `var(--font-pixel)` |
| Body text | Inter | Default (inherited) |
| Code / terminal | JetBrains Mono | `<code>`, `<pre>`, or mono class |

- Use `clamp()` for fluid typography
- Never use fixed `px` font sizes
- Keep the pixel font for short labels only; long headings use the display font

Primary buttons use `--color-cta`, `--color-cta-text` and `--color-cta-shadow`
(lime fill in the cream theme). Links keep `--color-primary`.

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

- DO NOT install CSS frameworks or UI libraries: use existing pure CSS
- DO NOT hardcode colors: always CSS variables from `global.css`
- DO NOT use fixed pixel font sizes: use `clamp()` or relative units
- DO NOT break existing responsive layouts when adding new sections
- DO NOT add JavaScript frameworks (React, Vue): Astro components +
  `<script>` tags only
- ONLY add new CSS variables if defined in `:root` and checked in every theme
