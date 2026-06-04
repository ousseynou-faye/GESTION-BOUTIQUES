# Design Spec — Évolution Premium : Budget Pro

**Date :** 2026-06-04  
**Approche choisie :** Évolution Premium (Approche 2) — améliorer sans changer l'esprit  
**Contrainte principale :** Garder le style Dark Premium actuel, aucune rupture structurelle  
**Devise :** F CFA (Franc CFA)  
**Stack :** React 18 + Vite + Tailwind v4 (plugin mode) + Recharts

---

## Contexte

Budget Pro est une application de gestion budgétaire en React avec un design Dark Premium (fond très sombre `#06071a`, palette indigo/violet, effets lumineux). Le design actuel est apprécié — l'objectif est de l'améliorer sur 6 zones sans le casser : navigation, KPI cards, formulaires, transactions, objectifs, graphiques.

---

## Section 1 — Navigation : Sidebar & TopBar mobile

### 1A — Sidebar (desktop)

**Problème identifié :** Le logo est une icône d'horloge SVG — ne représente pas une application finance.

**Solution :** Remplacer l'icône horloge par une icône wallet/portefeuille SVG. Même dimensions, même couleur indigo, même emplacement. Aucun autre changement structurel à la sidebar.

**Code à modifier :** `src/components/layout/Sidebar.jsx` — icône dans le bloc logo (début du composant).

### 1B — TopBar mobile

**Problème identifié :** La TopBar mobile affiche uniquement le titre de la page et le bouton menu — aucune information financière contextuelle.

**Solution :** Ajouter une bande contextuelle sous la TopBar principale (visible uniquement sur mobile, uniquement sur la page Dashboard) affichant :
- Solde actuel (couleur indigo/blanc)
- Épargne du mois (couleur verte)

La bande est fine (environ 36px de hauteur), fond `rgba(129,140,248,0.06)`, bordure bas subtile. Elle utilise les données du BudgetContext.

**Code à modifier :** `src/components/layout/TopBar.jsx`

---

## Section 2 — Dashboard : KPI Cards avec Sparklines

### 2A — KPI Cards

**Problème identifié :** Les 4 KPI cards (Revenus, Dépenses, Solde, Épargne) affichent uniquement la valeur du mois courant — aucune indication de tendance.

**Solution :** Chaque KPI card reçoit deux ajouts visuels :

1. **Badge de tendance** (↑↓ %) en haut à droite : compare la valeur du mois courant avec le mois précédent. Vert avec ↑ si meilleur, rouge avec ↓ si moins bon (selon le type de KPI : pour les dépenses, ↓ est positif).

2. **Mini sparkline** (courbe SVG 6 mois) en bas de la card : tracé simple `polyline` calculé à partir de `getDonnees12Mois()`. Hauteur ~28px, pas d'axes, ligne colorée avec la couleur de la card.

**Calculs nécessaires :** Nouvelle fonction `getKpiTendance(transactions, moisCourant)` dans `calculations.js` qui retourne pour chaque KPI : valeur mois courant, valeur mois précédent, pourcentage de variation, et tableau de 6 valeurs pour la sparkline.

**Code à modifier :**
- `src/utils/calculations.js` — ajouter `getKpiTendance()`
- `src/pages/Dashboard.jsx` — modifier le composant `KPICard` pour accepter `sparkData` et `tendance`

### 2B — Sélecteur de mois du Dashboard

**Problème identifié :** Le sélecteur de mois est affiché comme un badge isolé (`TodayBadge`) sans hiérarchie claire avec le header.

**Solution :** Intégrer le sélecteur de mois directement dans le header du Dashboard, sur la même ligne que le titre "Dashboard", aligné à droite. Le sélecteur garde la même fonctionnalité (`SET_MONTH` dispatch) mais son style devient plus élégant : fond `rgba(255,255,255,0.04)`, bordure subtile, chevron `<` `>`, affichage "Juin 2026" formaté.

**Code à modifier :** `src/pages/Dashboard.jsx` — en-tête de page.

---

## Section 3 — Formulaire Transaction en 2 étapes

### 3A — TransactionForm (modal)

**Problème identifié :** Le formulaire est un long scroll unique. Les montants rapides (500, 1000, 2000… F CFA) sont inadaptés à la réalité économique en F CFA. Le flux manque de guidage.

**Solution :** Restructurer le formulaire en **2 étapes visuelles** dans le même modal :

**Étape 1 — Montant :**
- Header coloré selon le type (rouge pour dépense, vert pour revenu) avec indicateur d'étapes "1/2"
- Toggle type (Dépense / Revenu) conservé
- Input montant grand format (36px, couleur du type)
- 8 montants rapides adaptés F CFA : `5 000 / 10 000 / 50 000 / 100 000 / 200 000 / 500 000 / 1 000 000 / Autre`
- Bouton "Suivant → Détails" actif seulement si montant > 0

**Étape 2 — Détails :**
- Header récapitulatif "Dépense — 50 000 F CFA" + indicateur "✓ Montant → 2 Détails"
- Catégorie pills (inchangé)
- Description + Date (grid 2 colonnes, inchangé)
- Note textarea (inchangé)
- Checkbox récurrente (style amélioré : fond coloré visible)
- Boutons : "← Retour" (secondary) + "Ajouter la dépense" (primary, couleur du type)

**État local :** Ajouter `const [etape, setEtape] = useState(1)` dans `TransactionForm`. Réinitialiser à 1 à l'ouverture du modal.

**Code à modifier :** `src/components/transactions/TransactionForm.jsx`

### 3B — TransactionItem

**Problème identifié :** Les boutons modifier/supprimer ont `opacity: 0` au repos — invisibles, mauvaise UX.

**Solution :** Passer à `opacity: 0.5` au repos (toujours visibles, juste atténués) et `opacity: 1` au survol. Ajouter un léger `text-shadow` glow sur les montants (rouge pour dépenses, vert pour revenus).

**Code à modifier :** `src/components/transactions/TransactionItem.jsx`

---

## Section 4A — GoalCard : Milestones & État motivant

**Problème identifié :** La GoalCard est solide mais manque de dimension motivationnelle (pas de jalons visuels, aucune indication d'état).

**Solution :** 3 ajouts ciblés sur `GoalCard` :

1. **Marqueurs de milestones** sur la barre de progression : traits verticaux blancs semi-transparents à 25%, 50%, 75% avec micro-labels en dessous. Le marqueur du prochain palier non encore atteint est légèrement plus visible.

2. **Badge d'état** dans le header de la card (à côté du nom) selon le pourcentage :
   - 0–20% → `🌱 Démarrage` (orange)
   - 21–74% → `💪 En cours` (indigo)
   - 75–99% → `🔥 Presque !` (ambre/gold, légère animation pulse)
   - 100% → `✓ Atteint !` (vert) — déjà existant, à harmoniser

3. **Message contextuel** sous la description : "🎯 Prochain palier à X% — encore Y F CFA"  
   Calculé dynamiquement depuis le pourcentage courant vers le prochain multiple de 25%.

**Code à modifier :** `src/pages/Goals.jsx` — composant `GoalCard` + fonction utilitaire locale `getEtatObjectif(pct)`.

---

## Section 4B — Charts : Header Snapshot

**Problème identifié :** La page Graphiques commence directement avec les tabs — aucun résumé financier global visible avant de naviguer dans les onglets.

**Solution :** Ajouter une rangée de 4 mini-stats entre le header (`h1`) et les tab buttons :

| Stat | Couleur | Source de données |
|------|---------|-------------------|
| Dépenses ce mois | Rouge `#fb7185` | `totalDepensesMois` (déjà calculé) |
| Revenus 12 mois | Vert `#34d399` | `totalRevenus12` (déjà calculé) |
| Solde actuel | Indigo `#818cf8` | `soldeActuel` (déjà calculé) |
| Épargne nette | Orange/vert selon signe | `totalRevenus12 - totalDepenses12` |

La rangée est un `div` grid 4 colonnes, fond `rgba(255,255,255,0.025)`, bordure subtile, border-radius 14px. Utilise les variables déjà disponibles dans le composant — aucun nouveau calcul.

**Code à modifier :** `src/pages/Charts.jsx` — section entre `<div>` header et `<div>` tabs.

---

## Section 4C — Cohérence UI : Système de composants

**Problème identifié :** Styles inline répétitifs et incohérents pour boutons, badges et inputs à travers tous les fichiers.

**Solution :** Ajouter des classes utilitaires dans `src/index.css` (en `@layer components`) :

### Boutons
```css
.btn-primary   /* gradient indigo, shadow indigo */
.btn-secondary /* transparent + border, hover léger */
.btn-danger    /* fond rouge très atténué, texte rouge, hover plus opaque */
.btn-icon      /* carré 36px, icône seule, hover rond */
```

### Badges
```css
.badge-cat     /* badge catégorie : dot coloré + fond très atténué */
.badge-ok      /* vert */
.badge-warn    /* orange */
.badge-over    /* rouge */
.badge-recur   /* violet - récurrente */
```

### Inputs
Définir les variables `--input-bg`, `--input-border`, `--input-focus-ring` dans `@theme` pour une utilisation cohérente via `style` ou classes. Le pattern de focus (`onFocus`/`onBlur` inline) est conservé dans les composants mais les valeurs de base sont tokenisées.

**Priorité :** Les tokens CSS sont ajoutés. La refactorisation des composants existants se fait progressivement (TransactionForm et GoalForm en priorité, qui sont les plus volumineux).

**Code à modifier :** `src/index.css`

---

## Ce qui ne change PAS

- Structure des pages et routing
- Layout des grilles (dashboard grid, transactions list groupée, budgets)
- BudgetContext, reducers, localStorage
- Recharts (PieChart, BarChart, AreaChart) — aucun changement aux graphiques eux-mêmes
- Page Budgets (déjà bien conçue)
- Page Transactions (filtres, pagination, CSV)
- Tous les calculs dans `calculations.js` sauf l'ajout de `getKpiTendance()`
- Dark mode toggle
- Responsive breakpoints existants

---

## Ordre d'implémentation recommandé

1. `src/index.css` — tokens CSS + classes utilitaires (fondation)
2. `src/utils/calculations.js` — ajouter `getKpiTendance()`
3. `src/components/layout/Sidebar.jsx` — icône wallet
4. `src/components/layout/TopBar.jsx` — bande contextuelle mobile
5. `src/pages/Dashboard.jsx` — KPI cards sparklines + sélecteur mois intégré
6. `src/components/transactions/TransactionForm.jsx` — formulaire 2 étapes + montants F CFA
7. `src/components/transactions/TransactionItem.jsx` — boutons opacity + glow montants
8. `src/pages/Goals.jsx` — GoalCard milestones + badges état
9. `src/pages/Charts.jsx` — header snapshot row

---

## Critères de succès

- L'application démarre sans erreur (`npm run dev`)
- Toutes les pages sont fonctionnelles (CRUD transactions, budgets, objectifs)
- Les sparklines s'affichent correctement même avec 0 ou 1 transaction
- Le formulaire 2 étapes se réinitialise correctement à l'ouverture
- Les boutons de TransactionItem sont visibles (opacity ≥ 0.5) au repos
- L'icône sidebar est un wallet, pas une horloge
- Le design reste Dark Premium — aucune couleur claire intempestive
