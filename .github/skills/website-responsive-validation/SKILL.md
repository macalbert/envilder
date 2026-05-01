---
name: website-responsive-validation
description: >-
  Playwright-based visual validation procedure for Envilder website changes.
  Use when verifying responsiveness across mobile, tablet, and desktop
  breakpoints. Covers the validation workflow, viewport sizes, theme checking,
  and when to trigger validation.
---

# Website Responsive Validation

Visual validation procedure using Playwright browser tools to verify every
website change is responsive and theme-compatible.

## When to Use

- After creating a new component or page section
- After CSS changes (global or scoped)
- After layout modifications
- After i18n changes (verify text renders in each locale)
- Before marking any website work as complete (final pass)

## Prerequisites

The Astro dev server must be running:

```bash
cd src/website && pnpm dev
```

Runs on `http://localhost:4322/`. Keep it running throughout the session.
If already running, reuse it.

## Validation Breakpoints

| Breakpoint | Width × Height | What to check |
|------------|---------------|---------------|
| Mobile | 375 × 812 | Single column, readable text, no horizontal overflow |
| Tablet | 768 × 1024 | 2-column grids, proper spacing, no cramped elements |
| Desktop | 1440 × 900 | Full layout, max-width containment, proper alignment |

## 5-Step Validation Procedure

For **each** breakpoint:

1. **Resize** the browser to the target viewport
2. **Navigate** to the page being edited (or reload if already there)
3. **Take a snapshot** — verify accessibility tree and element structure
4. **Take a screenshot** — verify visual layout and styling
5. **Toggle theme** — click the theme switcher and repeat snapshot + screenshot
   to verify both retro and light themes

## Playwright Tool Cheat Sheet

| Action | Tool | Example |
|--------|------|---------|
| Navigate to page | `browser_navigate` | `http://localhost:4322/` |
| Resize viewport | `browser_resize` | `{ width: 375, height: 812 }` |
| Accessibility snapshot | `browser_snapshot` | Verify structure & text |
| Visual screenshot | `browser_take_screenshot` | Verify layout & styling |
| Click element | `browser_click` | Toggle theme switcher |
| Full-page screenshot | `browser_take_screenshot` | `{ fullPage: true }` |

## Validation Triggers

| Change type | Validation scope |
|-------------|-----------------|
| New component | Full 3-breakpoint validation |
| CSS changes | Full 3-breakpoint validation |
| i18n changes | Navigate to each locale, verify text renders |
| Layout modifications | Full 3-breakpoint validation |
| Before completion | Final full validation pass |

## Common Issues to Watch

- Text overflow on mobile (long words, no `overflow-wrap`)
- Grid items not collapsing to single column on mobile
- Spacing too tight or too wide at tablet breakpoint
- Theme-specific contrast issues (check both themes)
- Missing hover/focus states on interactive elements
- Images or cards breaking out of container max-width
