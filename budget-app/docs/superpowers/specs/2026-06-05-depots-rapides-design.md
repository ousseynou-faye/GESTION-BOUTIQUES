# Spec — Dépôts Rapides depuis le Dashboard

**Date :** 2026-06-05  
**Statut :** Approuvé  
**Feature :** R5 — Dépôts rapides depuis le Dashboard

---

## Résumé

Ajouter une section "Dépôts rapides" en bas du Dashboard qui affiche tous les objectifs d'épargne actifs (non-complétés). Chaque objectif est représenté par une mini-carte avec barre de progression et 3 boutons de dépôt rapide (+1 000 / +5 000 / +10 000 FCFA). Un clic = dépôt immédiat, sans modal.

---

## Approche retenue

**Approche A — Mini-cartes horizontales avec boutons inline**

Nouvelle section dédiée en bas du Dashboard. Chaque objectif non-complété = une `QuickDepositCard` avec nom, barre de progression, montant actuel/cible, et 3 boutons de dépôt rapide. Le dépôt est immédiat (dispatch synchrone, pas de modal).

---

## Fichiers

### Nouveau fichier

| Fichier | Rôle |
|---------|------|
| `src/components/goals/QuickDepositCard.jsx` | Mini-carte pour un objectif : nom, barre de progression, montant actuel/cible, 3 boutons de dépôt rapide |

### Fichier modifié

| Fichier | Modification |
|---------|-------------|
| `src/pages/Dashboard.jsx` | Ajout de la section "Dépôts rapides" en bas de page, filtrage des objectifs non-complétés |

---

## Composant QuickDepositCard

### Props

```js
{
  goal,     // objet objectif : { id, nom, montantActuel, montantCible, ... }
  onDeposit // function(goalId, montant) — callback vers Dashboard
}
```

### Structure visuelle

```
┌─────────────────────────────────────────────────────┐
│ Voyage au Japon                  45 000 / 200 000 FCFA │
│ ████████░░░░░░░░░░░░░░░  22%                         │
│                    [+1 000]  [+5 000]  [+10 000]     │
└─────────────────────────────────────────────────────┘
```

### Styles

- **Fond carte :** `bg-[#0b0e1c]` + `border border-white/5` + `rounded-2xl p-4`
- **Nom objectif :** `text-white font-semibold text-sm`
- **Montant actuel/cible :** `text-white/50 text-xs` aligné à droite
- **Barre de progression :** fond `bg-white/10`, remplissage `bg-indigo-500`, `h-1.5 rounded-full`
- **Boutons :** classe `.btn-secondary` + `text-xs px-3 py-1`

### Logique des boutons

- 3 montants fixes : **+1 000 / +5 000 / +10 000 FCFA**
- Tous toujours activés
- Le reducer existant `UPDATE_GOAL` applique `Math.min(montantCible, montantActuel + montant)` — pas d'overshooting possible

---

## Section Dashboard

### Emplacement

Tout en bas de la page Dashboard, après la section "Dernières transactions".

### Condition d'affichage

- Objectifs actifs = `state.goals.filter(g => g.montantActuel < g.montantCible)`
- Si aucun objectif actif → section masquée (aucun rendu)

### Header de section

```jsx
<div className="flex items-center justify-between mb-3">
  <h2 className="text-white font-semibold">Dépôts rapides</h2>
  <Link to="/goals" className="text-indigo-400 text-xs hover:underline">
    Voir tous les objectifs →
  </Link>
</div>
```

### Grid

- `grid grid-cols-1 md:grid-cols-2 gap-3`
- Tous les objectifs actifs, avec scroll natif de la page si nombreux

### Logique de dépôt dans Dashboard

```js
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

### Feedback

- Pas de toast/notification — la barre de progression se met à jour instantanément (state React réactif)
- Si l'objectif atteint 100% après le dépôt → la carte disparaît automatiquement au prochain render (filtre actif)
- Pas de state local de loading — dispatch synchrone

---

## Fonctions réutilisées

| Fonction | Usage |
|----------|-------|
| `formatMontant(montant)` | Affichage montant actuel/cible et labels des boutons |

---

## Tests

Pas de nouveaux tests unitaires — `QuickDepositCard` est du JSX déclaratif et `handleQuickDeposit` appelle directement le reducer déjà testé.

**Test manuel (golden path) :**
1. Naviguer sur le Dashboard → la section "Dépôts rapides" apparaît si des objectifs actifs existent
2. Cliquer "+1 000" sur un objectif → la barre de progression se met à jour immédiatement
3. Cliquer "+10 000" sur un objectif à 9 000 FCFA restants → la progression passe à 100% et la carte disparaît
4. Si aucun objectif actif → la section est masquée
5. Cliquer "Voir tous les objectifs →" → navigation vers `/goals`

---

## Contraintes techniques

- `dispatch` via `useBudgetContext()` déjà disponible dans `Dashboard.jsx`
- `Link` de `react-router-dom` déjà importé dans `Dashboard.jsx`
- `formatMontant` de `@/utils/formatters` déjà importé dans `Dashboard.jsx`
- Aucune nouvelle dépendance npm
