# Alertes Budget Dashboard — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher une section d'alertes sur le Dashboard listant les budgets dépassés et en danger (≥ 80%), masquée quand tout va bien.

**Architecture:** Fonction pure `getBudgetAlerts` dans `calculations.js` (testée avec Vitest), composant interne `BudgetAlerts` dans `Dashboard.jsx`, données calculées via `useMemo`. La fonction réutilise `getProgressionBudgets` qui existe déjà — pas de duplication de logique.

**Tech Stack:** React 18, Vite, Vitest, Tailwind v4, localStorage

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/utils/calculations.js` | Modifier | Ajouter `getBudgetAlerts` |
| `src/utils/calculations.test.js` | Modifier | Ajouter tests Vitest pour `getBudgetAlerts` |
| `src/pages/Dashboard.jsx` | Modifier | Ajouter composant `BudgetAlerts` + useMemo `alerts` + JSX conditionnel |

---

## Task 1 : Ajouter `getBudgetAlerts` dans calculations.js (TDD)

**Files:**
- Modify: `budget-app/src/utils/calculations.js`
- Modify: `budget-app/src/utils/calculations.test.js`

- [ ] **Step 1.1 — Ajouter les tests dans calculations.test.js**

Ouvrir `src/utils/calculations.test.js` et ajouter ce bloc **à la fin du fichier**, après les tests existants de `getTop5Categories` :

```js
import { getBudgetAlerts } from './calculations.js'

// ── getBudgetAlerts ──────────────────────────────────────────────────────────

const txnsAlerts = [
  { id: 'a1', type: 'depense', montant: 58000, categorie: 'alimentation', date: '2026-06-01' },
  { id: 'a2', type: 'depense', montant: 42500, categorie: 'transport',    date: '2026-06-05' },
  { id: 'a3', type: 'depense', montant:  8000, categorie: 'loisirs',      date: '2026-06-10' },
  { id: 'a4', type: 'depense', montant:  5000, categorie: 'restaurant',   date: '2026-06-15' },
]

const budgetsAlerts = [
  { id: 'b1', categorie: 'alimentation', montantMensuel: 50000, mois: '2026-06' }, // 116% → depasse
  { id: 'b2', categorie: 'transport',    montantMensuel: 50000, mois: '2026-06' }, // 85%  → danger
  { id: 'b3', categorie: 'loisirs',      montantMensuel: 50000, mois: '2026-06' }, // 16%  → OK
  { id: 'b4', categorie: 'restaurant',   montantMensuel: 50000, mois: '2026-06' }, // 10%  → OK
]

describe('getBudgetAlerts', () => {
  it('inclut les budgets dépassés avec statut "depasse"', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const alim = result.find(r => r.categorie === 'alimentation')
    expect(alim).toBeDefined()
    expect(alim.statut).toBe('depasse')
  })

  it('inclut les budgets en danger (≥ 80%) avec statut "danger"', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const transport = result.find(r => r.categorie === 'transport')
    expect(transport).toBeDefined()
    expect(transport.statut).toBe('danger')
  })

  it('exclut les budgets sous contrôle (< 80%)', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    expect(result.every(r => r.categorie !== 'loisirs')).toBe(true)
    expect(result.every(r => r.categorie !== 'restaurant')).toBe(true)
  })

  it('trie les dépassés avant les en-danger', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    expect(result[0].statut).toBe('depasse')
    expect(result[1].statut).toBe('danger')
  })

  it('retourne [] si aucun budget en alerte', () => {
    const result = getBudgetAlerts([], budgetsAlerts, '2026-06')
    expect(result).toHaveLength(0)
  })

  it('expose pourcentageReel non plafonné et depassement', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const alim = result.find(r => r.categorie === 'alimentation')
    expect(alim.pourcentageReel).toBeCloseTo(116)
    expect(alim.depassement).toBe(8000)
  })
})
```

**Important :** la ligne `import { getBudgetAlerts } from './calculations.js'` s'ajoute en haut du fichier, dans le bloc d'import existant :
```js
import { getTop5Categories, getBudgetAlerts } from './calculations.js'
```

- [ ] **Step 1.2 — Vérifier que les tests échouent**

```bash
cd "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE\budget-app" && npm test -- --run
```

Résultat attendu : erreur `getBudgetAlerts is not a function` ou `is not exported`.

- [ ] **Step 1.3 — Ajouter `getBudgetAlerts` dans calculations.js**

À la fin de `src/utils/calculations.js`, ajouter :

```js
export function getBudgetAlerts(transactions, budgets, moisCourant) {
  return getProgressionBudgets(transactions, budgets, moisCourant)
    .map(b => ({
      ...b,
      pourcentageReel: b.montantMensuel > 0 ? (b.depense / b.montantMensuel) * 100 : 0,
      depassement: Math.max(0, b.depense - b.montantMensuel),
      statut: b.depasse ? 'depasse' : 'danger',
    }))
    .filter(b => b.depasse || b.pourcentage >= 80)
    .sort((a, b) => {
      if (a.depasse !== b.depasse) return a.depasse ? -1 : 1
      return b.pourcentageReel - a.pourcentageReel
    })
}
```

- [ ] **Step 1.4 — Vérifier que tous les tests passent**

```bash
cd "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE\budget-app" && npm test -- --run
```

Résultat attendu : 43 tests, 0 échec (37 existants + 6 nouveaux).

- [ ] **Step 1.5 — Commit**

```bash
git -C "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE" add budget-app/src/utils/calculations.js budget-app/src/utils/calculations.test.js
git -C "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE" commit -m "feat: add getBudgetAlerts to calculations + tests (T1)"
```

---

## Task 2 : Composant BudgetAlerts + intégration Dashboard.jsx

**Files:**
- Modify: `budget-app/src/pages/Dashboard.jsx`

- [ ] **Step 2.1 — Ajouter `getBudgetAlerts` à l'import calculations**

En haut de `Dashboard.jsx`, modifier le bloc import calculations (ligne ~9) :

```js
// AVANT
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
  getTop5Categories,
} from '@/utils/calculations'

// APRÈS
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
  getTop5Categories, getBudgetAlerts,
} from '@/utils/calculations'
```

- [ ] **Step 2.2 — Ajouter le composant `BudgetAlerts`**

Lire `Dashboard.jsx` pour repérer où se trouvent les composants internes `EvolutionBadge` et `TopCategories`. Juste **avant** `EvolutionBadge`, insérer :

```jsx
function BudgetAlerts({ alerts, moisLabel }) {
  const hasDepasse  = alerts.some(a => a.statut === 'depasse')
  const accentColor = hasDepasse ? '#fb7185' : '#fb923c'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0b0e1c',
        border: `1px solid ${hasDepasse ? 'rgba(251,113,133,0.2)' : 'rgba(251,146,60,0.16)'}`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
    >
      {/* Accent top line */}
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}88, ${accentColor}, ${accentColor}88, transparent)` }}
        aria-hidden="true"
      />
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}22` }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: accentColor }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em]"
          style={{ color: accentColor }}>
          Alertes budget — {moisLabel}
        </span>
      </div>
      {/* Rows */}
      <div>
        {alerts.map((item, i) => {
          const color = item.statut === 'depasse' ? '#fb7185' : '#fb923c'
          return (
            <div
              key={item.id}
              className="px-5 py-3.5 flex items-center gap-3"
              style={{ borderBottom: i < alerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${item.statut === 'depasse' ? 'animate-pulse' : ''}`}
                style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
                aria-hidden="true"
              />
              <span className="flex-1 text-sm font-semibold truncate"
                style={{ color: 'rgba(226,232,240,0.9)' }}>{item.label}</span>
              <div className="w-20 flex-shrink-0">
                <div className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(item.pourcentage, 100)}%`, background: color }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold tabular-nums w-10 text-right flex-shrink-0"
                style={{ color }}>
                {Math.round(item.pourcentageReel)}%
              </span>
              <span className="font-display text-sm font-bold tabular-nums flex-shrink-0 w-28 text-right"
                style={{ color }}>
                {item.statut === 'depasse'
                  ? `+${formatMontant(item.depassement)}`
                  : `${formatMontant(item.restant)} rest.`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2.3 — Ajouter le useMemo `alerts` dans la fonction Dashboard**

Dans la fonction `export default function Dashboard()`, après la ligne `const moisLabel = ...`, ajouter :

```js
const alerts = useMemo(
  () => getBudgetAlerts(state.transactions, state.budgets, state.settings.moisCourant),
  [state.transactions, state.budgets, state.settings.moisCourant]
)
```

- [ ] **Step 2.4 — Insérer `<BudgetAlerts>` dans le JSX**

Dans le JSX de Dashboard, repérer la fermeture `</div>` de la grille KPI cards (le `<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">` qui contient les 4 KPICard). Juste **après** ce `</div>` et **avant** le commentaire `{/* ── Top 5 catégories ── */}`, insérer :

```jsx
{/* ── Alertes budget ── */}
{alerts.length > 0 && <BudgetAlerts alerts={alerts} moisLabel={moisLabel} />}
```

- [ ] **Step 2.5 — Vérifier que les tests passent toujours**

```bash
cd "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE\budget-app" && npm test -- --run
```

Résultat attendu : 43 tests, 0 échec.

- [ ] **Step 2.6 — Commit**

```bash
git -C "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE" add budget-app/src/pages/Dashboard.jsx
git -C "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE" commit -m "feat: add BudgetAlerts section to Dashboard (T2)"
```

---

## Task 3 : Push GitHub

- [ ] **Step 3.1 — Push**

```bash
git -C "C:\Users\DELL\OneDrive\Desktop\08-CLAUDE CODE" push origin main
```

Résultat attendu : `main -> main` sans erreur.
