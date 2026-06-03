# Redesign Responsive Budget Pro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre l'application Budget Pro belle et entièrement responsive — barre de navigation mobile basse, grilles adaptatives, polish visuel — puis pousser sur GitHub.

**Architecture:** On crée un composant `BottomNav` pour remplacer le drawer hamburger sur mobile, on simplifie le `TopBar`, on met à jour `App.jsx` pour tout brancher, puis on améliore les pages et composants existants sans toucher à la logique métier.

**Tech Stack:** React 18, Vite, Tailwind v4 (classes utilitaires dans JSX, `@theme` dans `index.css`), React Router v6

---

## Fichiers modifiés / créés

| Fichier | Action |
|---|---|
| `budget-app/src/components/layout/BottomNav.jsx` | Créer |
| `budget-app/src/components/layout/TopBar.jsx` | Modifier (supprimer drawer, simplifier) |
| `budget-app/src/App.jsx` | Modifier (ajouter BottomNav, pb mobile) |
| `budget-app/src/pages/Dashboard.jsx` | Modifier (breakpoints grilles) |
| `budget-app/src/pages/Transactions.jsx` | Modifier (FAB mobile, header button hidden) |
| `budget-app/src/components/ui/KPICard.jsx` | Modifier (effet brillance) |
| `.gitignore` | Modifier (ajouter `.superpowers/`) |

---

## Task 1 — Créer BottomNav.jsx

**Files:**
- Create: `budget-app/src/components/layout/BottomNav.jsx`

- [ ] **Créer le fichier avec ce contenu exact :**

```jsx
import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/',
    label: 'Accueil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Txns',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    ),
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-8" />
      </svg>
    ),
  },
  {
    to: '/graphiques',
    label: 'Charts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v9l5 3" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(13,20,36,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(99,102,241,0.18)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch h-16">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-1 relative',
                'text-[10px] font-semibold transition-colors duration-200',
                isActive ? 'text-indigo-400' : 'text-slate-500',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
                    aria-hidden="true"
                  />
                )}
                <span className={isActive ? 'text-indigo-400' : 'text-slate-600'}>
                  {item.icon}
                </span>
                <span className="leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Commit**

```bash
git add budget-app/src/components/layout/BottomNav.jsx
git commit -m "feat: add BottomNav component for mobile navigation"
```

---

## Task 2 — Simplifier TopBar.jsx

**Files:**
- Modify: `budget-app/src/components/layout/TopBar.jsx`

Le `TopBar` actuel contient tout le code du drawer hamburger (270 lignes). On le remplace par une version épurée : logo + titre de page + toggle thème uniquement. Pas de `useState`, pas de drawer.

- [ ] **Remplacer le contenu entier de `TopBar.jsx` par :**

```jsx
import { useLocation } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'

const pageTitles = {
  '/':             'Tableau de bord',
  '/transactions': 'Transactions',
  '/budgets':      'Budgets',
  '/graphiques':   'Graphiques',
  '/objectifs':    'Objectifs',
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function TopBar() {
  const { state, dispatch } = useBudget()
  const location = useLocation()
  const isDark    = state.settings.theme === 'dark'
  const pageTitle = pageTitles[location.pathname] ?? 'Budget Pro'

  return (
    <header
      className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: isDark ? 'rgba(6,11,24,0.94)' : 'rgba(241,245,249,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
      }}
    >
      {/* Logo + titre de page */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.40)',
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 leading-tight font-semibold tracking-widest uppercase">
            Budget Pro
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
            {pageTitle}
          </p>
        </div>
      </div>

      {/* Toggle thème */}
      <button
        onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
        aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}
```

- [ ] **Commit**

```bash
git add budget-app/src/components/layout/TopBar.jsx
git commit -m "feat: simplify TopBar — remove hamburger drawer, BottomNav takes over"
```

---

## Task 3 — Mettre à jour App.jsx

**Files:**
- Modify: `budget-app/src/App.jsx`

- [ ] **Remplacer le contenu de `App.jsx` par :**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BudgetProvider } from '@/context/BudgetContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budgets from '@/pages/Budgets'
import Charts from '@/pages/Charts'
import Goals from '@/pages/Goals'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 pb-24 md:p-7 md:pb-7 lg:p-8 lg:pb-8 max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/graphiques" element={<Charts />} />
            <Route path="/objectifs" element={<Goals />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </BudgetProvider>
  )
}
```

> **Note :** `pb-24` (96px) sur mobile donne de l'espace au-dessus de la `BottomNav` (64px) + marge de confort. Sur `md+`, `md:pb-7` revient au padding normal.

- [ ] **Commit**

```bash
git add budget-app/src/App.jsx
git commit -m "feat: wire BottomNav into layout, add mobile bottom padding"
```

---

## Task 4 — Améliorer les breakpoints du Dashboard

**Files:**
- Modify: `budget-app/src/pages/Dashboard.jsx`

Deux changements de breakpoint : les grilles basculent à `md` au lieu de `lg` pour s'afficher en 2+ colonnes dès la tablette (768px).

- [ ] **Dans `Dashboard.jsx` ligne 180, remplacer :**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
```
**par :**
```jsx
<div className="grid grid-cols-1 md:grid-cols-5 gap-5">
```

- [ ] **Dans `Dashboard.jsx` ligne 246, remplacer :**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
```
**par :**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
```

- [ ] **Vérifier en lançant le dev server :** `npm run dev` dans le dossier `budget-app/`, ouvrir http://localhost:5173, redimensionner la fenêtre à 768px de large — les charts doivent s'afficher côte à côte.

- [ ] **Commit**

```bash
git add budget-app/src/pages/Dashboard.jsx
git commit -m "fix: lower chart grid breakpoints from lg to md on Dashboard"
```

---

## Task 5 — Ajouter un FAB sur la page Transactions

**Files:**
- Modify: `budget-app/src/pages/Transactions.jsx`

Sur mobile le bouton "Nouvelle transaction" dans le header est difficile à atteindre. On le cache sur petits écrans et on ajoute un bouton flottant (FAB) en bas à droite, positionné juste au-dessus de la `BottomNav`.

- [ ] **Dans `Transactions.jsx`, trouver le `<Button>` dans le header (ligne ~104) et ajouter la classe `hidden sm:flex` :**

```jsx
<Button onClick={() => setAddOpen(true)} className="hidden sm:flex flex-shrink-0">
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
  Nouvelle transaction
</Button>
```

- [ ] **Juste avant la balise `</div>` de fermeture du composant (avant la ligne `<Modal isOpen={addOpen}...`), ajouter le FAB :**

```jsx
{/* FAB mobile — au-dessus de la BottomNav */}
<button
  onClick={() => setAddOpen(true)}
  className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white"
  style={{
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.50), 0 2px 8px rgba(0,0,0,0.25)',
  }}
  aria-label="Nouvelle transaction"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
</button>
```

> **Positionnement :** `bottom-20` = 80px = au-dessus de la BottomNav (64px) + 16px de marge.

- [ ] **Commit**

```bash
git add budget-app/src/pages/Transactions.jsx
git commit -m "feat: add FAB button for new transaction on mobile"
```

---

## Task 6 — Polish visuel KPICard

**Files:**
- Modify: `budget-app/src/components/ui/KPICard.jsx`

Ajouter deux effets subtils : une ligne de brillance en haut de la carte, et un overlay dégradé léger pour plus de profondeur.

- [ ] **Dans `KPICard.jsx`, après le troisième cercle décoratif (vers ligne 46), ajouter :**

```jsx
{/* Top shine line */}
<div
  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
  style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)' }}
  aria-hidden="true"
/>

{/* Subtle light overlay */}
<div
  className="absolute inset-0 pointer-events-none"
  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)' }}
  aria-hidden="true"
/>
```

- [ ] **Vérifier visuellement** : les 4 cartes KPI doivent avoir un léger reflet de lumière en haut.

- [ ] **Commit**

```bash
git add budget-app/src/components/ui/KPICard.jsx
git commit -m "style: add shine line and light overlay to KPICard"
```

---

## Task 7 — Mettre à jour .gitignore et pousser sur GitHub

**Files:**
- Modify: `.gitignore`
- Git operations

- [ ] **Ajouter `.superpowers/` au `.gitignore` :**

Ouvrir `.gitignore` à la racine du repo et ajouter la ligne `.superpowers/` à la fin du fichier.

- [ ] **Vérifier que l'app fonctionne correctement en prod-mode :**

```bash
cd budget-app && npm run build
```

Attendu : `✓ built in X.XXs` sans erreurs.

- [ ] **Vérifier le statut git :**

```bash
git status
git log --oneline -8
```

Attendu : tous les fichiers commités, 6 nouveaux commits depuis `be031fe`.

- [ ] **Pousser sur GitHub :**

```bash
git push origin main
```

Attendu : `Branch 'main' set up to track remote branch 'main' from 'origin'.`

- [ ] **Confirmer le push :** vérifier sur github.com que les commits sont bien arrivés.

---

## Résumé des commits attendus

```
feat: add BottomNav component for mobile navigation
feat: simplify TopBar — remove hamburger drawer, BottomNav takes over
feat: wire BottomNav into layout, add mobile bottom padding
fix: lower chart grid breakpoints from lg to md on Dashboard
feat: add FAB button for new transaction on mobile
style: add shine line and light overlay to KPICard
chore: add .superpowers/ to .gitignore
```
