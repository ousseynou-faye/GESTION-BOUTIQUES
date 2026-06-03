# Design Spec — Transactions Récurrentes Auto

**Date :** 2026-06-03
**Projet :** Budget App (React + Vite + Tailwind v4 + localStorage)
**Périmètre :** Génération automatique des transactions récurrentes au lancement de l'app

---

## Contexte

Les transactions peuvent être marquées `recurrente: true` (ajouté en T4). Ce marqueur est aujourd'hui purement visuel (badge). Cette feature le rend fonctionnel : au lancement de l'app, les transactions récurrentes manquantes sont automatiquement créées pour chaque mois écoulé depuis la dernière génération.

---

## Décisions de conception

| Question | Décision |
|----------|----------|
| Déclencheur | Automatique au lancement de l'app (silencieux, zéro friction) |
| Mois manquants | Générer **tous** les mois manquants (pas seulement le mois courant) |
| Date des copies | Même jour que la transaction originale, ajusté si fin de mois courte |
| Suivi des générations | Champ `derniereGeneration: 'YYYY-MM'` sur la transaction originale |

---

## Modèle de données

Un seul champ ajouté sur les transactions récurrentes **originales** :

```js
{
  // champs existants inchangés
  recurrente: true,

  // nouveau champ — seulement sur les originales, pas sur les copies générées
  derniereGeneration: '2026-06',  // format YYYY-MM
}
```

**Règles :**
- À la création d'une transaction `recurrente: true`, le reducer initialise `derniereGeneration` au mois de sa date (`date.slice(0, 7)`)
- Les copies générées automatiquement ont `recurrente: false` — elles ne se re-génèrent pas
- Les transactions récurrentes existantes sans `derniereGeneration` utilisent le mois de leur `date` comme point de départ

---

## Algorithme central — `src/utils/recurrence.js`

### Fonction principale

```js
calculerTransactionsAGenerer(transactions, moisCourant)
// → { nouvelles: Transaction[], majOriginales: {id, derniereGeneration}[] }
```

### Fonctions utilitaires

```js
dateToMois(dateStr)              // '2026-06-05' → '2026-06'
moisEntre(debut, fin)            // ('2026-03', '2026-06') → ['2026-04','2026-05','2026-06']
ajusterJour(moisStr, jour)       // ('2026-02', 31) → '2026-02-28'
```

### Algorithme

```
Pour chaque transaction où recurrente === true :
  lastGen = derniereGeneration ?? dateToMois(date)
  Si lastGen === moisCourant → ignorer (déjà à jour)
  Sinon :
    mois = moisEntre(lastGen, moisCourant)
    Pour chaque mois :
      Créer copie avec mêmes champs + recurrente:false + date ajustée
    Ajouter à majOriginales : { id, derniereGeneration: moisCourant }
```

---

## Intégration — `src/context/BudgetContext.jsx`

### useEffect au lancement

```js
useEffect(() => {
  if (!state.loaded) return
  const moisCourant = format(new Date(), 'yyyy-MM')
  const { nouvelles, majOriginales } = calculerTransactionsAGenerer(
    state.transactions,
    moisCourant
  )
  if (nouvelles.length > 0 || majOriginales.length > 0) {
    dispatch({ type: 'GENERATE_RECURRENTES', payload: { nouvelles, majOriginales } })
  }
}, [state.loaded])
```

### Nouvelle action reducer — `GENERATE_RECURRENTES`

```js
case 'GENERATE_RECURRENTES': {
  const { nouvelles, majOriginales } = action.payload
  const mises = new Map(majOriginales.map(m => [m.id, m.derniereGeneration]))
  return {
    ...state,
    transactions: [
      ...nouvelles,
      ...state.transactions.map(t =>
        mises.has(t.id) ? { ...t, derniereGeneration: mises.get(t.id) } : t
      ),
    ],
  }
}
```

### Modification ADD_TRANSACTION

```js
case 'ADD_TRANSACTION': {
  const t = { ...action.payload, id: makeId('txn'), createdAt: Date.now() }
  if (t.recurrente) t.derniereGeneration = t.date.slice(0, 7)
  return { ...state, transactions: [t, ...state.transactions] }
}
```

---

## Tests — `src/utils/recurrence.test.js`

| Cas | Comportement attendu |
|-----|---------------------|
| `derniereGeneration` === mois courant | Aucune copie générée |
| 3 mois de retard | 3 copies créées avec les bonnes dates |
| Jour 31 en février | Date ajustée au 28 (ou 29 en bissextile) |
| Transaction sans `derniereGeneration` | Utilise le mois de `date` comme point de départ |

---

## Fichiers modifiés / créés

| Fichier | Action |
|---------|--------|
| `src/utils/recurrence.js` | **Créer** |
| `src/utils/recurrence.test.js` | **Créer** |
| `src/reducers/budgetReducer.js` | **Modifier** — `GENERATE_RECURRENTES` + `ADD_TRANSACTION` |
| `src/context/BudgetContext.jsx` | **Modifier** — `useEffect` génération |

---

## Hors périmètre

- Interface utilisateur pour gérer les récurrentes (liste, skip mensuel)
- Modification du montant avant génération
- Notification visuelle après génération
- Périodicité autre que mensuelle (hebdo, annuelle)
