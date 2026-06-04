# Transactions Récurrentes Auto — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Générer automatiquement les transactions récurrentes manquantes au lancement de l'app.

**Architecture:** Logique pure dans `utils/recurrence.js` (testée avec Vitest), déclenchée par un `useEffect` dans `BudgetContext` après le chargement du localStorage, via une nouvelle action reducer `GENERATE_RECURRENTES`.

**Tech Stack:** React 18, Vite, Vitest, date-fns, localStorage

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/utils/recurrence.js` | Créer | Fonctions pures : calcul des mois manquants, construction des copies |
| `src/utils/recurrence.test.js` | Créer | Tests Vitest pour toutes les fonctions pures |
| `src/reducers/budgetReducer.js` | Modifier | Nouvelle action `GENERATE_RECURRENTES` + init `derniereGeneration` dans `ADD_TRANSACTION` |
| `src/context/BudgetContext.jsx` | Modifier | `useEffect` qui déclenche la génération après chargement storage |

---

## Task 1 : Écrire les tests (TDD — les fonctions n'existent pas encore)

**Files:**
- Create: `budget-app/src/utils/recurrence.test.js`

- [ ] **Step 1.1 — Créer le fichier de tests**

Créer `src/utils/recurrence.test.js` avec le contenu suivant :

```js
import { describe, it, expect } from 'vitest'
import { dateToMois, moisEntre, ajusterJour, calculerTransactionsAGenerer } from './recurrence.js'

// ── dateToMois ───────────────────────────────────────────────────────────────
describe('dateToMois', () => {
  it('extrait YYYY-MM depuis une date ISO', () => {
    expect(dateToMois('2026-06-05')).toBe('2026-06')
    expect(dateToMois('2026-12-31')).toBe('2026-12')
  })
})

// ── moisEntre ────────────────────────────────────────────────────────────────
describe('moisEntre', () => {
  it('retourne les mois entre debut (exclu) et fin (inclus)', () => {
    expect(moisEntre('2026-03', '2026-06')).toEqual(['2026-04', '2026-05', '2026-06'])
  })

  it('retourne un tableau vide si debut === fin', () => {
    expect(moisEntre('2026-06', '2026-06')).toEqual([])
  })

  it('gère le passage d\'année', () => {
    expect(moisEntre('2025-11', '2026-02')).toEqual(['2025-12', '2026-01', '2026-02'])
  })
})

// ── ajusterJour ──────────────────────────────────────────────────────────────
describe('ajusterJour', () => {
  it('retourne la date exacte si le jour existe dans le mois', () => {
    expect(ajusterJour('2026-06', 15)).toBe('2026-06-15')
  })

  it('ajuste au dernier jour si le mois est trop court (31 → 28 en février)', () => {
    expect(ajusterJour('2026-02', 31)).toBe('2026-02-28')
  })

  it('gère le 29 février en année bissextile', () => {
    expect(ajusterJour('2028-02', 29)).toBe('2028-02-29')
  })
})

// ── calculerTransactionsAGenerer ─────────────────────────────────────────────
describe('calculerTransactionsAGenerer', () => {
  const txnBase = {
    id: 'txn_1',
    type: 'depense',
    montant: 50000,
    categorie: 'loyer',
    description: 'Loyer mensuel',
    note: null,
    date: '2026-03-05',
    recurrente: true,
    derniereGeneration: '2026-03',
  }

  it('ne génère rien si derniereGeneration === moisCourant', () => {
    const { nouvelles, majOriginales } = calculerTransactionsAGenerer([txnBase], '2026-03')
    expect(nouvelles).toHaveLength(0)
    expect(majOriginales).toHaveLength(0)
  })

  it('génère 3 copies pour 3 mois de retard avec les bonnes dates', () => {
    const { nouvelles, majOriginales } = calculerTransactionsAGenerer([txnBase], '2026-06')
    expect(nouvelles).toHaveLength(3)
    expect(nouvelles[0].date).toBe('2026-04-05')
    expect(nouvelles[1].date).toBe('2026-05-05')
    expect(nouvelles[2].date).toBe('2026-06-05')
    expect(majOriginales).toEqual([{ id: 'txn_1', derniereGeneration: '2026-06' }])
  })

  it('les copies ont recurrente: false', () => {
    const { nouvelles } = calculerTransactionsAGenerer([txnBase], '2026-04')
    expect(nouvelles[0].recurrente).toBe(false)
  })

  it('utilise le mois de date si derniereGeneration est absent', () => {
    const { id: _, derniereGeneration: __, ...txnSansGen } = txnBase
    const txn = { ...txnSansGen, id: 'txn_2' }
    const { nouvelles } = calculerTransactionsAGenerer([txn], '2026-04')
    expect(nouvelles).toHaveLength(1)
    expect(nouvelles[0].date).toBe('2026-04-05')
  })

  it('ignore les transactions non récurrentes', () => {
    const txnNonRec = { ...txnBase, recurrente: false }
    const { nouvelles } = calculerTransactionsAGenerer([txnNonRec], '2026-06')
    expect(nouvelles).toHaveLength(0)
  })

  it('ajuste le jour si le mois est trop court (loyer le 31)', () => {
    const txnJour31 = { ...txnBase, date: '2026-01-31', derniereGeneration: '2026-01' }
    const { nouvelles } = calculerTransactionsAGenerer([txnJour31], '2026-02')
    expect(nouvelles[0].date).toBe('2026-02-28')
  })
})
```

- [ ] **Step 1.2 — Vérifier que les tests échouent**

```bash
cd budget-app && npm test
```

Résultat attendu : erreurs `Cannot find module './recurrence.js'` — c'est normal, le fichier n'existe pas encore.

- [ ] **Step 1.3 — Commit des tests**

```bash
git add budget-app/src/utils/recurrence.test.js
git commit -m "test: add failing tests for recurrence utils (TDD)"
```

---

## Task 2 : Implémenter `recurrence.js` (faire passer les tests)

**Files:**
- Create: `budget-app/src/utils/recurrence.js`

- [ ] **Step 2.1 — Créer le fichier**

Créer `src/utils/recurrence.js` :

```js
function makeId() {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function dateToMois(dateStr) {
  return dateStr.slice(0, 7)
}

export function moisEntre(debut, fin) {
  const mois = []
  let [y, m] = debut.split('-').map(Number)
  const [fy, fm] = fin.split('-').map(Number)

  m += 1
  if (m > 12) { m = 1; y += 1 }

  while (y < fy || (y === fy && m <= fm)) {
    mois.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }

  return mois
}

export function ajusterJour(moisStr, jour) {
  const [y, m] = moisStr.split('-').map(Number)
  const dernierJour = new Date(y, m, 0).getDate()
  const j = Math.min(jour, dernierJour)
  return `${moisStr}-${String(j).padStart(2, '0')}`
}

export function calculerTransactionsAGenerer(transactions, moisCourant) {
  const nouvelles = []
  const majOriginales = []

  for (const t of transactions) {
    if (!t.recurrente) continue

    const lastGen = t.derniereGeneration ?? dateToMois(t.date)
    if (lastGen === moisCourant) continue

    const mois = moisEntre(lastGen, moisCourant)
    if (mois.length === 0) continue

    const jourOriginal = parseInt(t.date.slice(8, 10), 10)

    for (const moisCible of mois) {
      nouvelles.push({
        id: makeId(),
        type: t.type,
        montant: t.montant,
        categorie: t.categorie,
        description: t.description,
        note: t.note ?? null,
        recurrente: false,
        date: ajusterJour(moisCible, jourOriginal),
        createdAt: Date.now(),
      })
    }

    majOriginales.push({ id: t.id, derniereGeneration: moisCourant })
  }

  return { nouvelles, majOriginales }
}
```

- [ ] **Step 2.2 — Lancer les tests**

```bash
cd budget-app && npm test
```

Résultat attendu : tous les tests passent (7 tests, 0 échec).

- [ ] **Step 2.3 — Commit**

```bash
git add budget-app/src/utils/recurrence.js
git commit -m "feat: add recurrence utils with full test coverage (T1)"
```

---

## Task 3 : Mettre à jour `budgetReducer.js`

**Files:**
- Modify: `budget-app/src/reducers/budgetReducer.js`

- [ ] **Step 3.1 — Modifier le case `ADD_TRANSACTION`**

Remplacer le case `ADD_TRANSACTION` existant :

```js
// AVANT
case 'ADD_TRANSACTION':
  return {
    ...state,
    transactions: [
      { ...action.payload, id: makeId('txn'), createdAt: Date.now() },
      ...state.transactions,
    ],
  }
```

Par :

```js
// APRÈS
case 'ADD_TRANSACTION': {
  const t = { ...action.payload, id: makeId('txn'), createdAt: Date.now() }
  if (t.recurrente) t.derniereGeneration = t.date.slice(0, 7)
  return { ...state, transactions: [t, ...state.transactions] }
}
```

- [ ] **Step 3.2 — Ajouter le case `GENERATE_RECURRENTES`**

Juste après le case `DELETE_TRANSACTION`, ajouter :

```js
case 'GENERATE_RECURRENTES': {
  const { nouvelles, majOriginales } = action.payload
  const mises = new Map(majOriginales.map(m => [m.id, m.derniereGeneration]))
  return {
    ...state,
    transactions: [
      ...nouvelles,
      ...state.transactions.map(t =>
        mises.has(t.id) ? { ...t, derniereGeneration: mises.get(t.id) } : t
      ),
    ],
  }
}
```

- [ ] **Step 3.3 — Vérifier que les tests passent toujours**

```bash
cd budget-app && npm test
```

Résultat attendu : 7 tests passent, 0 régression.

- [ ] **Step 3.4 — Commit**

```bash
git add budget-app/src/reducers/budgetReducer.js
git commit -m "feat: add GENERATE_RECURRENTES action + init derniereGeneration in ADD_TRANSACTION (T2)"
```

---

## Task 4 : Mettre à jour `BudgetContext.jsx`

**Files:**
- Modify: `budget-app/src/context/BudgetContext.jsx`

- [ ] **Step 4.1 — Ajouter l'import de `format` et de `calculerTransactionsAGenerer`**

En haut du fichier, ajouter les imports suivants après les imports existants :

```js
import { format } from 'date-fns'
import { calculerTransactionsAGenerer } from '@/utils/recurrence'
```

- [ ] **Step 4.2 — Ajouter le `useEffect` de génération**

Dans `BudgetProvider`, après le `useEffect` du thème (lignes ~22-30), ajouter :

```js
// Génération automatique des transactions récurrentes au lancement
useEffect(() => {
  if (!state.seeded) return
  const moisCourant = format(new Date(), 'yyyy-MM')
  const { nouvelles, majOriginales } = calculerTransactionsAGenerer(
    state.transactions,
    moisCourant
  )
  if (nouvelles.length > 0 || majOriginales.length > 0) {
    dispatch({ type: 'GENERATE_RECURRENTES', payload: { nouvelles, majOriginales } })
  }
}, [state.seeded])
```

**Explication :** `state.seeded` passe de `false` à `true` une seule fois (après `LOAD_FROM_STORAGE` ou `SEED_DATA`). Le `useEffect` ne se déclenche donc qu'une seule fois par lancement de l'app, exactement après que les données soient chargées.

- [ ] **Step 4.3 — Vérifier que les tests passent toujours**

```bash
cd budget-app && npm test
```

Résultat attendu : 7 tests passent, 0 régression.

- [ ] **Step 4.4 — Tester manuellement dans le navigateur**

1. Ouvrir `http://localhost:5174`
2. Aller dans Transactions
3. Créer une transaction avec "Transaction récurrente" cochée, datée du **mois dernier**
4. Rafraîchir la page (`F5`)
5. Vérifier qu'une nouvelle transaction est apparue pour **le mois courant** avec `recurrente: false`

- [ ] **Step 4.5 — Commit**

```bash
git add budget-app/src/context/BudgetContext.jsx
git commit -m "feat: auto-generate recurring transactions on app launch (T3)"
```

---

## Task 5 : Push GitHub

- [ ] **Step 5.1 — Push**

```bash
git push origin main
```

Résultat attendu : `main -> main` sans erreur.
