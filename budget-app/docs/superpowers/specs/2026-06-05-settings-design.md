# Spec — Page Settings (R6 — Évolution Premium)

**Date :** 2026-06-05  
**Statut :** Approuvé  
**Feature :** R6 — Page de configuration (Profil · Thème · Devise)

---

## Résumé

Ajouter une page `/settings` accessible depuis la Sidebar et le BottomNav mobile. Elle regroupe 3 sections : Profil (nom d'utilisateur affiché dans la Sidebar), Thème (dark/light), et Devise d'affichage (FCFA/EUR/USD — symbole uniquement, sans conversion des montants). Un hook `useFormatMontant()` propage la devise active dans toute l'app.

---

## Approche retenue

**Approche A — Page dédiée `/settings`**

Nouvelle route `/settings`, page `Settings.jsx` avec 3 cartes, hook `useFormatMontant()` pour propager la devise, items de navigation dans Sidebar et BottomNav.

---

## Fichiers

### Nouveaux fichiers

| Fichier | Rôle |
|---------|------|
| `src/pages/Settings.jsx` | Page Settings avec 3 sections : Profil, Thème, Devise |
| `src/utils/useFormatMontant.js` | Hook React retournant `formatMontant` lié à la devise active |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/constants/initialState.js` | Ajouter `nom: ''` et `devise: 'fcfa'` dans `settings` |
| `src/reducers/budgetReducer.js` | Ajouter actions `SET_NOM` et `SET_DEVISE` |
| `src/utils/formatters.js` | Ajouter paramètre optionnel `devise` à `formatMontant` |
| `src/App.jsx` | Ajouter route `/settings` |
| `src/components/layout/Sidebar.jsx` | Item "Paramètres" + affichage "Bonjour, {nom}" |
| `src/components/layout/BottomNav.jsx` | Item "Réglages" (icône engrenage) |
| `src/pages/Dashboard.jsx` | Remplacer `formatMontant` par `useFormatMontant` |
| `src/pages/Transactions.jsx` | Remplacer `formatMontant` par `useFormatMontant` |
| `src/pages/Budgets.jsx` | Remplacer `formatMontant` par `useFormatMontant` |
| `src/pages/Charts.jsx` | Remplacer `formatMontant` par `useFormatMontant` |
| `src/pages/Goals.jsx` | Remplacer `formatMontant` par `useFormatMontant` |

---

## Modèle de données

### `settings` enrichi (`initialState.js`)

```js
settings: {
  moisCourant: '2026-06',
  theme: 'dark',
  seeded: false,
  nom: '',          // '' = pas de nom configuré
  devise: 'fcfa',   // 'fcfa' | 'eur' | 'usd'
}
```

### Nouvelles actions reducer

| Action | Payload | Effet |
|--------|---------|-------|
| `SET_NOM` | `{ nom: string }` | `state.settings.nom = payload.nom` |
| `SET_DEVISE` | `{ devise: 'fcfa'\|'eur'\|'usd' }` | `state.settings.devise = payload.devise` |

---

## `formatMontant` mise à jour

```js
const SYMBOLES = { fcfa: 'FCFA', eur: 'EUR', usd: 'USD' }

export function formatMontant(montant, devise = 'fcfa') {
  const symbole = SYMBOLES[devise] ?? 'FCFA'
  return `${Math.round(montant).toLocaleString('fr-FR')} ${symbole}`
}
```

**Note :** La signature reste rétrocompatible — tous les appels existants sans second argument continuent de fonctionner (devise = `'fcfa'`).

---

## Hook `useFormatMontant`

```js
// src/utils/useFormatMontant.js
import { useBudget } from '@/context/BudgetContext'
import { formatMontant } from '@/utils/formatters'

export function useFormatMontant() {
  const { state } = useBudget()
  return (montant) => formatMontant(montant, state.settings.devise)
}
```

**Usage dans les pages :**
```js
// Avant
import { formatMontant } from '@/utils/formatters'
// ...
formatMontant(montant)

// Après
import { useFormatMontant } from '@/utils/useFormatMontant'
// ...
const fmt = useFormatMontant()
// ...
fmt(montant)
```

---

## Page Settings.jsx

### Header

```
Paramètres
Personnalisez votre expérience Budget Pro
```

### Carte 1 — Profil

- Input `.input-dark` avec `value={nom}` contrôlé par state local
- Bouton `.btn-primary` "Enregistrer" → `dispatch({ type: 'SET_NOM', payload: { nom } })`
- Pas d'enregistrement automatique (submit explicite)

### Carte 2 — Apparence

- 2 boutons toggle : "Sombre" et "Clair"
- Actif = fond indigo (`bg-indigo-600 text-white`)
- Inactif = `.btn-secondary`
- Dispatch `SET_THEME` existant au clic

### Carte 3 — Devise d'affichage

- 3 boutons toggle : "FCFA", "EUR", "USD"
- Même style que les boutons Thème
- Dispatch `SET_DEVISE` au clic
- Note explicative sous les boutons :
  ```
  ℹ Les montants restent stockés en FCFA. Seul le symbole change.
  ```

### Style des cartes

Cohérent avec le reste de l'app :
- `bg-[#0b0e1c]` + `border border-white/[0.06]` + `rounded-2xl`
- Header carte : titre `text-sm font-semibold text-white/90` + séparateur `border-b border-white/5`

---

## Navigation

### Sidebar

**Nom d'utilisateur :**
- Si `state.settings.nom` non vide → afficher sous le logo :
  ```
  Bonjour, {nom}
  ```
  en `text-xs text-white/40`
- Si vide → rien (comportement actuel préservé)

**Item Paramètres :**
- Ajouté en bas de la liste de navigation, avant le toggle dark/light
- Icône SVG engrenage (Heroicons outline `cog-6-tooth`)
- Label : "Paramètres"
- Route : `/settings`

### BottomNav

- Ajouter un item "Réglages" avec icône engrenage
- Route `/settings`
- Actif si `pathname === '/settings'`

---

## Tests

Pas de nouveaux tests unitaires — `Settings.jsx` est déclaratif. Les actions `SET_NOM` et `SET_DEVISE` sont triviales (une ligne chacune dans le reducer).

**Test manuel (golden path) :**
1. Naviguer vers `/settings` depuis la Sidebar ou le BottomNav
2. Saisir un prénom → "Enregistrer" → la Sidebar affiche "Bonjour, {prénom}"
3. Basculer Thème → l'app change de thème immédiatement
4. Choisir "EUR" → tous les montants de l'app affichent "EUR" au lieu de "FCFA"
5. Recharger la page → les 3 réglages persistent (localStorage)
6. Choisir "FCFA" → retour au symbole initial

---

## Contraintes techniques

- `localStorage` persistence : les nouveaux champs `nom` et `devise` sont sauvegardés automatiquement via le mécanisme `saveAll` existant dans `BudgetContext.jsx` (qui sauvegarde tout `state.settings`)
- Les tests existants (`calculations.test.js`, `csv.test.js`, `recurrence.test.js`) ne testent pas `formatMontant` directement — aucune mise à jour de tests requise
- `formatMontant` dans `RapportMensuel.jsx` (PDF) : le PDF blanc/professionnel continue d'utiliser `formatMontant` directement (pas le hook) — le PDF affiche toujours FCFA indépendamment du réglage de devise
- **Rétrocompatibilité localStorage** : les utilisateurs existants ont un `localStorage` sans `nom` ni `devise`. Le reducer `LOAD_FROM_STORAGE` doit merger les settings chargés avec les defaults de `initialState.js` :
  ```js
  settings: { ...initialState.settings, ...loaded.settings }
  ```
  Cela garantit que `nom` et `devise` ont leurs valeurs par défaut (`''` et `'fcfa'`) si absents du localStorage.
