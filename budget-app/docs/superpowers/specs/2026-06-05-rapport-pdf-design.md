# Spec — Rapport Mensuel PDF

**Date :** 2026-06-05  
**Statut :** Approuvé  
**Feature :** R1 — Rapport mensuel PDF

---

## Résumé

Ajouter un bouton "Exporter PDF" dans le header du Dashboard qui génère et télécharge un rapport PDF complet du mois courant. Le rapport utilise `@react-pdf/renderer` pour produire un document vectoriel blanc/professionnel.

---

## Approche retenue

**Approche A — Composant PDF isolé dans `src/components/pdf/`**

Le code PDF est entièrement séparé de l'UI React normale. `Dashboard.jsx` appelle une fonction utilitaire qui génère le blob et déclenche le téléchargement.

---

## Fichiers

### Nouveaux fichiers

| Fichier | Rôle |
|---------|------|
| `src/components/pdf/RapportMensuel.jsx` | Composant `@react-pdf/renderer` — `<Document>` complet avec toutes les sections |
| `src/components/pdf/pdfUtils.js` | Fonction `downloadPdf(data)` — génère le blob + déclenche le téléchargement |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/pages/Dashboard.jsx` | Ajout du bouton "Exporter PDF" dans le header, à droite du `MonthSelector` |
| `package.json` | Ajout de la dépendance `@react-pdf/renderer` |

---

## Contenu du PDF

**Nom du fichier :** `budget-pro-{mois}.pdf` (ex. `budget-pro-2026-06.pdf`)  
**Style :** Fond blanc, texte sombre, propre à imprimer

### Structure du document

1. **En-tête**
   - Logo texte "Budget Pro" (grand, gras)
   - Mois en grand (ex. "Juin 2026")
   - Date de génération en petit (ex. "Généré le 5 juin 2026")

2. **Section KPIs — 4 blocs côte à côte**
   - Revenus du mois (vert)
   - Dépenses du mois (rouge)
   - Solde net (bleu si positif, orange si négatif)
   - Taux d'épargne (orange)
   - Source : `getTotalRevenus()`, `getTotalDepenses()`, `getSoldeNet()`, `getTauxEpargne()`

3. **Section Top 5 dépenses**
   - Tableau : Rang · Catégorie · Montant · % du total dépenses
   - Source : `getTop5Categories(transactions, mois, moisPrecedent)`

4. **Section État des budgets**
   - Tableau : Catégorie · Budget mensuel · Dépensé · % · Statut (✓ OK / ⚠ Proche / ✗ Dépassé)
   - Affiché uniquement si des budgets existent pour ce mois
   - Source : `getProgressionBudgets(transactions, budgets, mois)`

5. **Section Objectifs d'épargne**
   - Tableau : Nom · Montant actuel · Montant cible · % progression · Statut
   - Affiché uniquement si des objectifs existent
   - Source : `getObjectifProgression(goal)` pour chaque objectif

6. **Section Transactions du mois**
   - Tableau complet : Date · Description · Catégorie · Type · Montant
   - Triées par date décroissante
   - Source : `transactions.filter(t => t.date?.startsWith(mois))`

7. **Pied de page** (sur chaque page)
   - "Généré par Budget Pro le [date]" — centré

---

## Bouton Dashboard

**Emplacement :** Header du Dashboard, à droite du `MonthSelector`  
**Style :** `.btn-secondary` (fond transparent + border, style existant du design system)  
**Icône :** SVG téléchargement (↓)

### États

| État | Texte affiché | Comportement |
|------|--------------|-------------|
| Normal | "⬇ Exporter PDF" | Cliquable |
| Chargement | "Génération..." + spinner | Désactivé (`disabled`) |
| Erreur | — | `alert("Erreur lors de la génération du PDF")` |

---

## Données transmises au composant PDF

Toutes extraites du `BudgetContext` déjà disponible dans `Dashboard.jsx` :

```js
{
  mois,         // '2026-06' — contrôle toutes les sections
  transactions, // toutes les transactions (filtrage fait dans RapportMensuel)
  budgets,      // tous les budgets (filtrage sur mois fait dans RapportMensuel)
  goals,        // tous les objectifs d'épargne
}
```

---

## Fonctions de calcul réutilisées

Toutes importées depuis `@/utils/calculations` et `@/utils/formatters` — aucune nouvelle fonction de calcul.

| Fonction | Usage dans le PDF |
|----------|------------------|
| `getTotalRevenus(transactions, mois)` | Section KPIs |
| `getTotalDepenses(transactions, mois)` | Section KPIs |
| `getSoldeNet(transactions, mois)` | Section KPIs |
| `getTauxEpargne(transactions, mois)` | Section KPIs |
| `getTop5Categories(transactions, mois, moisPrecedent)` | Section Top 5 |
| `getProgressionBudgets(transactions, budgets, mois)` | Section Budgets |
| `getObjectifProgression(goal)` | Section Objectifs |
| `formatMontant(montant)` | Tous les montants |
| `formatMois(mois)` | En-tête |
| `formatDate(date, format)` | Colonne date des transactions |

---

## Tests

Pas de nouveaux tests unitaires — `RapportMensuel.jsx` est du JSX déclaratif sans logique propre. Les fonctions de calcul réutilisées sont déjà couvertes dans `calculations.test.js`.

**Test manuel (golden path) :**
1. Cliquer "Exporter PDF" sur le Dashboard → un fichier `budget-pro-YYYY-MM.pdf` se télécharge
2. Le PDF s'ouvre et affiche les bonnes données du mois sélectionné
3. Changer de mois avec `MonthSelector` → exporter à nouveau → le PDF reflète le nouveau mois
4. Tester avec un mois sans transactions → les sections s'affichent vides proprement

---

## Contraintes techniques

- `@react-pdf/renderer` n'est pas compatible avec Tailwind CSS — les styles du PDF utilisent `StyleSheet.create()` propre à la librairie
- Les polices `Bricolage Grotesque` / `DM Sans` ne sont pas disponibles dans `@react-pdf/renderer` sans enregistrement explicite — utiliser `Helvetica` (police intégrée) pour le PDF blanc professionnel
- `pdf().toBlob()` est asynchrone — le bouton doit afficher un état de chargement pendant la génération
