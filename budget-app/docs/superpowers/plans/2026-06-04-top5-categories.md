# Top 5 Catégories Dashboard — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le top 5 des catégories de dépenses du mois courant avec évolution vs mois précédent, entre les KPI cards et les graphiques du Dashboard.

**Architecture:** Fonction pure `getTop5Categories` dans `calculations.js` (testée avec Vitest), composant interne `TopCategories` + `EvolutionBadge` dans `Dashboard.jsx`, données calculées via `useMemo`.

**Tech Stack:** React 18, Vite, Vitest, date-fns, Tailwind v4, localStorage

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/utils/calculations.js` | Modifier | Ajouter `getTop5Categories` |
| `src/utils/calculations.test.js` | Créer | Tests Vitest pour `getTop5Categories` |
| `src/pages/Dashboard.jsx` | Modifier | Ajouter composants `TopCategories` + `EvolutionBadge` + intégration JSX |

---

## Task 1 : Ajouter `getTop5Categories` dans calculations.js (TDD)

**Files:**
- Create: `budget-app/src/utils/calculations.test.js`
- Modify: `budget-app/src/utils/calculations.js`

- [ ] **Step 1.1 — Écrire les tests (fichier n'existe pas encore)**

Créer `src/utils/calculations.test.js` :

```js
import { describe, it, expect } from 'vitest'
import { getTop5Categories } from './calculations.js'

const txns = [
  { id: '1', type: 'depense', montant: 50000, categorie: 'loyer',        date: '2026-06-01' },
  { id: '2', type: 'depense', montant: 45000, categorie: 'alimentation', date: '2026-06-05' },
  { id: '3', type: 'depense', montant: 12000, categorie: 'transport',    date: '2026-06-10' },
  { id: '4', type: 'depense', montant:  8000, categorie: 'loisirs',      date: '2026-06-12' },
  { id: '5', type: 'depense', montant:  5000, categorie: 'abonnements',  date: '2026-06-15' },
  { id: '6', type: 'depense', montant:  3000, categorie: 'restaurant',   date: '2026-06-20' },
  { id: '7', type: 'revenu',  montant: 200000, categorie: 'salaire',     date: '2026-06-01' },
  // Mois précédent
  { id: '8', type: 'depense', montant: 40000, categorie: 'alimentation', date: '2026-05-05' },
  { id: '9', type: 'depense', montant: 50000, categorie: 'loyer',        date: '2026-05-01' },
]

describe('getTop5Categories', () => {
  it('retourne max 5 catégories triées par montant décroissant', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result).toHaveLength(5)
    expect(result[0].categorie).toBe('loyer')
    expect(result[1].categorie).toBe('alimentation')
  })

  it('ignore les revenus — seules les dépenses comptent', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result.every(r => r.categorie !== 'salaire')).toBe(true)
  })

  it('calcule l\'évolution correctement (hausse)', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const alim = result.find(r => r.categorie === 'alimentation')
    // (45000 - 40000) / 40000 * 100 = 12.5
    expect(alim.evolution).toBeCloseTo(12.5)
  })

  it('retourne evolution null si aucune dépense le mois précédent dans cette catégorie', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const loisirs = result.find(r => r.categorie === 'loisirs')
    expect(loisirs.evolution).toBeNull()
  })

  it('calcule le pourcentage du total des dépenses du mois', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const loyer = result.find(r => r.categorie === 'loyer')
    // total = 50000+45000+12000+8000+5000+3000 = 123000
    // loyer = 50000/123000*100 ≈ 40.65
    expect(loyer.pourcentage).toBeCloseTo(40.65, 1)
  })

  it('retourne un tableau vide si aucune dépense ce mois', () => {
    const result = getTop5Categories([], '2026-06', '2026-05')
    expect(result).toHaveLength(0)
  })

  it('retourne les champs label et couleur depuis CATEGORIES', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result[0].label).toBeTruthy()
    expect(result[0].couleur).toMatch(/^#/)
  })
})
```

- [ ] **Step 1.2 — Vérifier que les tests échouent**

```bash
cd budget-app && npm test
```

Résultat attendu : erreur `getTop5Categories is not a function` ou `is not exported`.

- [ ] **Step 1.3 — Ajouter `getTop5Categories` dans calculations.js**

À la fin de `src/utils/calculations.js`, ajouter :

```js
export function getTop5Categories(transactions, moisCourant, moisPrecedent) {
  const depCourantes  = transactions.filter(t => t.type === 'depense' && t.date.startsWith(moisCourant))
  const depPrecedentes = transactions.filter(t => t.type === 'depense' && t.date.startsWith(moisPrecedent))

  const mapCourant = {}
  for (const t of depCourantes)   mapCourant[t.categorie]  = (mapCourant[t.categorie]  || 0) + t.montant

  const mapPrecedent = {}
  for (const t of depPrecedentes) mapPrecedent[t.categorie] = (mapPrecedent[t.categorie] || 0) + t.montant

  const total = Object.values(mapCourant).reduce((s, v) => s + v, 0)

  return Object.entries(mapCourant)
    .map(([categorie, montantCourant]) => {
      const montantPrecedent = mapPrecedent[categorie] || 0
      return {
        categorie,
        label:      CATEGORIES[categorie]?.label   ?? categorie,
        couleur:    CATEGORIES[categorie]?.couleur  ?? '#6366f1',
        montantCourant,
        montantPrecedent,
        evolution:  montantPrecedent > 0
          ? ((montantCourant - montantPrecedent) / montantPrecedent) * 100
          : null,
        pourcentage: total > 0 ? (montantCourant / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.montantCourant - a.montantCourant)
    .slice(0, 5)
}
```

- [ ] **Step 1.4 — Vérifier que les tests passent**

```bash
cd budget-app && npm test
```

Résultat attendu : tous les tests passent (29 existants + 7 nouveaux = 36 tests, 0 échec).

- [ ] **Step 1.5 — Commit**

```bash
git add budget-app/src/utils/calculations.js budget-app/src/utils/calculations.test.js
git commit -m "feat: add getTop5Categories to calculations + tests (T1)"
```

---

## Task 2 : Composant TopCategories + intégration Dashboard.jsx

**Files:**
- Modify: `budget-app/src/pages/Dashboard.jsx`

- [ ] **Step 2.1 — Ajouter les imports manquants en haut de Dashboard.jsx**

Remplacer la ligne d'import de calculations :
```js
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
} from '@/utils/calculations'
```

Par :
```js
import { format, subMonths } from 'date-fns'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
  getTop5Categories,
} from '@/utils/calculations'
```

- [ ] **Step 2.2 — Ajouter le composant `EvolutionBadge` après les constantes d'icônes existantes**

Juste avant la fonction `Card({ children, className })`, ajouter :

```jsx
function EvolutionBadge({ evolution }) {
  if (evolution === null) {
    return (
      <span className="text-xs w-16 text-right flex-shrink-0 tabular-nums"
        style={{ color: 'rgba(100,116,139,0.5)' }}>—</span>
    )
  }
  const isPos  = evolution > 0
  const isZero = evolution === 0
  const color  = isZero ? 'rgba(148,163,184,0.7)' : isPos ? '#34d399' : '#fb7185'
  const arrow  = isZero ? '→' : isPos ? '↑' : '↓'
  const text   = isZero ? '=' : `${isPos ? '+' : ''}${evolution.toFixed(1)}%`
  return (
    <span className="text-xs font-bold w-16 text-right flex-shrink-0 tabular-nums"
      style={{ color }}>
      {arrow} {text}
    </span>
  )
}

function TopCategories({ top5, moisLabel }) {
  if (top5.length === 0) {
    return (
      <EmptyState
        titre="Aucune dépense ce mois-ci"
        message="Ajoutez des transactions pour voir le top des catégories."
      />
    )
  }
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0b0e1c',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.14)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: '#818cf8' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em]"
          style={{ color: 'rgba(165,180,252,0.9)' }}>
          Top 5 dépenses — {moisLabel}
        </span>
      </div>
      {/* Rows */}
      <div>
        {top5.map((item, i) => (
          <div
            key={item.categorie}
            className="px-5 py-3.5 flex items-center gap-3"
            style={{ borderBottom: i < top5.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
          >
            <span className="text-[11px] font-bold w-4 text-center flex-shrink-0"
              style={{ color: 'rgba(100,116,139,0.5)' }}>{i + 1}</span>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.couleur, boxShadow: `0 0 6px ${item.couleur}88` }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm font-semibold truncate"
              style={{ color: 'rgba(226,232,240,0.9)' }}>{item.label}</span>
            <EvolutionBadge evolution={item.evolution} />
            <span className="font-display text-sm font-bold tabular-nums flex-shrink-0"
              style={{ color: 'rgba(226,232,240,0.95)' }}>
              {formatMontant(item.montantCourant)}
            </span>
            <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(item.pourcentage, 100)}%`, background: item.couleur }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums w-7 text-right"
                style={{ color: 'rgba(100,116,139,0.7)' }}>
                {item.pourcentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2.3 — Ajouter le calcul top5 dans la fonction Dashboard**

Dans la fonction `export default function Dashboard()`, ajouter après les useMemo existants :

```js
const moisPrecedent = format(subMonths(new Date(), 1), 'yyyy-MM')
const top5 = useMemo(
  () => getTop5Categories(state.transactions, state.settings.moisCourant, moisPrecedent),
  [state.transactions, state.settings.moisCourant]
)
const moisLabel = formatMois(state.settings.moisCourant + '-01')
```

- [ ] **Step 2.4 — Insérer `<TopCategories>` dans le JSX**

Dans le JSX de Dashboard, localiser la section KPI cards (le `<div className="grid ... sm:grid-cols-4 ...">` qui contient les 4 KPICard). Juste **après** la balise fermante `</div>` de cette grille et **avant** la grille des graphiques, ajouter :

```jsx
{/* ── Top 5 catégories ── */}
<TopCategories top5={top5} moisLabel={moisLabel} />
```

- [ ] **Step 2.5 — Vérifier que les tests passent toujours**

```bash
cd budget-app && npm test
```

Résultat attendu : 36 tests, 0 échec.

- [ ] **Step 2.6 — Commit**

```bash
git add budget-app/src/pages/Dashboard.jsx
git commit -m "feat: add TopCategories section to Dashboard (T2)"
```

---

## Task 3 : Push GitHub

- [ ] **Step 3.1 — Push**

```bash
git push origin main
```

Résultat attendu : `main -> main` sans erreur.
