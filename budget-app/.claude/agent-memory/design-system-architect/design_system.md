---
name: design-system-budget-app
description: Complete design system for the Budget Pro React app — palette, tokens, components, patterns
metadata:
  type: project
---

## Project: Budget Pro — Design System Reference

### Application type
Personal budget management SaaS — French language, clean/premium aesthetic targeting Notion/Linear quality.

### Tech stack
- React 18 + Vite 8
- **Tailwind CSS v4** — config via `@theme {}` in `src/index.css`, NO `tailwind.config.js`
- Dark mode: `.dark` class on `<html>`, toggled via `dispatch({ type: 'SET_THEME' })` in BudgetContext
- Custom variant: `@custom-variant dark (&:where(.dark, .dark *))`
- No class-based `dark:` from config — use `dark:` prefix which maps to the custom variant

### Color palette (Tailwind v4 `@theme` tokens)
| Token | Value | Usage |
|---|---|---|
| `--color-brand-500` | `#6366f1` | Primary indigo |
| `--color-brand-600` | `#4f46e5` | Button backgrounds |
| `--color-brand-400` | `#818cf8` | Active indicators, accents |
| `--color-surface` | `#ffffff` | Card backgrounds |
| `--color-surface-dark` | `#0f172a` | Dark card backgrounds |
| `--color-border` | `#f1f5f9` | Light borders |
| `--color-border-dark` | `#1e293b` | Dark borders |

### Body backgrounds
- Light: `#f1f5f9` (slate-100)
- Dark: `#060b18` (deeper than slate-950)

### Sidebar
- Background: `linear-gradient(180deg, #0d1424 0%, #0f172a 35%, #131a30 65%, #1c1840 100%)`
- Active nav item: `bg-white/[0.09]`, indigo-400 icon, indigo dot indicator
- Hover: `hover:bg-white/[0.05]`
- User card: gradient avatar `#f59e0b → #f43f5e`
- Left accent bar on active: `linear-gradient(180deg, #a5b4fc, #6366f1)`, width `3px`

### KPI Card gradients (used across pages)
- Revenus: `#059669 → #10b981`
- Dépenses: `#e11d48 → #f43f5e`
- Solde: `#4338ca → #6366f1` (positive) / `#ea580c → #f97316` (negative)
- Épargne: `#b45309 → #f59e0b`
- Box-shadow: `0 8px 24px -4px ${from}55, 0 2px 8px -2px ${from}30`

### Dark banner gradient (Budgets + Goals pages)
- `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)`

### Typography scale
- Page titles: `text-2xl font-extrabold tracking-tight`
- Card headers: `text-sm font-bold`
- Labels: `text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide`
- Muted text: `text-xs text-slate-400 dark:text-slate-500`
- Section labels: `text-xs font-extrabold uppercase tracking-widest`

### Component sizing standards
- Cards: `rounded-2xl` or `rounded-3xl` depending on page
- Buttons: `rounded-xl`, height `h-9` (md)
- Inputs: `rounded-xl border-2` (forms), `rounded-xl border` (filters)
- Action icon buttons: `w-7 h-7 rounded-lg`
- Nav items: `rounded-xl px-3 py-2.5`
- Modals: `rounded-3xl`, header has 1px indigo gradient accent bar

### Status colors
- Danger/dépassé: `#f43f5e`
- Warning/attention: `#f97316`
- OK/success: `#10b981`
- Info: `#3b82f6`

### Animation classes (defined in index.css)
- `.animate-fade-slide-up` — page entry (fadeSlideUp 320ms)
- `.animate-fade-in` — quick opacity fade (200ms)
- `.animate-modal-in` — modal spring entry (240ms cubic spring)
- `.animate-scale-in` — scale from 0.95 (200ms)
- `.animate-slide-in-right` — mobile drawer entry (220ms)
- `.stagger-1` through `.stagger-4` — 50ms delay increments

### Invalid Tailwind classes to avoid
- `w-4.5`, `h-4.5` — NOT valid. Use `w-[18px] h-[18px]` instead
- Arbitrary bg-opacity with `/` in v4 requires `bg-color/opacity` syntax

### Key architectural patterns
- All pages use `animate-fade-slide-up` on root `<div>` for page entry
- All icon SVGs have `aria-hidden="true"` 
- Decorative elements have `pointer-events-none` and `aria-hidden="true"`
- Progress bars have `role="progressbar"` with `aria-valuenow/min/max`
- Form inputs have associated `htmlFor` labels with matching `id`
- All action buttons have descriptive `aria-label` attributes

**Why:** See [[feedback_design_approach]]
