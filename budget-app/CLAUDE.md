# Budget Pro — Application de Gestion de Budget

## Lancement

```bash
npm run dev     # Serveur dev sur http://localhost:5173
npm run build   # Build production dans dist/
```

## Architecture

**Stack :** React 18 + Vite 8 + Tailwind v4 + Recharts + date-fns + React Router v6

**Données :** Stockées dans `localStorage` (4 clés : `budget_transactions`, `budget_budgets`, `budget_goals`, `budget_settings`)

**État global :** `BudgetContext` (Context API + useReducer) dans `src/context/BudgetContext.jsx`

## Structure des fichiers

```
src/
  context/BudgetContext.jsx    # Provider + persistance auto localStorage
  reducers/budgetReducer.js    # Reducer avec toutes les actions CRUD
  constants/
    categories.js              # 18 catégories FR avec couleurs
    initialState.js            # Seed data (premier lancement)
  utils/
    calculations.js            # Fonctions pures de calcul (totaux, stats, graphiques)
    formatters.js              # Formatage euros FR, dates (date-fns)
    storage.js                 # loadAll / saveAll localStorage
  pages/
    Dashboard.jsx              # KPI + mini-charts + dernières transactions
    Transactions.jsx           # Liste filtrée + add/edit/delete
    Budgets.jsx                # Budgets mensuels par catégorie
    Charts.jsx                 # 3 graphiques (pie, barres, solde)
    Goals.jsx                  # Objectifs d'épargne avec dépôts
  components/
    layout/Sidebar.jsx         # Navigation desktop (md+)
    layout/TopBar.jsx          # Navigation mobile + drawer
    ui/                        # Composants réutilisables
    transactions/              # Formulaire + liste transactions
```

## Conventions

- Tailwind v4 : pas de `tailwind.config.js`, configuration dans `src/index.css` avec `@theme`
- Dark mode : classe `.dark` sur `<html>` (toggle via BudgetContext dispatch `SET_THEME`)
- Alias `@` → `src/` (défini dans `vite.config.js`)
- IDs générés côté client : `${prefix}_${Date.now()}_${random}`
- Dates au format ISO 8601 `YYYY-MM-DD` (strings)

## Ajouter une nouvelle catégorie

1. Ajouter l'entrée dans `src/constants/categories.js`
2. Décider du `type` : `'revenu'` ou `'depense'`
3. Choisir une `couleur` hexadécimale unique
