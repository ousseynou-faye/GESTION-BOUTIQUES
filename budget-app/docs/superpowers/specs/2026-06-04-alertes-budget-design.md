# Design Spec — Alertes de Dépassement Budget (Dashboard)

**Date :** 2026-06-04
**Projet :** Budget App (React + Vite + Tailwind v4 + localStorage)
**Périmètre :** Afficher une section d'alertes sur le Dashboard quand des budgets sont dépassés ou en danger

---

## Contexte

La page Budgets affiche déjà les dépassements visuellement (cartes rouges, badges, sections groupées). Ce qui manque : la visibilité depuis le Dashboard. Un utilisateur qui ouvre l'app atterrit sur le Dashboard — il ne voit pas si ses budgets sont en danger sans naviguer vers une autre page.

---

## Décisions de conception

| Question | Décision |
|----------|----------|
| Périmètre d'affichage | Dashboard uniquement (pas de badge sidebar) |
| Budgets affichés | Dépassés (≥ 100%) ET en danger (≥ 80%) |
| Comportement si rien à signaler | Section masquée entièrement — Dashboard épuré |
| Placement dans le Dashboard | Après les KPI cards, avant le Top 5 catégories |
| Nouveau fichier ? | Non — fonction dans `calculations.js`, composant dans `Dashboard.jsx` |

---

## Section 1 — Données

### Nouvelle fonction : `getBudgetAlerts`

**Fichier :** `src/utils/calculations.js`

```js
getBudgetAlerts(transactions, budgets, moisCourant)
```

**Logique :**
1. Appelle `getProgressionBudgets(transactions, budgets, moisCourant)` (déjà existant)
2. Filtre : garde uniquement les entrées où `depasse === true` OU `pourcentage >= 80`
3. Ajoute un champ `statut: 'depasse'` si `depasse === true`, sinon `'danger'`
4. Trie : dépassés en premier, puis par `pourcentage` décroissant
5. Retourne le tableau

**Retour (une entrée) :**
```js
{
  id: 'budget_xxx',
  categorie: 'alimentation',
  label: 'Alimentation',
  couleur: '#f59e0b',
  montantMensuel: 50000,
  depense: 58000,
  restant: -8000,           // négatif si dépassé
  pourcentage: 116,
  depasse: true,
  statut: 'depasse',        // 'depasse' | 'danger'
}
```

---

## Section 2 — Composant `BudgetAlerts`

Composant interne dans `Dashboard.jsx` (non exporté).

### Structure visuelle

```
┌─────────────────────────────────────────────────────┐
│ ⚠  ALERTES BUDGET — JUIN 2026                       │
├─────────────────────────────────────────────────────┤
│ 🔴 Alimentation    ████████████░  116%  +8 000 F    │
│ 🟠 Transport       ████████░░░░░   85%  15 000 F    │
│ 🟠 Loisirs         ████████░░░░░   82%  18 000 F    │
└─────────────────────────────────────────────────────┘
```

### Couleurs par statut

| Statut | Couleur | Condition |
|--------|---------|-----------|
| Dépassé | `#fb7185` (rouge) | `statut === 'depasse'` |
| En danger | `#fb923c` (orange) | `statut === 'danger'` |

### Contenu par ligne

- **Dot coloré** — rouge ou orange selon statut
- **Label** de la catégorie
- **Barre de progression** — bornée à 100% visuellement, couleur selon statut
- **Pourcentage** — ex. `116%` ou `85%`
- **Montant** :
  - Si `depasse` → `+X F CFA` en rouge (montant du dépassement = `depense - montantMensuel`)
  - Si `danger` → `X F CFA restant` en orange (`restant`)

### Style

- Même dark glass : `background: '#0b0e1c'`, `border: 1px solid rgba(255,255,255,0.06)`
- Bordure supérieure colorée : rouge si au moins un budget dépassé, orange sinon
- Header : icône warning + `ALERTES BUDGET — [MOIS]` en font-display uppercase
- Aucun EmptyState — la section disparaît entièrement si `alerts.length === 0`

---

## Section 3 — Intégration dans Dashboard.jsx

### Import à ajouter

```js
import {
  // ... imports existants ...
  getBudgetAlerts,
} from '@/utils/calculations'
```

### Calcul dans la fonction Dashboard

```js
const alerts = useMemo(
  () => getBudgetAlerts(state.transactions, state.budgets, state.settings.moisCourant),
  [state.transactions, state.budgets, state.settings.moisCourant]
)
```

### Placement dans le JSX

```
KPI Cards              ← existant
ALERTES BUDGET         ← NOUVEAU (masqué si aucune alerte)
TOP 5 CATÉGORIES       ← existant
Graphiques             ← existant
Progression budgets    ← existant
Dernières transactions ← existant
```

```jsx
{/* ── Alertes budget ── */}
{alerts.length > 0 && <BudgetAlerts alerts={alerts} moisLabel={moisLabel} />}

{/* ── Top 5 catégories ── */}
<TopCategories top5={top5} moisLabel={moisLabel} />
```

---

## Tests — `src/utils/calculations.test.js`

| Cas | Comportement attendu |
|-----|---------------------|
| Budget à 116% | Inclus, statut `'depasse'`, trié en premier |
| Budget à 85% | Inclus, statut `'danger'` |
| Budget à 79% | Exclu |
| Aucun budget en alerte | Retourne `[]` |
| Tri | Dépassés avant en-danger, puis par pourcentage décroissant |

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/utils/calculations.js` | Ajouter `getBudgetAlerts` |
| `src/utils/calculations.test.js` | Ajouter tests pour `getBudgetAlerts` |
| `src/pages/Dashboard.jsx` | Ajouter composant `BudgetAlerts` + useMemo `alerts` + JSX conditionnel |

---

## Hors périmètre

- Badge de notification sur la sidebar
- Alerte sonore ou notification système
- Historique des dépassements
- Seuil configurable (fixé à 80%)
