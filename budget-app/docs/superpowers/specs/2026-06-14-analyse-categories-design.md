# R8 — Page Analyse · Tendances par catégorie

**Date :** 2026-06-14  
**Statut :** Approuvé

## Résumé

Nouvelle page dédiée `/analyse` affichant l'évolution mensuelle des dépenses ou revenus par catégorie sur un horizon de 3, 6 ou 12 mois. L'utilisateur sélectionne un mode (Dépenses / Revenus), choisit une catégorie via des pills, et voit un AreaChart de la tendance avec KPIs et barre budget contextuelle.

---

## Fonctionnalité

### Ce que l'utilisateur voit

Une page complète avec :

1. **Banner**
   - Titre « Analyse » + sous-titre « Tendances par catégorie · évolution mensuelle »
   - **Sélecteur d'horizon** : 3 boutons toggle `3 mois / 6 mois / 12 mois` aligné à droite — défaut 6 mois (cohérent avec Projections)
   - **Toggle Dépenses / Revenus** : switche le groupe de catégories affiché
   - **Pills de catégories** : une pill par catégorie ayant au moins une transaction sur la période — la catégorie active est mise en valeur avec la couleur hexadécimale issue de `CATEGORIES` (ex. `rgba(couleur, 0.75)` en fond) ; les autres sont neutres (fond `rgba(255,255,255,0.05)`)

2. **3 KPI tiles** (sous le banner, avant le graphique)
   - **Total période** (couleur catégorie) — somme sur l'horizon sélectionné ; sous-titre : nom de la catégorie
   - **Moyenne / mois** (indigo) — total ÷ nombre de mois sur la période ; sous-titre : « sur N mois »
   - **vs mois précédent** (vert si baisse dépense / rouge si hausse dépense, inversé pour revenus) — pourcentage de variation ; sous-titre : « X → Y F CFA »

3. **Barre budget** (conditionnelle)
   - Visible uniquement si un budget existe pour la catégorie sélectionnée **et** que le mode est Dépenses
   - Affiche : label « Budget [Catégorie] — [Mois courant] », montant dépensé / budget total · %, barre de progression dégradée (vert → orange → rouge selon %)
   - Sous la barre : « Reste : X F CFA » à droite
   - Masquée si aucun budget défini pour cette catégorie ou si mode = Revenus

4. **AreaChart** (Recharts `AreaChart`)
   - Légende : ligne colorée catégorie + ligne pointillée indigo « Moyenne »
   - Aire dégradée sous la courbe (couleur hexadécimale de la catégorie issue de `CATEGORIES`, opacité 28% → 3%)
   - Ligne de moyenne horizontale pointillée indigo avec label « moy. X F »
   - Point lumineux (glow) sur le mois courant
   - Axe X : mois abrégés FR, mois courant en indigo gras
   - Axe Y : montants formatés `useFormatMontant` (ex. `80k`)
   - Tooltip dark glass cohérent avec Charts.jsx et Projections.jsx

5. **Note informative** (bas de page)
   - Bandeau discret : « La barre budget n'apparaît que si un budget est défini pour cette catégorie ce mois-ci. »

6. **État vide** (si aucune catégorie avec transactions)
   - Composant `EmptyState` : « Aucune transaction trouvée — ajoutez des transactions pour voir les tendances. »

---

## Calculs

### Nouvelles fonctions pures — `src/utils/calculations.js`

```js
getEvolutionCategorie(transactions, categorie, horizonMois = 6)
// → Array<{ mois: 'YYYY-MM', montant: number }>
// Retourne un tableau de N entrées (N = horizonMois) couvrant les N derniers mois
// jusqu'au mois courant inclus.
// montant = somme des transactions de la catégorie pour ce mois (0 si aucune).
```

```js
getKpiCategorie(transactions, categorie, horizonMois = 6)
// → { total: number, moyenne: number, variationPct: number | null,
//     montantMoisCourant: number, montantMoisPrecedent: number }
// variationPct = null si moisPrecedent = 0 (évite division par zéro)
```

### Catégories disponibles

- Calculées dynamiquement : parmi les 18 catégories de `CATEGORIES`, ne garder que celles ayant **au moins une transaction** sur la période (`horizonMois` derniers mois).
- Séparées par type : `type === 'depense'` pour le mode Dépenses, `type === 'revenu'` pour Revenus.
- Si aucune catégorie disponible pour le mode actif → afficher `EmptyState`.

### Catégorie active par défaut

Au premier rendu (et lors d'un changement de mode), `categorieActive` est initialisée à la première catégorie disponible triée par montant total décroissant (la plus dépensée / la plus perçue).

---

## Architecture

### Fichiers modifiés / créés

| Action | Fichier |
|--------|---------|
| **Créer** | `src/pages/Analyse.jsx` |
| **Modifier** | `src/utils/calculations.js` — ajouter `getEvolutionCategorie` + `getKpiCategorie` |
| **Modifier** | `src/utils/calculations.test.js` — tests des deux fonctions |
| **Modifier** | `src/App.jsx` — ajouter route `/analyse` |
| **Modifier** | `src/components/layout/Sidebar.jsx` — ajouter entrée nav |

### Navigation

- **Sidebar desktop uniquement** — entrée « Analyse » entre « Projections » et « Paramètres »
- **Icône** : `BarChart2` ou `TrendingUp` (SVG inline cohérent avec les autres entrées)
- **Route** : `/analyse`
- **BottomNav mobile** : non modifié

### État local de la page

```js
const [mode, setMode]                   = useState('depense')   // 'depense' | 'revenu'
const [categorieActive, setCategorieActive] = useState(null)    // string | null
const [horizon, setHorizon]             = useState(6)           // 3 | 6 | 12
```

Pas de persistance dans BudgetContext — préférences d'affichage volatiles.

---

## Comportement

| Situation | Comportement |
|-----------|-------------|
| Changement d'horizon | Recalcul instantané via `useMemo`, catégorie active conservée si elle reste disponible, sinon reset à la première disponible |
| Changement de mode | Reset `categorieActive` à la première catégorie disponible du nouveau mode |
| Catégorie sans budget | Barre budget masquée, pas d'espace vide |
| Mode Revenus sélectionné | Barre budget toujours masquée (pas de budget revenus dans l'app) |
| 0 transaction sur la période | `montant: 0` dans `getEvolutionCategorie`, catégorie exclue des pills |
| Changement de devise | `useFormatMontant` appliqué partout, aucune logique supplémentaire |
| Mode clair / sombre | CSS vars existants, aucun style dark hardcodé |

---

## Tests

Les fonctions `getEvolutionCategorie` et `getKpiCategorie` doivent être couvertes par des tests Vitest :

**`getEvolutionCategorie`**
- Retourne exactement N entrées pour un horizon de N mois
- Entrées sans transaction ont `montant: 0`
- Filtre correctement par catégorie
- Gère un tableau de transactions vide
- Mois triés chronologiquement

**`getKpiCategorie`**
- `total` = somme correcte sur la période
- `moyenne` = total ÷ horizonMois
- `variationPct` = null si mois précédent = 0
- `variationPct` correct avec données réelles
- Gère catégorie inexistante (retourne tout à 0)

---

## Ce qui est hors scope

- Comparaison de deux catégories sur le même graphique
- Export CSV / PDF des tendances par catégorie
- Drill-down vers la liste des transactions de la catégorie
- Annotations manuelles sur le graphique
- Prévisions futures par catégorie (intégration avec Projections)
