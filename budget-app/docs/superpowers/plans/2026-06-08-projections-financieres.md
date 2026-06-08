# R7 — Page Projections Financières Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/projections` page showing monthly forecast cash flow (revenue / expenses / net savings) over 3/6/12 months, calculated from the average of the last 3 completed months.

**Architecture:** Pure function `getProjectionsMensuelles` added to `calculations.js`; `Projections.jsx` renders banner + KPIs + grouped Recharts BarChart (solid bars = real data, dashed bars = projections); App.jsx, Sidebar.jsx, and BottomNav.jsx wired up last.

**Tech Stack:** React 18, Vite, Tailwind v4, Recharts, date-fns (`format`, `subMonths`, `addMonths`, `parseISO`), Vitest, CSS custom properties for theming.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/utils/calculations.js` | Add `getProjectionsMensuelles` pure function |
| Create | `src/pages/Projections.jsx` | Full page: banner, KPIs, chart, empty state |
| Modify | `src/App.jsx` | Add `/projections` route + import |
| Modify | `src/components/layout/Sidebar.jsx` | Add nav entry between Graphiques and Objectifs |
| Modify | `src/components/layout/BottomNav.jsx` | Add nav entry between Graphiques and Objectifs |

---

## Task 1 — `getProjectionsMensuelles` pure function (TDD)

**Files:**
- Modify: `src/utils/calculations.js`
- Test: `src/utils/calculations.test.js`

### Step 1a — Write the failing tests

Open `src/utils/calculations.test.js` and append after the existing `getKpiTendance` suite:

```js
// ── getProjectionsMensuelles ─────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getProjectionsMensuelles } from './calculations.js'
```

> **Note:** The `describe`/`it`/`expect` import is already at the top of the file.
> Only add `vi` to the existing import, and add the `getProjectionsMensuelles` import to the existing import line from `./calculations.js`.

Full additions to `calculations.test.js`:

```js
// ── getProjectionsMensuelles ─────────────────────────────────────────────────
// System time frozen at 2026-06-15 for all tests in this suite.

describe('getProjectionsMensuelles', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // Fixtures: 3 completed months (mars, avril, mai) + current month (juin)
  const txns3Mois = [
    { id: 'm1', type: 'revenu',  montant: 300000, date: '2026-03-01' },
    { id: 'm2', type: 'depense', montant: 200000, date: '2026-03-10' },
    { id: 'a1', type: 'revenu',  montant: 320000, date: '2026-04-01' },
    { id: 'a2', type: 'depense', montant: 220000, date: '2026-04-10' },
    { id: 'b1', type: 'revenu',  montant: 340000, date: '2026-05-01' },
    { id: 'b2', type: 'depense', montant: 240000, date: '2026-05-10' },
    { id: 'c1', type: 'revenu',  montant: 250000, date: '2026-06-01' },
    { id: 'c2', type: 'depense', montant: 150000, date: '2026-06-05' },
  ]
  // moyenneRevenus  = (340000 + 320000 + 300000) / 3 = 320000
  // moyenneDepenses = (240000 + 220000 + 200000) / 3 = 220000

  it('retourne exactement horizonMois entrées (max(horizon, 4))', () => {
    expect(getProjectionsMensuelles(txns3Mois, 6)).toHaveLength(6)
    expect(getProjectionsMensuelles(txns3Mois, 12)).toHaveLength(12)
    // horizon=3 is clamped to 4 minimum
    expect(getProjectionsMensuelles(txns3Mois, 3)).toHaveLength(4)
  })

  it('les 3 premières entrées ont estProjection: false (passé + courant)', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[0].estProjection).toBe(false)
    expect(result[1].estProjection).toBe(false)
    expect(result[2].estProjection).toBe(false)
  })

  it('les 3 dernières entrées pour horizon=6 ont estProjection: true', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[3].estProjection).toBe(true)
    expect(result[4].estProjection).toBe(true)
    expect(result[5].estProjection).toBe(true)
  })

  it('les mois sont dans l\'ordre chronologique correct', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[0].mois).toBe('2026-04')  // 2 mois passés
    expect(result[1].mois).toBe('2026-05')
    expect(result[2].mois).toBe('2026-06')  // courant
    expect(result[3].mois).toBe('2026-07')  // futurs
    expect(result[4].mois).toBe('2026-08')
    expect(result[5].mois).toBe('2026-09')
  })

  it('les données réelles sont utilisées pour les mois passés', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    // Mai 2026 → index 1 (1 mois avant courant)
    expect(result[1].revenus).toBe(340000)
    expect(result[1].depenses).toBe(240000)
    // Juin courant → index 2
    expect(result[2].revenus).toBe(250000)
    expect(result[2].depenses).toBe(150000)
  })

  it('les mois futurs utilisent la moyenne des 3 derniers mois complets', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[3].revenus).toBe(320000)
    expect(result[3].depenses).toBe(220000)
    expect(result[5].revenus).toBe(320000)  // même moyenne pour tous les futurs
  })

  it('retourne [] si aucun mois complété (array vide)', () => {
    expect(getProjectionsMensuelles([], 6)).toHaveLength(0)
  })

  it('retourne [] si transactions uniquement dans le mois courant', () => {
    const juneSeulement = [
      { id: 'x', type: 'revenu', montant: 100000, date: '2026-06-01' },
    ]
    expect(getProjectionsMensuelles(juneSeulement, 6)).toHaveLength(0)
  })

  it('fonctionne avec 1 seul mois de données disponible', () => {
    const txns1Mois = [
      { id: 'b1', type: 'revenu',  montant: 300000, date: '2026-05-01' },
      { id: 'b2', type: 'depense', montant: 200000, date: '2026-05-10' },
    ]
    const result = getProjectionsMensuelles(txns1Mois, 6)
    expect(result).toHaveLength(6)
    // Moyenne basée sur 1 mois
    expect(result[3].revenus).toBe(300000)
    expect(result[3].depenses).toBe(200000)
  })

  it('fonctionne avec 2 mois de données disponibles', () => {
    const txns2Mois = [
      { id: 'a1', type: 'revenu',  montant: 300000, date: '2026-04-01' },
      { id: 'a2', type: 'depense', montant: 200000, date: '2026-04-10' },
      { id: 'b1', type: 'revenu',  montant: 400000, date: '2026-05-01' },
      { id: 'b2', type: 'depense', montant: 250000, date: '2026-05-10' },
    ]
    const result = getProjectionsMensuelles(txns2Mois, 6)
    expect(result).toHaveLength(6)
    // Moyenne = (300000 + 400000) / 2 = 350000
    expect(result[3].revenus).toBe(350000)
    // Moyenne = (200000 + 250000) / 2 = 225000
    expect(result[3].depenses).toBe(225000)
  })
})
```

- [ ] **Step 1b: Run the tests to confirm they fail**

```bash
npm run test -- --reporter=verbose calculations.test
```

Expected: `getProjectionsMensuelles is not a function` (or similar import error).

- [ ] **Step 1c: Add `addMonths` to the date-fns import in calculations.js**

Current first line of `src/utils/calculations.js`:
```js
import { parseISO, format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
```

Replace with:
```js
import { parseISO, format, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
```

- [ ] **Step 1d: Add `getProjectionsMensuelles` at the end of calculations.js**

Append after the last export (`getKpiTendance`):

```js
export function getProjectionsMensuelles(transactions, horizonMois = 6) {
  const today = new Date()
  const moisCourant = format(today, 'yyyy-MM')

  // Collect completed months (before current, with ≥1 transaction), most recent first
  const moisComplets = []
  for (let i = 1; i <= 12; i++) {
    const mois = format(subMonths(today, i), 'yyyy-MM')
    if (transactions.some(t => t.date?.startsWith(mois))) {
      moisComplets.push(mois)
    }
  }

  if (moisComplets.length === 0) return []

  const N = Math.min(3, moisComplets.length)
  const moisPourMoyenne = moisComplets.slice(0, N)
  const moyenneRevenus  = moisPourMoyenne.reduce((s, m) => s + getTotalRevenus(transactions, m), 0) / N
  const moyenneDepenses = moisPourMoyenne.reduce((s, m) => s + getTotalDepenses(transactions, m), 0) / N

  // Window: 2 past + 1 current + (max(horizonMois,4) - 3) future
  const totalBars = Math.max(horizonMois, 4)
  const nFuture   = totalBars - 3

  const result = []

  // 2 context months (always real data)
  for (let i = 2; i >= 1; i--) {
    const mois = format(subMonths(today, i), 'yyyy-MM')
    result.push({
      mois,
      revenus:  getTotalRevenus(transactions, mois),
      depenses: getTotalDepenses(transactions, mois),
      estProjection: false,
    })
  }

  // Current month (real data)
  result.push({
    mois: moisCourant,
    revenus:  getTotalRevenus(transactions, moisCourant),
    depenses: getTotalDepenses(transactions, moisCourant),
    estProjection: false,
  })

  // Future months (projected average)
  for (let i = 1; i <= nFuture; i++) {
    const mois = format(addMonths(today, i), 'yyyy-MM')
    result.push({
      mois,
      revenus:  Math.round(moyenneRevenus),
      depenses: Math.round(moyenneDepenses),
      estProjection: true,
    })
  }

  return result
}
```

- [ ] **Step 1e: Run the tests to confirm they all pass**

```bash
npm run test -- --reporter=verbose calculations.test
```

Expected: all `getProjectionsMensuelles` tests PASS (≥10 tests), existing suites still pass.

- [ ] **Step 1f: Commit**

```bash
git add src/utils/calculations.js src/utils/calculations.test.js
git commit -m "feat: add getProjectionsMensuelles pure function with Vitest tests"
```

---

## Task 2 — `src/pages/Projections.jsx` page component

**Files:**
- Create: `src/pages/Projections.jsx`

- [ ] **Step 2a: Create the page file**

Create `src/pages/Projections.jsx` with the following content:

```jsx
import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBudget } from '@/context/BudgetContext'
import { getProjectionsMensuelles } from '@/utils/calculations'
import { useFormatMontant } from '@/utils/useFormatMontant'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// Custom bar shape: dashed+transparent for projections, solid for real data.
// Recharts spreads all data-item fields into shape props, so estProjection is available.
function ProjectionBarShape({ x, y, width, height, fill, estProjection }) {
  if (!height || height <= 0) return null
  return estProjection ? (
    <rect
      x={x} y={y} width={width} height={height}
      fill={`${fill}40`} stroke={fill} strokeWidth={1.5}
      strokeDasharray="4 3" rx={3}
    />
  ) : (
    <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} rx={3} />
  )
}

function ProjectionTooltip({ active, payload, label }) {
  const fmt = useFormatMontant()
  if (!active || !payload?.length) return null
  const estProjection = payload[0]?.payload?.estProjection
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[170px]"
      style={{
        background: 'rgba(10,12,28,0.95)',
        border: '1px solid rgba(129,140,248,0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <p
        className="font-bold text-slate-300 mb-2 pb-1.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {label}
        {estProjection && (
          <span style={{ color: '#818cf8', fontSize: '9px', fontWeight: 600 }}>· prévision</span>
        )}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="font-bold text-white tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Projections() {
  const { state } = useBudget()
  const fmt = useFormatMontant()
  const [horizon, setHorizon] = useState(6)

  const effectiveHorizon = Math.max(horizon, 4)

  const rawData = useMemo(
    () => getProjectionsMensuelles(state.transactions, effectiveHorizon),
    [state.transactions, effectiveHorizon]
  )

  // Add abbreviated French month label for X axis
  const chartData = useMemo(
    () => rawData.map(d => ({
      ...d,
      label: format(parseISO(d.mois + '-01'), 'MMM', { locale: fr }),
    })),
    [rawData]
  )

  const moisCourantLabel = format(new Date(), 'MMM', { locale: fr })

  // KPI aggregates
  const totalRevenus    = rawData.reduce((s, d) => s + d.revenus,  0)
  const totalDepenses   = rawData.reduce((s, d) => s + d.depenses, 0)
  const totalEpargne    = totalRevenus - totalDepenses
  const revenuReels     = rawData.filter(d => !d.estProjection).reduce((s, d) => s + d.revenus,  0)
  const depensesReelles = rawData.filter(d => !d.estProjection).reduce((s, d) => s + d.depenses, 0)
  const epargneParMois  = Math.round(totalEpargne / effectiveHorizon)

  if (rawData.length === 0) {
    return (
      <EmptyState
        title="Pas encore assez de données"
        description="Ajoutez des transactions pour générer des projections."
      />
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--banner-bg-from) 0%, var(--banner-bg-mid) 45%, var(--banner-bg-to) 100%)',
          border: '1px solid var(--banner-border)',
        }}
      >
        <div className="px-5 pt-5 pb-5">

          {/* Header row with horizon selector */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1"
                style={{ color: 'var(--text-accent-purple)', opacity: 0.7 }}
              >
                BUDGET PRO
              </p>
              <h1
                className="text-2xl font-black leading-tight tracking-tight"
                style={{ color: 'var(--text-on-banner)' }}
              >
                Projections
              </h1>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Flux mensuel prévisionnel · Moyenne des 3 derniers mois
              </p>
            </div>

            {/* Horizon toggle */}
            <div
              className="flex gap-1 rounded-xl p-1 flex-shrink-0"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}
            >
              {[3, 6, 12].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                  style={horizon === h ? {
                    background: 'rgba(99,102,241,0.9)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  } : {
                    color: 'var(--text-muted)',
                    background: 'transparent',
                  }}
                >
                  {h} mois
                </button>
              ))}
            </div>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-3 gap-3">

            <div className="rounded-2xl p-3" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(52,211,153,0.6)' }}>
                Revenus prévus · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none" style={{ color: '#34d399' }}>
                {fmt(totalRevenus)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                dont {fmt(revenuReels)} réels
              </p>
            </div>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(251,113,133,0.6)' }}>
                Dépenses prévues · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none" style={{ color: '#fb7185' }}>
                {fmt(totalDepenses)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                dont {fmt(depensesReelles)} réelles
              </p>
            </div>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(129,140,248,0.6)' }}>
                Épargne nette · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none"
                style={{ color: totalEpargne >= 0 ? '#a5b4fc' : '#fb7185' }}>
                {totalEpargne >= 0 ? '+' : ''}{fmt(totalEpargne)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                soit ~{fmt(Math.abs(epargneParMois))} / mois
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Chart card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        {/* Legend bar */}
        <div
          className="px-5 py-3 flex items-center gap-5 flex-wrap"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#34d399' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Revenus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb7185' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dépenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: 'rgba(129,140,248,0.3)', border: '1px dashed #818cf8' }}
            />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Prévision</span>
          </div>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barCategoryGap="28%" barGap={3}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 1000)}k`}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<ProjectionTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <ReferenceLine
                x={moisCourantLabel}
                stroke="rgba(99,102,241,0.4)"
                strokeDasharray="4 3"
                label={{ value: 'Auj.', position: 'insideTopRight', fill: '#818cf8', fontSize: 9 }}
              />
              <Bar dataKey="revenus"  name="Revenus"   fill="#34d399" shape={<ProjectionBarShape />} />
              <Bar dataKey="depenses" name="Dépenses"  fill="#fb7185" shape={<ProjectionBarShape />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <div
        className="flex gap-3 items-start px-4 py-3 rounded-xl"
        style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.14)' }}
      >
        <span style={{ color: 'rgba(251,191,36,0.7)', fontSize: '13px', lineHeight: 1.4 }}>ℹ</span>
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.6)' }}>
          Les projections sont des estimations basées sur vos habitudes passées.
        </p>
      </div>

    </div>
  )
}
```

- [ ] **Step 2b: Verify the build compiles without errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ built in` with no errors. (TypeScript-style warnings about unused vars are fine.)

- [ ] **Step 2c: Commit**

```bash
git add src/pages/Projections.jsx
git commit -m "feat: add Projections page with KPI tiles, BarChart, and horizon selector"
```

---

## Task 3 — Wire up route and navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/layout/Sidebar.jsx`
- Modify: `src/components/layout/BottomNav.jsx`

### Step 3a — Add route in App.jsx

Current import block (lines 6–10):
```js
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budgets from '@/pages/Budgets'
import Charts from '@/pages/Charts'
import Goals from '@/pages/Goals'
```

Replace with:
```js
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budgets from '@/pages/Budgets'
import Charts from '@/pages/Charts'
import Goals from '@/pages/Goals'
import Projections from '@/pages/Projections'
```

Current `<Routes>` block (lines 34–39):
```jsx
<Route path="/" element={<Dashboard />} />
<Route path="/transactions" element={<Transactions />} />
<Route path="/budgets" element={<Budgets />} />
<Route path="/graphiques" element={<Charts />} />
<Route path="/objectifs" element={<Goals />} />
```

Replace with:
```jsx
<Route path="/" element={<Dashboard />} />
<Route path="/transactions" element={<Transactions />} />
<Route path="/budgets" element={<Budgets />} />
<Route path="/graphiques" element={<Charts />} />
<Route path="/projections" element={<Projections />} />
<Route path="/objectifs" element={<Goals />} />
```

### Step 3b — Add nav entry in Sidebar.jsx

Current `navItems` array ends at line 65 with the Objectifs entry. Insert the Projections entry **before** the Objectifs entry.

In `src/components/layout/Sidebar.jsx`, replace the Objectifs entry:

```js
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]
```

With:

```js
  {
    to: '/projections',
    label: 'Projections',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]
```

### Step 3c — Add nav entry in BottomNav.jsx

Current `navItems` array ends at line 62 with the Objectifs entry. Insert the Projections entry **before** the Objectifs entry.

In `src/components/layout/BottomNav.jsx`, replace the Objectifs entry:

```js
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]
```

With:

```js
  {
    to: '/projections',
    label: 'Projections',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]
```

- [ ] **Step 3d: Final build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ built in` with no errors.

- [ ] **Step 3e: Final commit**

```bash
git add src/App.jsx src/components/layout/Sidebar.jsx src/components/layout/BottomNav.jsx
git commit -m "feat: wire /projections route and add Projections nav entry to Sidebar and BottomNav"
```

---

## Checklist — Spec Coverage

| Spec requirement | Task |
|-----------------|------|
| Page `/projections` | Task 3 |
| Banner with sélecteur 3/6/12 mois, défaut 6 | Task 2 |
| 3 KPI tiles (Revenus / Dépenses / Épargne) with "dont X réels" | Task 2 |
| BarChart groupé Recharts, barres pleines vs pointillées | Task 2 |
| Ligne "Aujourd'hui" avec ReferenceLine | Task 2 |
| Légende Revenus / Dépenses / Prévision | Task 2 |
| Tooltip dark glass avec `useFormatMontant` | Task 2 |
| État vide si 0 mois complets | Task 1 + 2 |
| Moyenne des 3 derniers mois complets | Task 1 |
| Fonctionne avec 1 ou 2 mois disponibles | Task 1 |
| Note d'avertissement (bas de page) | Task 2 |
| Navigation Sidebar + BottomNav | Task 3 |
| `useFormatMontant` sur tous les montants | Task 2 |
| CSS vars — mode clair/sombre | Task 2 (utilise `--text-on-banner`, `--bg-card`, etc.) |
