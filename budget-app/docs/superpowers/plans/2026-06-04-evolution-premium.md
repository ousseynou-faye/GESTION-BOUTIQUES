# Évolution Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer le design de Budget Pro sur 6 zones (navigation, KPI cards, formulaires, transactions, objectifs, graphiques) sans changer la structure ni l'esprit Dark Premium.

**Architecture:** 10 tâches indépendantes sur 9 fichiers. Les tâches 1–3 doivent être faites dans l'ordre (getKpiTendance → KPICard → Dashboard). Les tâches 4–10 sont indépendantes entre elles et peuvent être faites dans n'importe quel ordre après la tâche 1.

**Tech Stack:** React 18 + Vite + Tailwind v4 (plugin, pas de tailwind.config.js) + Vitest (tests) + date-fns

---

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/utils/calculations.js` | Ajouter `getKpiTendance()` |
| `src/utils/calculations.test.js` | Tests pour `getKpiTendance()` |
| `src/components/ui/KPICard.jsx` | Ajouter prop `sparkData` + composant `Sparkline` |
| `src/pages/Dashboard.jsx` | Wirer tendance + sparklines + remplacer TodayBadge par MonthSelector |
| `src/components/layout/Sidebar.jsx` | Icône clock → wallet |
| `src/components/layout/TopBar.jsx` | Icône clock → wallet + bande contextuelle Dashboard |
| `src/components/transactions/TransactionForm.jsx` | Formulaire 2 étapes + montants F CFA |
| `src/components/transactions/TransactionItem.jsx` | Boutons opacity-0 → opacity-50 |
| `src/pages/Goals.jsx` | GoalCard milestones + badge d'état |
| `src/pages/Charts.jsx` | Ligne snapshot header |
| `src/index.css` | Tokens composants (boutons, badges, inputs) |

---

## Task 1: getKpiTendance() — calcul des tendances KPI

**Files:**
- Modify: `src/utils/calculations.js`
- Modify: `src/utils/calculations.test.js`

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à la fin de `src/utils/calculations.test.js` :

```js
import { getKpiTendance } from './calculations.js'

const txnsKpi = [
  // Mois courant : 2026-06
  { id: 'k1', type: 'revenu',  montant: 200000, categorie: 'salaire',        date: '2026-06-01' },
  { id: 'k2', type: 'depense', montant:  80000, categorie: 'alimentation',   date: '2026-06-05' },
  // Mois précédent : 2026-05
  { id: 'k3', type: 'revenu',  montant: 160000, categorie: 'salaire',        date: '2026-05-01' },
  { id: 'k4', type: 'depense', montant: 100000, categorie: 'alimentation',   date: '2026-05-05' },
]

describe('getKpiTendance', () => {
  it('retourne les 4 clés attendues', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r).toHaveProperty('revenus')
    expect(r).toHaveProperty('depenses')
    expect(r).toHaveProperty('solde')
    expect(r).toHaveProperty('epargne')
  })

  it('calcule la tendance revenus correctement (+25%)', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    // (200000 - 160000) / 160000 * 100 = 25
    expect(r.revenus.tendance).toBeCloseTo(25)
  })

  it('calcule la tendance dépenses correctement (-20%)', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    // (80000 - 100000) / 100000 * 100 = -20
    expect(r.depenses.tendance).toBeCloseTo(-20)
  })

  it('retourne tendance null si mois précédent = 0', () => {
    const r = getKpiTendance([txnsKpi[0]], '2026-06')  // seul revenu juin, rien en mai
    expect(r.depenses.tendance).toBeNull()
  })

  it('fournit 6 valeurs spark pour chaque KPI', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r.revenus.spark).toHaveLength(6)
    expect(r.depenses.spark).toHaveLength(6)
    expect(r.solde.spark).toHaveLength(6)
    expect(r.epargne.spark).toHaveLength(6)
  })

  it('spark revenus contient des nombres', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r.revenus.spark.every(v => typeof v === 'number')).toBe(true)
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm test
```

Attendu : FAIL avec "getKpiTendance is not a function"

- [ ] **Step 3: Implémenter getKpiTendance()**

Dans `src/utils/calculations.js`, ajouter à la fin du fichier (après `getBudgetAlerts`) :

```js
export function getKpiTendance(transactions, moisCourant) {
  const moisPrecedent = format(subMonths(parseISO(moisCourant + '-01'), 1), 'yyyy-MM')
  const data6Mois = getDonnees6Mois(transactions)

  const curr = {
    revenus:  getTotalRevenus(transactions, moisCourant),
    depenses: getTotalDepenses(transactions, moisCourant),
    solde:    getSoldeNet(transactions, moisCourant),
    epargne:  getTauxEpargne(transactions, moisCourant),
  }
  const prev = {
    revenus:  getTotalRevenus(transactions, moisPrecedent),
    depenses: getTotalDepenses(transactions, moisPrecedent),
    solde:    getSoldeNet(transactions, moisPrecedent),
    epargne:  getTauxEpargne(transactions, moisPrecedent),
  }

  const pct = (c, p) => p === 0 ? null : ((c - p) / Math.abs(p)) * 100

  return {
    revenus:  { tendance: pct(curr.revenus,  prev.revenus),  spark: data6Mois.map(d => d.revenus) },
    depenses: { tendance: pct(curr.depenses, prev.depenses), spark: data6Mois.map(d => d.depenses) },
    solde:    { tendance: pct(curr.solde,    prev.solde),    spark: data6Mois.map(d => d.revenus - d.depenses) },
    epargne:  {
      tendance: pct(curr.epargne, prev.epargne),
      spark: data6Mois.map(d => {
        const r = getTotalRevenus(transactions, d.mois)
        const e = getTotalDepenses(transactions, d.mois)
        return r === 0 ? 0 : Math.max(0, ((r - e) / r) * 100)
      }),
    },
  }
}
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
npm test
```

Attendu : tous les tests PASS (y compris les tests existants)

- [ ] **Step 5: Commit**

```bash
git add src/utils/calculations.js src/utils/calculations.test.js
git commit -m "feat: add getKpiTendance() — trend % and 6-month spark data per KPI"
```

---

## Task 2: KPICard — sparkline SVG

**Files:**
- Modify: `src/components/ui/KPICard.jsx`

- [ ] **Step 1: Ajouter le composant Sparkline et la prop sparkData**

Remplacer le contenu complet de `src/components/ui/KPICard.jsx` par :

```jsx
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 100
  const H = 28
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(' ')
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, display: 'block' }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KPICard({
  titre,
  valeur,
  sousTitre,
  gradient = ['#4f46e5', '#6366f1'],
  icon,
  tendance,
  sparkData,
}) {
  const [from, to] = gradient
  const trendUp = tendance !== undefined && tendance !== null && tendance >= 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white flex flex-col gap-3"
      style={{
        background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 12px 32px -6px ${from}60, 0 4px 12px -2px ${from}35`,
      }}
    >
      {/* ── Large background circle top-right ────────────── */}
      <div
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.09)' }}
        aria-hidden="true"
      />
      <div
        className="absolute right-4 bottom-[-36px] w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.05)' }}
        aria-hidden="true"
      />
      <div
        className="absolute left-[-24px] bottom-[-24px] w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.10)' }}
        aria-hidden="true"
      />

      {/* ── Top shine line ───────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* ── Glass highlight overlay ───────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%)' }}
        aria-hidden="true"
      />

      {/* ── Icon + Trend badge ──────────────────────────── */}
      <div className="relative z-10 flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.20)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          {icon}
        </div>

        {tendance !== undefined && tendance !== null && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full leading-none"
            style={{
              background: trendUp ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
              backdropFilter: 'blur(6px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            aria-label={`Tendance : ${trendUp ? '+' : ''}${tendance.toFixed(1)}%`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {trendUp
                ? <path d="M7 17l5-5 5 5M7 11l5-5 5 5" />
                : <path d="M7 7l5 5 5-5M7 13l5 5 5-5" />
              }
            </svg>
            {Math.abs(tendance).toFixed(1)}%
          </span>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10">
        <p className="text-white/55 text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5 leading-none">
          {titre}
        </p>
        <p
          className="font-display text-white leading-none tabular-nums"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)', fontWeight: 800 }}
        >
          {valeur}
        </p>
        {sousTitre && (
          <p className="text-white/45 text-[11px] mt-2 font-medium leading-tight">
            {sousTitre}
          </p>
        )}
      </div>

      {/* ── Sparkline ───────────────────────────────────── */}
      {sparkData && (
        <div className="relative z-10 -mx-1 -mb-1">
          <Sparkline data={sparkData} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Vérifier visuellement**

```bash
npm run dev
```

Ouvrir http://localhost:5173 — les KPI cards ont toujours la même apparence (sparkData n'est pas encore passé depuis Dashboard).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/KPICard.jsx
git commit -m "feat: add Sparkline component and sparkData prop to KPICard"
```

---

## Task 3: Dashboard — wiring tendance + sparklines + MonthSelector

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Mettre à jour les imports**

En haut de `src/pages/Dashboard.jsx`, modifier la ligne d'import date-fns :

```js
// Ligne existante :
import { format, subMonths } from 'date-fns'
// Remplacer par :
import { format, subMonths, addMonths, parseISO } from 'date-fns'
```

Ajouter `getKpiTendance` à l'import depuis calculations :

```js
// Ligne existante :
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
  getTop5Categories, getBudgetAlerts,
} from '@/utils/calculations'
// Remplacer par :
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
  getTop5Categories, getBudgetAlerts, getKpiTendance,
} from '@/utils/calculations'
```

- [ ] **Step 2: Ajouter le composant MonthSelector (remplace TodayBadge)**

Trouver le composant `TodayBadge` (lignes ~291–320) et le **remplacer entièrement** par `MonthSelector` :

```jsx
// ─── Month selector ───────────────────────────────────────────────────────────
function MonthSelector() {
  const { state, dispatch } = useBudget()
  const mois = state.settings.moisCourant

  function navigate(delta) {
    const base    = parseISO(mois + '-01')
    const newDate = delta > 0 ? addMonths(base, 1) : subMonths(base, 1)
    dispatch({ type: 'SET_MOIS_COURANT', payload: { mois: format(newDate, 'yyyy-MM') } })
  }

  return (
    <div
      className="hidden sm:flex items-center gap-1 rounded-xl px-1 py-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
    >
      <button
        onClick={() => navigate(-1)}
        aria-label="Mois précédent"
        className="w-7 h-7 rounded-lg flex items-center justify-center focus:outline-none"
        style={{ color: 'rgba(100,116,139,0.7)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.7)'; e.currentTarget.style.background = 'transparent' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span
        className="text-[12px] font-semibold px-2 text-center"
        style={{ color: 'rgba(148,163,184,0.9)', minWidth: '90px' }}
      >
        {formatMois(mois)}
      </span>
      <button
        onClick={() => navigate(1)}
        aria-label="Mois suivant"
        className="w-7 h-7 rounded-lg flex items-center justify-center focus:outline-none"
        style={{ color: 'rgba(100,116,139,0.7)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.7)'; e.currentTarget.style.background = 'transparent' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Calculer kpiTendance dans le corps du Dashboard**

Dans la fonction `Dashboard()`, après les lignes `useMemo` existantes (après la ligne `alerts`), ajouter :

```jsx
const kpiTendance = useMemo(
  () => getKpiTendance(transactions, mois),
  [transactions, mois]
)
```

- [ ] **Step 4: Mettre à jour le header pour utiliser MonthSelector**

Trouver dans le JSX du Dashboard le bloc header :

```jsx
{/* ── Header ── */}
<div className="flex items-center justify-between gap-4">
  <div>
    <h1 ...>Tableau de bord</h1>
    <p ...>{formatMois(mois)} — Vue d'ensemble de vos finances</p>
  </div>
  <TodayBadge />
</div>
```

Remplacer `<TodayBadge />` par `<MonthSelector />`.

- [ ] **Step 5: Passer tendance et sparkData aux KPICard**

Trouver le bloc des 4 KPICard et les remplacer par :

```jsx
{/* ── KPI Cards ── */}
<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
  <KPICard
    titre="Revenus du mois"
    valeur={formatMontant(totalRevenus)}
    sousTitre={formatMois(mois)}
    gradient={['#059669', '#10b981']}
    icon={<IconRevenu />}
    tendance={kpiTendance.revenus.tendance}
    sparkData={kpiTendance.revenus.spark}
  />
  <KPICard
    titre="Dépenses du mois"
    valeur={formatMontant(totalDepenses)}
    sousTitre={formatMois(mois)}
    gradient={['#e11d48', '#f43f5e']}
    icon={<IconDepense />}
    tendance={kpiTendance.depenses.tendance}
    sparkData={kpiTendance.depenses.spark}
  />
  <KPICard
    titre="Solde net"
    valeur={formatMontant(soldeNet)}
    sousTitre={soldeNet >= 0 ? 'Solde positif' : 'Solde négatif'}
    gradient={soldeNet >= 0 ? ['#4338ca', '#6366f1'] : ['#ea580c', '#f97316']}
    icon={<IconSolde />}
    tendance={kpiTendance.solde.tendance}
    sparkData={kpiTendance.solde.spark}
  />
  <KPICard
    titre="Taux d'épargne"
    valeur={formatPourcentage(tauxEpargne)}
    sousTitre={tauxEpargne >= 20 ? 'Excellent' : tauxEpargne >= 10 ? 'Correct' : 'À améliorer'}
    gradient={['#b45309', '#f59e0b']}
    icon={<IconEpargne />}
    tendance={kpiTendance.epargne.tendance}
    sparkData={kpiTendance.epargne.spark}
  />
</div>
```

- [ ] **Step 6: Vérifier dans le navigateur**

```bash
npm run dev
```

Vérifier sur http://localhost:5173 :
- Le sélecteur de mois ← Juin 2026 → apparaît en haut à droite du Dashboard (desktop)
- Les KPI cards affichent le badge ↑/↓ (si des transactions existent dans les 2 derniers mois)
- Les sparklines apparaissent en bas de chaque card

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: wire KPI sparklines + tendance + month selector on Dashboard"
```

---

## Task 4: Sidebar & TopBar — icône wallet (remplace horloge)

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`
- Modify: `src/components/layout/TopBar.jsx`

- [ ] **Step 1: Remplacer l'icône dans Sidebar.jsx**

Dans `src/components/layout/Sidebar.jsx`, trouver le SVG de l'icône horloge (dans le bloc Brand, lignes ~134–139) :

```jsx
<svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="9" />
  <path d="M12 8v4l3 3" />
</svg>
```

Remplacer par l'icône wallet :

```jsx
<svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
  <path d="M21 12h-5a2 2 0 000 4h5" />
</svg>
```

- [ ] **Step 2: Remplacer l'icône dans TopBar.jsx**

Dans `src/components/layout/TopBar.jsx`, trouver le SVG de l'icône horloge (lignes ~57–61) :

```jsx
<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
  <circle cx="12" cy="12" r="9" />
  <path d="M12 8v4l3 3" />
</svg>
```

Remplacer par :

```jsx
<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
  <path d="M21 12h-5a2 2 0 000 4h5" />
</svg>
```

- [ ] **Step 3: Vérifier dans le navigateur**

```bash
npm run dev
```

Vérifier sur http://localhost:5173 (desktop) : la sidebar affiche une icône wallet dans le badge violet.
Sur mobile : la TopBar affiche aussi une icône wallet.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.jsx src/components/layout/TopBar.jsx
git commit -m "fix: replace clock icon with wallet icon in Sidebar and TopBar"
```

---

## Task 5: TopBar — bande contextuelle Dashboard mobile

**Files:**
- Modify: `src/components/layout/TopBar.jsx`

- [ ] **Step 1: Ajouter les imports nécessaires**

En haut de `src/components/layout/TopBar.jsx`, remplacer les imports existants par :

```jsx
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'
import { getSoldeNet, getTauxEpargne } from '@/utils/calculations'
import { formatMontant, formatPourcentage } from '@/utils/formatters'
```

- [ ] **Step 2: Calculer solde et épargne dans le composant TopBar**

Dans la fonction `TopBar()`, après `const pageTitle = ...`, ajouter :

```jsx
const mois    = state.settings.moisCourant
const solde   = useMemo(() => getSoldeNet(state.transactions, mois),    [state.transactions, mois])
const epargne = useMemo(() => getTauxEpargne(state.transactions, mois), [state.transactions, mois])
```

- [ ] **Step 3: Restructurer le JSX pour inclure la bande contextuelle**

Remplacer le `return` complet de la fonction `TopBar()` par :

```jsx
return (
  <div className="md:hidden sticky top-0 z-40">
    {/* ── Barre principale ── */}
    <header
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: isDark ? 'rgba(6,11,24,0.94)' : 'rgba(241,245,249,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
      }}
    >
      {/* Logo + titre de page */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.40)',
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
            <path d="M21 12h-5a2 2 0 000 4h5" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="leading-tight font-bold tracking-[0.18em] uppercase text-[9px]"
            style={{ color: 'rgba(99,102,241,0.7)' }}>
            Budget Pro
          </p>
          <p className="font-display text-sm font-bold truncate leading-tight"
            style={{ color: 'rgba(226,232,240,0.95)' }}>
            {pageTitle}
          </p>
        </div>
      </div>

      {/* Toggle thème */}
      <button
        onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
        aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none"
        style={{ color: 'rgba(100,116,139,0.7)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(226,232,240,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.7)'; e.currentTarget.style.background = 'transparent' }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>

    {/* ── Bande contextuelle Dashboard ── */}
    {location.pathname === '/' && (
      <div
        className="flex items-center justify-around px-6 py-2 border-b"
        style={{
          background: isDark ? 'rgba(129,140,248,0.04)' : 'rgba(99,102,241,0.04)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]"
            style={{ color: 'rgba(100,116,139,0.6)' }}>Solde</span>
          <span className="font-display text-[13px] font-bold tabular-nums"
            style={{ color: solde >= 0 ? '#34d399' : '#fb7185' }}>
            {formatMontant(solde)}
          </span>
        </div>
        <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]"
            style={{ color: 'rgba(100,116,139,0.6)' }}>Épargne</span>
          <span className="font-display text-[13px] font-bold tabular-nums"
            style={{ color: '#818cf8' }}>
            {formatPourcentage(epargne)}
          </span>
        </div>
      </div>
    )}
  </div>
)
```

- [ ] **Step 4: Vérifier sur mobile (ou DevTools)**

```bash
npm run dev
```

Ouvrir http://localhost:5173, passer en vue mobile (DevTools → responsive). Vérifier :
- Page Dashboard : TopBar + bande contextuelle solde/épargne sous la barre
- Page Transactions : TopBar seule, pas de bande

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/TopBar.jsx
git commit -m "feat: add contextual solde/épargne band on TopBar mobile (Dashboard only)"
```

---

## Task 6: TransactionForm — 2 étapes visuelles + montants F CFA

**Files:**
- Modify: `src/components/transactions/TransactionForm.jsx`

- [ ] **Step 1: Remplacer le contenu complet du fichier**

Remplacer tout le contenu de `src/components/transactions/TransactionForm.jsx` par :

```jsx
import { useState } from 'react'
import { CATEGORIES_REVENUS, CATEGORIES_DEPENSES } from '@/constants/categories'
import { format } from 'date-fns'
import { formatMontant } from '@/utils/formatters'

const defaultForm = {
  type:        'depense',
  montant:     '',
  categorie:   '',
  description: '',
  date:        format(new Date(), 'yyyy-MM-dd'),
  note:        '',
  recurrente:  false,
}

const QUICK_AMOUNTS = [5000, 10000, 50000, 100000, 200000, 500000, 1000000]

function FieldLabel({ children }) {
  return (
    <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 leading-none"
      style={{ color: 'rgba(100,116,139,0.7)' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />
}

function StepIndicator({ etape }) {
  const done = etape === 2
  return (
    <div className="flex items-center gap-2 mb-1">
      {/* Step 1 */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={done
            ? { background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' }
            : { background: 'rgba(129,140,248,0.9)', color: '#fff', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }
          }
        >
          {done ? '✓' : '1'}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: done ? 'rgba(52,211,153,0.8)' : 'rgba(226,232,240,0.9)' }}>
          Montant
        </span>
      </div>
      {/* Connector */}
      <div className="flex-1 h-px" style={{ background: done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)' }} aria-hidden="true" />
      {/* Step 2 */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={done
            ? { background: 'rgba(129,140,248,0.9)', color: '#fff', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }
            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(100,116,139,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
          }
        >
          2
        </div>
        <span className="text-[10px] font-semibold" style={{ color: done ? 'rgba(226,232,240,0.9)' : 'rgba(100,116,139,0.6)' }}>
          Détails
        </span>
      </div>
    </div>
  )
}

export function TransactionForm({ initial, onSubmit, onCancel }) {
  const [etape, setEtape]   = useState(1)
  const [form, setForm]     = useState(initial
    ? { ...initial, montant: String(initial.montant), note: initial.note ?? '', recurrente: initial.recurrente ?? false }
    : defaultForm
  )
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isRevenu  = form.type === 'revenu'
  const typeColor = isRevenu ? '#34d399' : '#fb7185'
  const typeGrad  = isRevenu
    ? 'linear-gradient(135deg, #059669 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)'
  const categoriesFiltrees = isRevenu ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES

  function validateStep1() {
    const e = {}
    if (!form.montant || isNaN(parseFloat(form.montant)) || parseFloat(form.montant) <= 0)
      e.montant = 'Le montant doit être supérieur à 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!form.categorie)          e.categorie   = 'Sélectionnez une catégorie'
    if (!form.description.trim()) e.description = 'Ajoutez une description'
    if (!form.date)               e.date        = 'Choisissez une date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep2()) return
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      type:        form.type,
      montant:     parseFloat(form.montant),
      categorie:   form.categorie,
      description: form.description.trim(),
      date:        form.date,
      note:        form.note.trim() || null,
      recurrente:  form.recurrente,
    })
  }

  // ── Étape 1 : Montant ────────────────────────────────────────────────────────
  if (etape === 1) {
    return (
      <div className="flex flex-col gap-4">

        <StepIndicator etape={1} />
        <Divider />

        {/* Type toggle */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { val: 'depense', label: 'Dépense', grad: 'linear-gradient(135deg,#e11d48,#fb7185)' },
            { val: 'revenu',  label: 'Revenu',  grad: 'linear-gradient(135deg,#059669,#34d399)' },
          ].map(({ val, label, grad }) => {
            const active = form.type === val
            return (
              <button
                key={val}
                type="button"
                onClick={() => { set('type', val); set('categorie', '') }}
                className="py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none"
                style={active
                  ? { background: grad, color: '#fff', boxShadow: val === 'depense' ? '0 4px 14px rgba(251,113,133,0.35)' : '0 4px 14px rgba(52,211,153,0.35)' }
                  : { color: 'rgba(100,116,139,0.7)', background: 'transparent' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Montant input */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Montant</FieldLabel>
          <div
            className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              background: errors.montant ? 'rgba(251,113,133,0.06)' : `${typeColor}0a`,
              border: `2px solid ${errors.montant ? '#fb7185' : typeColor + '30'}`,
            }}
            onClick={e => e.currentTarget.querySelector('input')?.focus()}
          >
            <span
              className="pl-4 font-display font-black leading-none select-none flex-shrink-0 text-[15px]"
              style={{ color: typeColor }}
              aria-hidden="true"
            >
              F CFA
            </span>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="0"
              value={form.montant}
              onChange={e => { set('montant', e.target.value); if (errors.montant) setErrors({}) }}
              aria-label="Montant de la transaction"
              autoFocus
              className="flex-1 bg-transparent pl-2 pr-4 py-4 font-display font-black focus:outline-none min-w-0"
              style={{ color: typeColor, caretColor: typeColor, fontSize: '2.25rem', letterSpacing: '-0.01em' }}
              onFocus={e => {
                const w = e.currentTarget.parentElement
                if (!errors.montant) w.style.borderColor = typeColor + '70'
                w.style.boxShadow = `0 0 0 3px ${typeColor}18`
              }}
              onBlur={e => {
                const w = e.currentTarget.parentElement
                w.style.borderColor = errors.montant ? '#fb7185' : typeColor + '30'
                w.style.boxShadow = 'none'
              }}
            />
          </div>
          {errors.montant && (
            <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: '#fb7185' }} role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {errors.montant}
            </p>
          )}
        </div>

        {/* Montants rapides F CFA */}
        <div>
          <FieldLabel>Montants rapides</FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map(amt => {
              const selected = String(form.montant) === String(amt)
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { set('montant', String(amt)); setErrors({}) }}
                  className="py-2.5 rounded-xl text-center transition-all duration-150 focus:outline-none"
                  style={{
                    background: selected ? `${typeColor}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected ? typeColor + '55' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selected ? `0 0 10px ${typeColor}22` : 'none',
                  }}
                  onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = typeColor + '30' } }}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
                >
                  <span
                    className="font-display text-[11px] font-bold tabular-nums block"
                    style={{ color: selected ? typeColor : 'rgba(148,163,184,0.8)' }}
                  >
                    {new Intl.NumberFormat('fr-FR').format(amt)}
                  </span>
                </button>
              )
            })}
            {/* Autre */}
            <button
              type="button"
              onClick={() => { set('montant', ''); setErrors({}); setTimeout(() => document.querySelector('input[type="number"]')?.focus(), 50) }}
              className="py-2.5 rounded-xl text-center transition-all duration-150 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            >
              <span className="font-display text-[11px] font-bold block" style={{ color: 'rgba(100,116,139,0.7)' }}>
                Autre
              </span>
            </button>
          </div>
        </div>

        <Divider />

        {/* Boutons étape 1 */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 rounded-2xl text-sm font-semibold transition-all focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => validateStep1() && setEtape(2)}
            className="py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all focus:outline-none"
            style={{ background: typeGrad, boxShadow: `0 6px 20px ${typeColor}44` }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Suivant
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ── Étape 2 : Détails ────────────────────────────────────────────────────────
  const montantFormate = form.montant ? formatMontant(parseFloat(form.montant)) : ''
  const typeLabel      = isRevenu ? 'Revenu' : 'Dépense'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <StepIndicator etape={2} />

      {/* Récapitulatif montant */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: `${typeColor}0a`, border: `1px solid ${typeColor}25` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeGrad, boxShadow: `0 4px 12px ${typeColor}44` }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            {isRevenu
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            }
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${typeColor}88` }}>{typeLabel}</p>
          <p className="font-display text-base font-extrabold tabular-nums" style={{ color: typeColor }}>{montantFormate}</p>
        </div>
      </div>

      <Divider />

      {/* Catégorie */}
      <div>
        <FieldLabel>Catégorie</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {categoriesFiltrees.map(cat => {
            const active = form.categorie === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { set('categorie', cat.id); if (errors.categorie) setErrors(e => ({ ...e, categorie: undefined })) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all focus:outline-none"
                style={{
                  background: active ? `${cat.couleur}20` : 'rgba(255,255,255,0.04)',
                  border:     `1px solid ${active ? cat.couleur + '55' : 'rgba(255,255,255,0.08)'}`,
                  color:      active ? cat.couleur : 'rgba(148,163,184,0.8)',
                  boxShadow:  active ? `0 0 10px ${cat.couleur}22` : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.couleur, boxShadow: active ? `0 0 6px ${cat.couleur}` : 'none' }} aria-hidden="true" />
                {cat.label}
              </button>
            )
          })}
        </div>
        {errors.categorie && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-2" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {errors.categorie}
          </p>
        )}
      </div>

      <Divider />

      {/* Description + Date */}
      <div className="grid grid-cols-2 gap-3">
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Description</FieldLabel>
          <input
            type="text"
            placeholder="ex : Courses marché"
            value={form.description}
            onChange={e => { set('description', e.target.value); if (errors.description) setErrors(er => ({ ...er, description: undefined })) }}
            aria-invalid={errors.description ? 'true' : undefined}
            className="w-full px-3 py-2.5 text-sm font-medium rounded-xl focus:outline-none"
            style={{
              background: errors.description ? 'rgba(251,113,133,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${errors.description ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: '#e2e8f0',
            }}
            onFocus={e => { if (!errors.description) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' } }}
            onBlur={e => { e.currentTarget.style.borderColor = errors.description ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.description && (
            <p className="text-[10px] font-medium" style={{ color: '#fb7185' }} role="alert">{errors.description}</p>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Date</FieldLabel>
          <input
            type="date"
            value={form.date}
            onChange={e => { set('date', e.target.value); if (errors.date) setErrors(er => ({ ...er, date: undefined })) }}
            aria-invalid={errors.date ? 'true' : undefined}
            className="w-full px-3 py-2.5 text-sm font-medium rounded-xl focus:outline-none"
            style={{
              background: errors.date ? 'rgba(251,113,133,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${errors.date ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: '#e2e8f0',
              colorScheme: 'dark',
            }}
            onFocus={e => { if (!errors.date) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' } }}
            onBlur={e => { e.currentTarget.style.borderColor = errors.date ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.date && (
            <p className="text-[10px] font-medium" style={{ color: '#fb7185' }} role="alert">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '9px', color: 'rgba(100,116,139,0.4)' }}>(optionnel)</span></FieldLabel>
        <textarea
          placeholder="Détails supplémentaires…"
          value={form.note}
          onChange={e => set('note', e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>

      {/* Récurrente */}
      <button
        type="button"
        onClick={() => set('recurrente', !form.recurrente)}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all focus:outline-none text-left"
        style={{
          background: form.recurrente ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${form.recurrente ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.07)'}`,
        }}
        aria-pressed={form.recurrente}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: form.recurrente ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${form.recurrente ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: form.recurrente ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }}
          aria-hidden="true"
        >
          {form.recurrente && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: form.recurrente ? '#a5b4fc' : 'rgba(148,163,184,0.8)' }}>
            Transaction récurrente
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(100,116,139,0.6)' }}>
            Se reproduit chaque mois automatiquement
          </p>
        </div>
      </button>

      <Divider />

      {/* Boutons étape 2 */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-2">
        <button
          type="button"
          onClick={() => { setEtape(1); setErrors({}) }}
          className="py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          type="submit"
          className="py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all focus:outline-none"
          style={{ background: typeGrad, boxShadow: `0 6px 20px ${typeColor}44` }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {initial ? 'Enregistrer' : `Ajouter la ${typeLabel.toLowerCase()}`}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Vérifier dans le navigateur**

```bash
npm run dev
```

Tester sur http://localhost:5173/transactions :
- Cliquer le bouton "+" pour ouvrir le formulaire
- Étape 1 : type toggle, input montant, 7 montants rapides + "Autre", bouton "Suivant"
- Étape 2 : récapitulatif montant, catégories, description/date, récurrente améliorée, boutons "Retour" + "Ajouter la dépense"
- Tester l'édition d'une transaction existante : commence à l'étape 1 avec le montant pré-rempli

- [ ] **Step 3: Commit**

```bash
git add src/components/transactions/TransactionForm.jsx
git commit -m "feat: TransactionForm redesigned as 2-step flow with F CFA quick amounts"
```

---

## Task 7: TransactionItem — boutons visibles au repos

**Files:**
- Modify: `src/components/transactions/TransactionItem.jsx`

- [ ] **Step 1: Changer l'opacité des boutons d'action**

Dans `src/components/transactions/TransactionItem.jsx`, trouver la ligne (~89) :

```jsx
<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 ml-1">
```

Remplacer `opacity-0` par `opacity-50` :

```jsx
<div className="flex gap-0.5 opacity-50 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 ml-1">
```

- [ ] **Step 2: Vérifier dans le navigateur**

```bash
npm run dev
```

Ouvrir http://localhost:5173/transactions — les boutons modifier/supprimer sont légèrement visibles (50% opacité) sans hover, et deviennent entièrement visibles au survol.

- [ ] **Step 3: Commit**

```bash
git add src/components/transactions/TransactionItem.jsx
git commit -m "fix: transaction action buttons now visible at 50% opacity at rest"
```

---

## Task 8: GoalCard — milestones + badge d'état

**Files:**
- Modify: `src/pages/Goals.jsx`

- [ ] **Step 1: Ajouter les fonctions utilitaires au début du fichier**

Après les imports (ligne ~10) dans `src/pages/Goals.jsx`, ajouter les deux fonctions :

```jsx
function getEtatObjectif(pct) {
  if (pct >= 100) return { label: 'Atteint !',  emoji: '✓', color: '#34d399', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.3)' }
  if (pct >= 75)  return { label: 'Presque !',  emoji: '🔥', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)' }
  if (pct >= 21)  return { label: 'En cours',   emoji: '💪', color: '#a5b4fc', bg: 'rgba(165,180,252,0.12)', border: 'rgba(129,140,248,0.3)' }
  return              { label: 'Démarrage',  emoji: '🌱', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.25)' }
}

function getProchainPalier(pct, montantCible) {
  const paliers = [25, 50, 75, 100]
  const prochain = paliers.find(p => p > Math.min(pct, 99))
  if (!prochain) return null
  const restant = Math.max(0, Math.round((prochain / 100) * montantCible - (pct / 100) * montantCible))
  return { palier: prochain, restant }
}
```

- [ ] **Step 2: Modifier GoalCard — barre de progression avec milestones**

Dans `GoalCard`, trouver le bloc `{/* ── Progress bar ── */}` (~ligne 624) :

```jsx
{/* ── Progress bar ── */}
<div className="h-1.5 w-full" style={{ background: `${goal.couleur}10` }}>
  <div
    className="h-full transition-all duration-1000"
    style={{
      width: `${Math.min(pct, 100)}%`,
      background: `linear-gradient(90deg, ${goal.couleur}88, ${goal.couleur})`,
      boxShadow: `0 0 8px ${goal.couleur}66`,
    }}
    role="progressbar"
    aria-valuenow={Math.round(pct)}
    aria-valuemin={0}
    aria-valuemax={100}
  />
</div>
```

Remplacer par :

```jsx
{/* ── Progress bar avec milestones ── */}
<div className="relative h-1.5 w-full" style={{ background: `${goal.couleur}10` }}>
  <div
    className="h-full transition-all duration-1000"
    style={{
      width: `${Math.min(pct, 100)}%`,
      background: `linear-gradient(90deg, ${goal.couleur}88, ${goal.couleur})`,
      boxShadow: `0 0 8px ${goal.couleur}66`,
    }}
    role="progressbar"
    aria-valuenow={Math.round(pct)}
    aria-valuemin={0}
    aria-valuemax={100}
  />
  {[25, 50, 75].map(mark => (
    <div
      key={mark}
      className="absolute top-0 bottom-0"
      style={{
        left: `${mark}%`,
        width: '1px',
        background: pct >= mark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
      }}
      aria-hidden="true"
    />
  ))}
</div>
```

- [ ] **Step 3: Modifier GoalCard — badge d'état et message motivationnel**

Dans `GoalCard`, dans le bloc header (après `const atteint = ...` et `const urgence = ...`), ajouter :

```jsx
const etat          = getEtatObjectif(pct)
const prochainPalier = !atteint ? getProchainPalier(pct, goal.montantCible) : null
```

Puis trouver dans le JSX la section avec `{goal.nom}` et la description (environ lignes 569–580) :

```jsx
<div className="min-w-0">
  <h3 className="font-display text-[13px] font-extrabold leading-tight truncate"
    style={{ color: 'rgba(226,232,240,0.95)' }}>
    {goal.nom}
  </h3>
  {goal.description && (
    <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
      style={{ color: 'rgba(100,116,139,0.75)' }}>
      {goal.description}
    </p>
  )}
  {atteint && (
    <span ...>✓ Objectif atteint !</span>
  )}
</div>
```

Remplacer par :

```jsx
<div className="min-w-0">
  <div className="flex items-center gap-2 flex-wrap">
    <h3 className="font-display text-[13px] font-extrabold leading-tight truncate"
      style={{ color: 'rgba(226,232,240,0.95)' }}>
      {goal.nom}
    </h3>
    {/* Badge d'état */}
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: etat.bg, color: etat.color, border: `1px solid ${etat.border}` }}
    >
      {etat.emoji} {etat.label}
    </span>
  </div>
  {goal.description && (
    <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
      style={{ color: 'rgba(100,116,139,0.75)' }}>
      {goal.description}
    </p>
  )}
  {/* Message motivationnel */}
  {prochainPalier && (
    <p className="text-[10px] font-semibold mt-1.5 flex items-center gap-1"
      style={{ color: `${goal.couleur}99` }}>
      <span aria-hidden="true">🎯</span>
      Palier {prochainPalier.palier}% — encore {new Intl.NumberFormat('fr-FR').format(prochainPalier.restant)} FCFA
    </p>
  )}
  {atteint && (
    <span
      className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
      style={{ background: goal.couleur, boxShadow: `0 2px 8px ${goal.couleur}55` }}
    >
      ✓ Objectif atteint !
    </span>
  )}
</div>
```

- [ ] **Step 4: Vérifier dans le navigateur**

```bash
npm run dev
```

Aller sur http://localhost:5173/objectifs — chaque GoalCard affiche :
- Un badge d'état coloré (🌱 Démarrage / 💪 En cours / 🔥 Presque ! / ✓ Atteint !)
- Un message "🎯 Palier X% — encore Y FCFA" sous la description
- Des marqueurs verticaux sur la barre de progression à 25%, 50%, 75%

- [ ] **Step 5: Commit**

```bash
git add src/pages/Goals.jsx
git commit -m "feat: GoalCard milestone markers, state badge and next-palier message"
```

---

## Task 9: Charts — ligne snapshot header

**Files:**
- Modify: `src/pages/Charts.jsx`

- [ ] **Step 1: Ajouter la ligne snapshot entre le header et les tabs**

Dans `src/pages/Charts.jsx`, trouver le JSX entre le bloc `{/* ── Header ── */}` et le bloc `{/* ── Tabs ── */}` :

```jsx
{/* ── Header ── */}
<div>
  <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>Graphiques</h1>
  <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
    Analysez vos données financières visuellement
  </p>
</div>

{/* ── Tabs ── */}
```

Insérer entre les deux le bloc suivant :

```jsx
{/* ── Snapshot global ── */}
<div
  className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl"
  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
>
  {[
    { label: 'Dépenses ce mois', value: formatMontant(totalDepensesMois), color: '#fb7185' },
    { label: 'Revenus 12 mois',  value: formatMontant(totalRevenus12),    color: '#34d399' },
    { label: 'Solde actuel',     value: formatMontant(soldeActuel),       color: soldeActuel >= 0 ? '#818cf8' : '#fb7185' },
    { label: 'Épargne nette',    value: formatMontant(totalRevenus12 - totalDepenses12), color: (totalRevenus12 - totalDepenses12) >= 0 ? '#fb923c' : '#fb7185' },
  ].map(({ label, value, color }) => (
    <div
      key={label}
      className="flex flex-col gap-1 px-4 py-3"
      style={{ background: '#0b0e1c' }}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: `${color}99` }}>{label}</p>
      <p className="font-display text-[14px] font-extrabold tabular-nums leading-tight"
        style={{ color: 'rgba(226,232,240,0.92)' }}>
        {value}
      </p>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Vérifier dans le navigateur**

```bash
npm run dev
```

Aller sur http://localhost:5173/graphiques — une rangée de 4 mini-stats apparaît entre le titre et les tabs. Les tabs et graphiques sont inchangés.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Charts.jsx
git commit -m "feat: add financial snapshot row to Charts page header"
```

---

## Task 10: index.css — tokens composants

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Ajouter les classes de composants à la fin de index.css**

À la toute fin de `src/index.css`, ajouter :

```css
/* ─── Component tokens ──────────────────────────────────────────────────── */
@layer components {

  /* ── Buttons ───────────────────────────────────────────────────────── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    box-shadow: 0 6px 20px rgba(99,102,241,0.4);
    transition: opacity 150ms ease;
  }
  .btn-primary:hover  { opacity: 0.9; }
  .btn-primary:active { opacity: 0.85; transform: scale(0.99); }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(148,163,184,0.9);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 150ms ease;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.08); }

  .btn-danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fb7185;
    background: rgba(251,113,133,0.1);
    border: 1px solid rgba(251,113,133,0.2);
    transition: background 150ms ease, border-color 150ms ease;
  }
  .btn-danger:hover { background: rgba(251,113,133,0.18); border-color: rgba(251,113,133,0.35); }

  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    color: rgba(100,116,139,0.6);
    background: transparent;
    transition: color 150ms ease, background 150ms ease;
  }
  .btn-icon:hover { color: rgba(226,232,240,0.9); background: rgba(255,255,255,0.06); }

  /* ── Badges ────────────────────────────────────────────────────────── */
  .badge-ok   { padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: rgba(52,211,153,0.12);  color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
  .badge-warn { padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: rgba(251,146,60,0.12);  color: #fb923c; border: 1px solid rgba(251,146,60,0.25); }
  .badge-over { padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: rgba(244,63,94,0.12);   color: #f43f5e; border: 1px solid rgba(244,63,94,0.2);  }
  .badge-recur{ padding: 2px 8px;  border-radius: 6px;    font-size: 10px; font-weight: 600; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.25); }

  /* ── Dark input base (focus + error handled inline as before) ───────── */
  .input-dark {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e2e8f0;
    outline: none;
    transition: border-color 150ms ease, box-shadow 150ms ease;
  }
  .input-dark:focus {
    border-color: rgba(129,140,248,0.5);
    box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
  }
}
```

- [ ] **Step 2: Vérifier qu'il n'y a pas d'erreur CSS**

```bash
npm run dev
```

L'application doit démarrer sans erreur dans la console. Les classes `.btn-primary`, `.badge-ok`, etc. sont maintenant disponibles.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add btn-*, badge-*, input-dark component tokens to index.css"
```

---

## Vérification finale

- [ ] **Lancer les tests**

```bash
npm test
```

Attendu : tous les tests PASS (calculs existants + getKpiTendance)

- [ ] **Vérifier toutes les pages**

```bash
npm run dev
```

Checklist à vérifier sur http://localhost:5173 :

- [ ] **Dashboard** : sélecteur ← Juin 2026 → en haut à droite, KPI cards avec badge ↑/↓ et sparklines en bas
- [ ] **Dashboard mobile** : bande contextuelle solde/épargne sous la TopBar
- [ ] **Sidebar** : icône wallet dans le badge violet (pas d'horloge)
- [ ] **Transactions** : boutons modifier/supprimer visibles à 50% au repos
- [ ] **Transactions** : formulaire d'ajout en 2 étapes, montants rapides en F CFA (5 000 à 1 000 000)
- [ ] **Objectifs** : GoalCards avec badge d'état, message palier, marqueurs 25/50/75% sur la barre
- [ ] **Graphiques** : rangée snapshot (4 mini-stats) entre le titre et les tabs

- [ ] **Commit de fin**

```bash
git add -A
git commit -m "chore: final verification — Évolution Premium complete"
```
