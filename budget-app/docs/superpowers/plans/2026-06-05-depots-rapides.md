# R5 — Dépôts Rapides depuis le Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une section "Dépôts rapides" en bas du Dashboard qui affiche tous les objectifs d'épargne actifs avec 3 boutons de dépôt inline (+1 000 / +5 000 / +10 000 FCFA).

**Architecture:** Un nouveau composant `QuickDepositCard` (fichier dédié) affiche la carte d'un objectif. Le Dashboard filtre les objectifs non-complétés, passe une callback `handleQuickDeposit` à chaque carte, et dispatche `UPDATE_GOAL` directement — sans modal, sans state de chargement.

**Tech Stack:** React 19, Tailwind CSS v4, BudgetContext (Context API + useReducer), composants `ProgressBar` et `formatMontant` existants.

---

## Fichiers

| Action | Chemin | Rôle |
|--------|--------|------|
| **Create** | `src/components/goals/QuickDepositCard.jsx` | Mini-carte : nom, barre de progression, montant actuel/cible, 3 boutons de dépôt |
| **Modify** | `src/pages/Dashboard.jsx` | Ajouter `dispatch`, `activeGoals`, `handleQuickDeposit`, import et section JSX |

---

### Task 1 : Composant `QuickDepositCard`

**Files:**
- Create: `src/components/goals/QuickDepositCard.jsx`

> Pas de test unitaire — composant JSX déclaratif sans logique propre (les calculs viennent des props). Le test se fait manuellement en Task 2.

- [ ] **Step 1 : Créer le fichier `src/components/goals/QuickDepositCard.jsx`**

```jsx
import { formatMontant } from '@/utils/formatters'
import { ProgressBar } from '@/components/ui/ProgressBar'

const AMOUNTS = [1000, 5000, 10000]

export function QuickDepositCard({ goal, onDeposit }) {
  const pct = Math.round((goal.montantActuel / goal.montantCible) * 100)

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: '#0b0e1c',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Nom + montant actuel/cible */}
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'rgba(226,232,240,0.92)' }}
        >
          {goal.nom}
        </p>
        <span
          className="text-xs flex-shrink-0 tabular-nums"
          style={{ color: 'rgba(100,116,139,0.7)' }}
        >
          {formatMontant(goal.montantActuel)} / {formatMontant(goal.montantCible)}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <ProgressBar valeur={pct} couleur="#6366f1" taille="sm" className="flex-1" />
        <span
          className="text-xs font-bold w-10 text-right tabular-nums"
          style={{ color: '#6366f1' }}
        >
          {pct}%
        </span>
      </div>

      {/* Boutons de dépôt rapide */}
      <div className="flex items-center gap-2 justify-end">
        {AMOUNTS.map(amount => (
          <button
            key={amount}
            onClick={() => onDeposit(goal.id, amount)}
            className="btn-secondary text-xs px-3 py-1"
          >
            +{formatMontant(amount)}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier que le fichier est bien créé**

```bash
ls src/components/goals/
```

Résultat attendu : `QuickDepositCard.jsx` présent.

- [ ] **Step 3 : Committer**

```bash
git add src/components/goals/QuickDepositCard.jsx
git commit -m "feat: add QuickDepositCard component for inline deposits"
```

---

### Task 2 : Intégration dans Dashboard.jsx

**Files:**
- Modify: `src/pages/Dashboard.jsx:345` (destructuring useBudget)
- Modify: `src/pages/Dashboard.jsx:1` (imports)
- Modify: `src/pages/Dashboard.jsx:350` (après pdfLoading — ajouter activeGoals + handleQuickDeposit)
- Modify: `src/pages/Dashboard.jsx:717` (avant la fermeture du div principal — ajouter section JSX)

- [ ] **Step 1 : Ajouter `dispatch` au destructuring de `useBudget()`**

Ligne 345 actuellement :
```js
const { state } = useBudget()
```

Remplacer par :
```js
const { state, dispatch } = useBudget()
```

- [ ] **Step 2 : Ajouter l'import de `QuickDepositCard`**

Après la ligne 19 (`import { downloadPdf } from '@/components/pdf/pdfUtils'`), ajouter :

```js
import { QuickDepositCard } from '@/components/goals/QuickDepositCard'
```

- [ ] **Step 3 : Ajouter `activeGoals` et `handleQuickDeposit` dans le corps du composant**

Après la ligne 362 (fin du bloc `handleExportPdf`), ajouter :

```js
  const activeGoals = state.goals.filter(g => g.montantActuel < g.montantCible)

  function handleQuickDeposit(goalId, montant) {
    const goal = state.goals.find(g => g.id === goalId)
    dispatch({
      type: 'UPDATE_GOAL',
      payload: {
        ...goal,
        montantActuel: Math.min(goal.montantCible, goal.montantActuel + montant),
      },
    })
  }
```

- [ ] **Step 4 : Ajouter la section "Dépôts rapides" dans le JSX**

Après la ligne 717 (`      </div>` — fermeture du grid dernières transactions/top5), ajouter avant la fermeture du div principal (`    </div>` ligne 718) :

```jsx
      {/* ── Dépôts rapides ── */}
      {activeGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-display text-[13px] font-extrabold tracking-tight"
              style={{ color: 'rgba(226,232,240,0.92)' }}
            >
              Dépôts rapides
            </h2>
            <Link
              to="/goals"
              className="text-[11px] font-bold transition-colors"
              style={{ color: '#818cf8' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#818cf8' }}
            >
              Voir tous les objectifs →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeGoals.map(goal => (
              <QuickDepositCard
                key={goal.id}
                goal={goal}
                onDeposit={handleQuickDeposit}
              />
            ))}
          </div>
        </div>
      )}
```

- [ ] **Step 5 : Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur.

- [ ] **Step 6 : Test manuel — golden path**

1. Naviguer sur le Dashboard → la section "Dépôts rapides" est visible en bas si des objectifs actifs existent
2. Cliquer "+1 000 FCFA" sur un objectif → la barre de progression se met à jour immédiatement
3. Cliquer "+10 000 FCFA" sur un objectif à moins de 10 000 FCFA restants → la progression passe à 100% et la carte disparaît
4. Créer tous les objectifs à 100% (ou supprimer) → la section "Dépôts rapides" disparaît complètement
5. Cliquer "Voir tous les objectifs →" → navigation vers `/goals`

- [ ] **Step 7 : Committer**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: add quick deposit section to Dashboard (R5)"
```
