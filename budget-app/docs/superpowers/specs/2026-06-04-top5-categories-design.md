# Design Spec — Top 5 Catégories du Mois (Dashboard)

**Date :** 2026-06-04
**Projet :** Budget App (React + Vite + Tailwind v4 + localStorage)
**Périmètre :** Ajouter une section "Top 5 dépenses du mois" dans le Dashboard, avec évolution vs mois précédent

---

## Contexte

Le Dashboard affiche déjà des KPI globaux et des graphiques. Il manque une vue rapide des catégories où l'on dépense le plus ce mois-ci, avec une indication de tendance (hausse/baisse vs mois précédent). Cette section se place entre les KPI cards et les graphiques existants.

---

## Décisions de conception

| Question | Décision |
|----------|----------|
| Contenu | Top 5 catégories de dépenses du mois courant |
| Placement | Sous les KPI cards, avant les graphiques |
| Évolution | Montant + flèche % vs mois précédent (`null` si pas de données) |
| Revenus inclus ? | Non — dépenses uniquement |
| Nouveau fichier ? | Non — fonction dans `calculations.js`, composant dans `Dashboard.jsx` |

---

## Section 1 — Données

### Nouvelle fonction : `getTop5Categories`

**Fichier :** `src/utils/calculations.js`

```js
getTop5Categories(transactions, moisCourant, moisPrecedent)
```

**Retour :**
```js
[
  {
    categorie: 'alimentation',       // clé de CATEGORIES
    label: 'Alimentation',           // CATEGORIES[categorie].label
    couleur: '#f59e0b',              // CATEGORIES[categorie].couleur
    montantCourant: 45000,           // total dépenses mois courant
    montantPrecedent: 40000,         // total dépenses mois précédent (0 si absent)
    evolution: 12.5,                 // % relatif — null si montantPrecedent === 0
    pourcentage: 38.2,               // % du total dépenses mois courant
  },
  // … max 5 entrées, triées par montantCourant décroissant
]
```

**Logique :**
1. Filtrer les transactions de type `'depense'` du mois courant
2. Grouper par `categorie`, sommer les montants → `montantCourant`
3. Faire de même pour le mois précédent → `montantPrecedent`
4. Calculer `evolution = montantPrecedent > 0 ? ((montantCourant - montantPrecedent) / montantPrecedent) * 100 : null`
5. Calculer `pourcentage = (montantCourant / totalDepensesMois) * 100`
6. Trier par `montantCourant` décroissant, garder les 5 premiers

---

## Section 2 — Composant `TopCategories`

Composant interne dans `Dashboard.jsx` (non exporté).

### Structure visuelle par ligne

```
● Alimentation    45 000 F CFA    ↑ +12.5%    ████████░░  38%
● Loyer           50 000 F CFA    →  =         ██████████  45%
● Transport       12 000 F CFA    ↓  -5.2%    ███░░░░░░░  11%
● Loisirs          8 000 F CFA    —            ██░░░░░░░░   7%
● Abonnements      5 000 F CFA    ↑  +3.1%    █░░░░░░░░░   5%
```

### Indicateurs d'évolution

| Condition | Affichage | Couleur |
|-----------|-----------|---------|
| `evolution > 0` | `↑ +X.X%` | `#34d399` (vert) |
| `evolution < 0` | `↓ -X.X%` | `#fb7185` (rouge) |
| `evolution === 0` | `→ =` | `rgba(148,163,184,0.7)` (neutre) |
| `evolution === null` | `—` | `rgba(100,116,139,0.5)` (grisé) |

### Style

- Même dark glass que le reste du Dashboard : `background: '#0b0e1c'`, `border: 1px solid rgba(255,255,255,0.06)`
- Titre : `TOP 5 DÉPENSES — [MOIS ANNÉE]` en font-display uppercase
- Barre de progression : `width = pourcentage%`, couleur de la catégorie, fond semi-transparent
- État vide : composant `EmptyState` avec message "Aucune dépense enregistrée ce mois-ci"

---

## Section 3 — Intégration dans `Dashboard.jsx`

### Placement dans le JSX

```
KPI Cards          ← existant
TOP 5 CATÉGORIES   ← NOUVEAU
Graphiques         ← existant
Progression budgets← existant
Dernières txns     ← existant
```

### Calcul des données

```js
const moisPrecedent = format(subMonths(new Date(), 1), 'yyyy-MM')
const top5 = useMemo(
  () => getTop5Categories(state.transactions, state.settings.moisCourant, moisPrecedent),
  [state.transactions, state.settings.moisCourant]
)
```

`subMonths` et `format` sont déjà importés depuis `date-fns` dans Dashboard.jsx.

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/utils/calculations.js` | Ajouter `getTop5Categories` |
| `src/pages/Dashboard.jsx` | Ajouter composant `TopCategories` + intégration JSX |

---

## Hors périmètre

- Sélecteur de mois (le mois courant vient de `settings.moisCourant`)
- Affichage des revenus par catégorie
- Drill-down vers les transactions d'une catégorie
- Top N configurable (fixé à 5)
