# Design Spec — Transactions Enrichies

**Date :** 2026-06-03  
**Projet :** Budget App (React + Vite + Tailwind v4 + localStorage)  
**Périmètre :** 5 fonctionnalités court-terme sur la page Transactions

---

## 1. Modèle de données

### Transaction — champs ajoutés

```js
{
  // champs existants (inchangés)
  id:          string,
  type:        'revenu' | 'depense',
  montant:     number,
  description: string,
  categorie:   string,
  date:        string, // YYYY-MM-DD

  // nouveaux champs optionnels
  note:        string | null,   // texte libre, max 500 chars, défaut null
  recurrente:  boolean,         // marqueur visuel, défaut false
}
```

**Rétrocompatibilité :** les transactions existantes sans ces champs fonctionnent normalement. Partout où on lit ces champs on utilise `t.note ?? null` et `t.recurrente ?? false`.

Le reducer (`budgetReducer.js`) n'a pas besoin de modification : `ADD_TRANSACTION` et `UPDATE_TRANSACTION` passent déjà l'objet entier en payload.

---

## 2. Recherche par texte

### Localisation
Dans le panneau "Filtres" existant de `Transactions.jsx`, entre les filtres actuels et le bouton "Réinitialiser".

### État ajouté
```js
const [recherche, setRecherche] = useState('')
```

### Logique de filtrage (ajout dans le useMemo existant)
```js
if (recherche.trim())
  list = list.filter(t =>
    t.description.toLowerCase().includes(recherche.toLowerCase())
  )
```

### UI
- Input texte avec icône loupe, placeholder "Rechercher une transaction…"
- Si non vide : chip actif "🔍 texte" dans la liste des filtres actifs
- Le bouton "Réinitialiser" efface aussi le champ recherche
- Aucun nouveau composant — tout dans `Transactions.jsx`

---

## 3. Export / Import CSV

### Fichier utilitaire : `src/utils/csv.js`

```js
// Colonnes (ordre fixe, première ligne = en-têtes)
// id | type | montant | description | categorie | date | note | recurrente

exporterCSV(transactions: Transaction[]) → void
// Crée un Blob CSV UTF-8 avec BOM, déclenche téléchargement
// Nom de fichier : "transactions_YYYY-MM-DD.csv"
// Exporte les transactions passées en paramètre (respecte les filtres actifs)

importerCSV(file: File) → Promise<{ valides: Transaction[], erreurs: string[] }>
// Parse le fichier CSV ligne par ligne
// Validation de chaque ligne :
//   - type doit être 'revenu' ou 'depense'
//   - montant doit être un nombre > 0
//   - date doit être au format YYYY-MM-DD
//   - categorie doit exister dans CATEGORIES
// Les lignes invalides sont collectées dans erreurs[] avec numéro de ligne + raison
// Les transactions importées reçoivent de nouveaux IDs (pas d'écrasement de l'existant)
// note et recurrente sont optionnels dans le CSV (défaut null / false si absents)
```

### Composant : `src/components/transactions/CSVActions.jsx`

Deux boutons dans le header de `Transactions.jsx`, entre le titre et le bouton "+ Nouvelle transaction" :

```
[ ↓ Export CSV ]  [ ↑ Import CSV ]  [ + Nouvelle transaction ]
```

**Export :**
- Appelle `exporterCSV(filtered)` — exporte les transactions filtrées
- Aucun modal nécessaire

**Import :**
- `<input type="file" accept=".csv" hidden>` déclenché au clic
- Après parsing : modal de confirmation avec résumé :
  - "X transactions valides trouvées"
  - Si erreurs : "Y lignes ignorées" avec liste des erreurs
  - Boutons : "Annuler" / "Importer X transactions"
- Dispatch `ADD_TRANSACTION` pour chaque transaction valide

---

## 4. Récurrence (marqueur visuel)

### Dans `TransactionForm.jsx`
Checkbox simple en bas du formulaire, avant les boutons d'action :

```
[ ↻ ] Transaction récurrente  (loyer, salaire, abonnement…)
```

Lie le champ `recurrente` du formulaire.

### Dans `TransactionItem.jsx`
Si `recurrente: true`, badge discret à côté du badge catégorie :

```
[Alimentation]  [↻ Récurrente]  · 3 juin
```

Style du badge : même style que Badge catégorie mais avec couleur neutre (indigo/slate).

---

## 5. Notes (texte uniquement)

### Dans `TransactionForm.jsx`
Textarea optionnel, juste avant la section récurrence :

```
Note  (optionnel)
[ Ajouter un commentaire, référence, contexte…     ]
                                          0 / 500
```

- `maxLength={500}`, compteur de caractères affiché en bas à droite
- Non obligatoire, clairement labelisé "optionnel"
- Lie le champ `note` du formulaire

### Dans `TransactionItem.jsx`
Si `note` existe et non vide, affichée sous la description + badges :

```
  Salaire janvier
  [Revenus]  [↻ Récurrente]  · 1 juin
  📝 Virement reçu le 1er, net après cotisations
```

- Texte petit (`text-[11px]`), couleur atténuée (`rgba(100,116,139,0.7)`)
- Icône 📝 ou SVG crayon discret
- Tronqué à 2 lignes (`line-clamp-2`) pour ne pas surcharger la liste

---

## Fichiers modifiés / créés

| Fichier | Action |
|---|---|
| `src/utils/csv.js` | **Créer** |
| `src/components/transactions/CSVActions.jsx` | **Créer** |
| `src/components/transactions/TransactionForm.jsx` | Modifier (note + récurrence) |
| `src/components/transactions/TransactionItem.jsx` | Modifier (note + badge récurrence) |
| `src/pages/Transactions.jsx` | Modifier (recherche + CSVActions) |

---

## Hors périmètre

- Photos / pièces jointes (risque localStorage)
- Génération automatique des transactions récurrentes
- Import de formats bancaires externes
- Recherche globale multi-pages
