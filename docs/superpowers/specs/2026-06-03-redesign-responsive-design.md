# Spec — Redesign responsive & amélioration visuelle Budget Pro

**Date :** 2026-06-03  
**Statut :** Approuvé

---

## Objectif

Rendre l'application Budget Pro plus belle et entièrement responsive sur tous les écrans (mobile, tablette, desktop), en conservant la stack existante (React + Tailwind v4).

---

## Architecture & changements par couche

### 1. Navigation mobile — remplacement du drawer hamburger

**Avant :** TopBar avec bouton hamburger → drawer latéral droit  
**Après :** TopBar simplifiée (logo + titre de page + toggle thème) + barre de navigation basse fixe (`BottomNav`)

- Nouveau composant `src/components/layout/BottomNav.jsx`
- 5 items (Tableau de bord, Transactions, Budgets, Graphiques, Objectifs)
- Position `fixed bottom-0` avec `safe-area-inset-bottom` pour les iPhones
- Visible uniquement sur `< md` (classe `md:hidden`)
- Le composant `TopBar` perd le hamburger et le drawer ; il ne garde que logo + titre + toggle thème
- `App.jsx` : ajouter `pb-20 md:pb-0` sur `<main>` pour compenser la hauteur de la barre basse

### 2. Navigation desktop — sidebar conservée

La sidebar actuelle (`Sidebar.jsx`) est déjà de bonne qualité. Pas de modification de structure, uniquement retrait du code mort lié au hamburger si nécessaire.

### 3. Dashboard — grilles responsives

- KPI cards : `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4` (inchangé, déjà correct)
- Charts row : `grid-cols-1 md:grid-cols-5` (actuel `lg:grid-cols-5` → abaissé à `md`)
- Dernières transactions + Budgets : `grid-cols-1 md:grid-cols-2` (actuel `lg:grid-cols-2` → abaissé à `md`)

### 4. Page Transactions

- Sur mobile : masquer les colonnes secondaires du tableau (date, catégorie en texte) et utiliser le composant `TransactionItem` en liste verticale pleine largeur
- Bouton "Ajouter" : flottant (`fixed bottom-24 right-4`) sur mobile, inline sur desktop
- Filtres : repliables en accordéon sur mobile

### 5. Page Budgets

- Cards budgets : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Formulaire ajout : modal plein écran sur mobile (`inset-x-0 bottom-0 rounded-t-2xl`) vs modal centré actuel sur desktop

### 6. Page Graphiques

- Charts empilés verticalement sur mobile, grille 2 colonnes sur `md+`
- `ResponsiveContainer` déjà utilisé — hauteurs revues pour mobile (140px) vs desktop (220px)

### 7. Page Objectifs

- Cards : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Bouton dépôt : plein largeur sur mobile

### 8. Améliorations visuelles globales

- **KPICard** : ajout d'une fine ligne de brillance en haut (`::before` ou div absolue) pour un effet "verre"
- **Cards** : ombre légèrement plus prononcée sur dark mode (`shadow-lg` au lieu de `shadow-sm`)
- **Transitions** : `transition-all duration-200` déjà en place — vérifier cohérence sur les nouvelles interactions
- **Typographie mobile** : `text-xl` sur les titres de page (au lieu de `text-2xl`) pour éviter le débordement sur petits écrans

---

## Composants créés / modifiés

| Fichier | Action |
|---|---|
| `src/components/layout/BottomNav.jsx` | Créer |
| `src/components/layout/TopBar.jsx` | Modifier (supprimer drawer, simplifier) |
| `src/App.jsx` | Modifier (`pb-20 md:pb-0` sur `<main>`) |
| `src/pages/Dashboard.jsx` | Modifier (breakpoints grilles) |
| `src/pages/Transactions.jsx` | Modifier (liste mobile, bouton FAB) |
| `src/pages/Budgets.jsx` | Modifier (grille, modal mobile) |
| `src/pages/Charts.jsx` | Modifier (hauteurs, grille) |
| `src/pages/Goals.jsx` | Modifier (grille) |
| `src/components/ui/KPICard.jsx` | Modifier (effet brillance) |

---

## Ce qui ne change pas

- Stack technique (React, Vite, Tailwind v4, Recharts)
- Sidebar desktop (`Sidebar.jsx`) — conservée telle quelle
- Logique métier, context, reducers, utils
- Thème dark/light, palette de couleurs, tokens CSS
- Données localStorage

---

## Critères de succès

- Sur mobile (375px) : navigation visible en bas, tout le contenu accessible sans scroll horizontal
- Sur tablette (768px) : sidebar visible, grilles 2 colonnes
- Sur desktop (1280px) : sidebar + grilles 4/5 colonnes, identique à aujourd'hui (ou mieux)
- Pas de régression fonctionnelle (ajout/édition/suppression transactions, budgets, objectifs)
