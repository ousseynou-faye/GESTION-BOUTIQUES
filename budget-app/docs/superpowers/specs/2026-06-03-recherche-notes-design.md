# Design Spec — Recherche dans les notes

**Date :** 2026-06-03
**Projet :** Budget App (React + Vite + Tailwind v4 + localStorage)
**Périmètre :** Étendre la recherche texte pour couvrir le champ `note` en plus de `description`

---

## Contexte

La page Transactions dispose d'une barre de recherche texte (ajoutée en T6) qui filtre les transactions par `description`. Les transactions possèdent également un champ `note` (ajouté en T4). La recherche ne couvre pas ce champ — un utilisateur qui cherche "Wave" ne trouve pas une transaction dont la description est "Virement" mais la note est "Reçu via Wave".

---

## Décisions de conception

- **Logique de filtrage :** OR — la transaction apparaît si `description` OU `note` contient le terme recherché
- **Comportement visuel :** Silencieux — aucune indication visuelle supplémentaire quand le match vient de la note
- **Chip de filtre actif :** Inchangé — affiche le texte entre guillemets, comme avant
- **Nouveau composant :** Aucun
- **Nouveau fichier :** Aucun

---

## Changement

### `src/pages/Transactions.jsx` — ligne 46

**Avant :**
```js
if (recherche.trim()) list = list.filter(t =>
  t.description.toLowerCase().includes(recherche.toLowerCase())
)
```

**Après :**
```js
if (recherche.trim()) list = list.filter(t => {
  const q = recherche.toLowerCase()
  return t.description.toLowerCase().includes(q)
    || (t.note && t.note.toLowerCase().includes(q))
})
```

Le guard `t.note &&` protège contre les valeurs `null` ou `undefined` des transactions existantes.

---

## Hors périmètre

- Surbrillance du terme dans le texte (highlighting)
- Sélecteur de champ (description / note / les deux)
- Recherche dans d'autres champs (`categorie`, `montant`)
