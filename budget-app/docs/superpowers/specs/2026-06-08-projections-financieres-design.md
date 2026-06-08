# R7 — Page Projections Financières

**Date :** 2026-06-08
**Statut :** Approuvé

## Résumé

Nouvelle page dédiée `/projections` affichant le flux mensuel prévisionnel (revenus / dépenses / épargne nette) sur un horizon de 3, 6 ou 12 mois. Les mois passés affichent les données réelles ; les mois futurs sont estimés à partir de la moyenne des 3 derniers mois complets.

---

## Fonctionnalité

### Ce que l'utilisateur voit

Une page complète avec :

1. **Banner** (style cohérent avec Budgets / Goals / Charts)
   - Titre « Projections »
   - Sous-titre : « Flux mensuel prévisionnel · Moyenne des 3 derniers mois »
   - **Sélecteur d'horizon** : 3 boutons toggle `3 mois / 6 mois / 12 mois` — aligné à droite dans le banner
   - Défaut : 6 mois

2. **3 KPI tiles** (sous le titre, dans le banner)
   - **Revenus prévus** (vert) — total des revenus sur la période = réels + estimés
   - **Dépenses prévues** (rouge) — total des dépenses sur la période = réelles + estimées
   - **Épargne nette** (indigo) — revenus − dépenses, avec sous-titre « soit ~X / mois »
   - Chaque tuile affiche un sous-titre : « dont X réels »

3. **Graphique BarChart groupé** (Recharts)
   - Une paire de barres par mois : `[Revenus, Dépenses]`
   - Mois passés (données réelles) : barres pleines, opacité normale
   - Mois futurs (estimations) : barres transparentes avec contour pointillé (`strokeDasharray`)
   - Ligne verticale pointillée « Aujourd'hui » séparant passé et futur
   - Légende : Revenus · Dépenses · Prévision
   - Tooltip personnalisé (style dark glass cohérent avec Charts.jsx) affichant montants formatés
   - Mois sur l'axe X, montants sur l'axe Y (formatés avec `useFormatMontant`)

4. **Note d'avertissement** (bas de page)
   - Bandeau info discret : « Les projections sont des estimations basées sur vos habitudes passées. »

5. **État vide** (si moins de 1 mois de données)
   - Composant `EmptyState` : « Pas encore assez de données — ajoutez des transactions pour générer des projections. »

---

## Calcul des projections

### Données réelles vs projetées

- **Mois entièrement passés** (antérieurs au mois courant) : utiliser les transactions réelles de `state.transactions`
- **Mois courant** (en cours) : utiliser les transactions réelles du mois courant
- **Mois futurs** : utiliser la moyenne calculée (voir ci-dessous)

### Algorithme de la moyenne

```
moyenneRevenus  = moyenne des revenus  des N derniers mois complets (N = min(3, moisDisponibles))
moyenneDepenses = moyenne des dépenses des N derniers mois complets (N = min(3, moisDisponibles))
```

- « Mois complet » = tout mois antérieur au mois courant ayant au moins 1 transaction
- Si 0 mois disponibles : retourner 0 (afficher état vide)
- Si 1 ou 2 mois disponibles : utiliser ces mois (pas de minimum strict à 3)
- Les calculs utilisent les fonctions existantes de `src/utils/calculations.js`

### Données retournées par la fonction pure

```js
// src/utils/calculations.js — nouvelle fonction
getProjectionsMensuelles(transactions, horizonMois = 6)
// → Array<{ mois: 'YYYY-MM', revenus: number, depenses: number, estProjection: boolean }>
```

`horizonMois` représente le **nombre total de barres affichées** dans le graphique.
La fenêtre couvre toujours : **2 mois passés** (contexte) + **mois courant** + **(horizonMois − 3) mois futurs**.
Minimum garanti : 1 mois futur, donc horizonMois ≥ 4 est recommandé (les valeurs 3/6/12 du sélecteur respectent cela avec horizonMois effectif = 4/6/12).

Exemple pour horizonMois = 6 en juin 2026 :
`[Avril, Mai, Juin (courant), Juillet, Août, Septembre]` → 2 passés + 1 courant + 3 futurs.

- `estProjection: false` → mois passés et mois courant (données réelles)
- `estProjection: true` → mois futurs (moyenne calculée)

---

## Architecture

### Fichiers modifiés / créés

| Action | Fichier |
|--------|---------|
| **Create** | `src/pages/Projections.jsx` |
| **Modify** | `src/utils/calculations.js` — ajouter `getProjectionsMensuelles` |
| **Modify** | `src/App.jsx` — ajouter route `/projections` |
| **Modify** | `src/components/layout/Sidebar.jsx` — ajouter entrée nav |
| **Modify** | `src/components/layout/BottomNav.jsx` — ajouter entrée nav |

### Navigation

- **Sidebar** (desktop) : entrée « Projections » entre « Graphiques » et « Paramètres »
- **BottomNav** (mobile) : 5ème icône entre Charts et Settings
- **Icône** : `TrendingUp` ou graphe de tendance (SVG inline, cohérent avec les autres icônes)
- **Route** : `/projections`

### État local de la page

```js
const [horizon, setHorizon] = useState(6) // 3 | 6 | 12
```

Pas de persistance dans BudgetContext — l'horizon est une préférence d'affichage volatile.

---

## Comportement

| Situation | Comportement |
|-----------|-------------|
| 0 mois de données | État vide avec message explicatif |
| 1–2 mois de données | Projections calculées sur N mois disponibles, bandeau info |
| 3+ mois de données | Comportement standard, moyenne sur 3 mois |
| Changement d'horizon | Recalcul instantané, KPIs et graphique mis à jour |
| Changement de devise | `useFormatMontant` appliqué partout, pas de logique supplémentaire |
| Mode clair / sombre | CSS vars existants, aucun style dark-hardcodé |

---

## Tests

La fonction `getProjectionsMensuelles` doit être couverte par des tests unitaires Vitest :

- Retourne N entrées pour un horizon de N mois
- Entrées passées ont `estProjection: false` avec données réelles
- Entrées futures ont `estProjection: true` avec la moyenne des 3 derniers mois
- Fonctionne avec 0, 1, 2, 3 mois de données
- Gère les transactions nulles / array vide

---

## Ce qui est hors scope

- Simulation « What If » (curseurs interactifs) — fonctionnalité future distincte
- Projections par catégorie
- Export CSV/PDF des projections
- Persistance de l'horizon sélectionné dans localStorage
