# Transactions Enrichies — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter 5 fonctionnalités à la page Transactions : recherche texte, export/import CSV, marqueur de récurrence, et notes texte.

**Architecture:** Logique CSV pure dans `utils/csv.js` (testée avec Vitest), UI export/import dans `CSVActions.jsx`, champs `note` et `recurrente` ajoutés dans `TransactionForm` + `TransactionItem`. `Transactions.jsx` orchestre le tout.

**Tech Stack:** React 19, Vite 8, Tailwind v4, localStorage, Vitest (à installer)

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---|---|---|
| `src/utils/csv.js` | Créer | Sérialisation/parsing CSV — fonctions pures |
| `src/utils/csv.test.js` | Créer | Tests unitaires des fonctions pures CSV |
| `src/components/transactions/CSVActions.jsx` | Créer | Boutons Export + Import + modal confirmation |
| `src/components/transactions/TransactionForm.jsx` | Modifier | Ajouter champs `note` et `recurrente` |
| `src/components/transactions/TransactionItem.jsx` | Modifier | Afficher note + badge récurrence |
| `src/pages/Transactions.jsx` | Modifier | Ajouter recherche texte + intégrer CSVActions |
| `vite.config.js` | Modifier | Ajouter config Vitest |
| `package.json` | Modifier | Ajouter script `test` |

---

## Task 1 : Setup Vitest

**Files:**
- Modify: `budget-app/package.json`
- Modify: `budget-app/vite.config.js`

- [ ] **Step 1.1 — Installer Vitest**

```bash
cd budget-app
npm install -D vitest
```

Expected : `added 1 package` (environ), pas d'erreur.

- [ ] **Step 1.2 — Ajouter le script test dans package.json**

Remplacer le bloc `"scripts"` existant :

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
},
```

- [ ] **Step 1.3 — Ajouter la config test dans vite.config.js**

Remplacer le contenu complet de `vite.config.js` :

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 1.4 — Vérifier que Vitest fonctionne**

```bash
npm test
```

Expected : `No test files found` ou `0 tests passed` — pas d'erreur de configuration.

- [ ] **Step 1.5 — Commit**

```bash
git add package.json vite.config.js package-lock.json
git commit -m "chore: setup vitest for unit testing"
```

---

## Task 2 : Créer csv.js — fonctions pures (TDD)

**Files:**
- Create: `src/utils/csv.js`
- Create: `src/utils/csv.test.js`

- [ ] **Step 2.1 — Écrire les tests (les fonctions n'existent pas encore)**

Créer `src/utils/csv.test.js` :

```js
import { describe, it, expect } from 'vitest'
import { transactionsVersCSV, parseLigneCSV, validerLigneCSV } from './csv.js'

const txnFixture = {
  id: 'txn_1',
  type: 'depense',
  montant: 5000,
  description: 'Courses du marché',
  categorie: 'alimentation',
  date: '2026-06-01',
  note: null,
  recurrente: false,
}

// ── transactionsVersCSV ──────────────────────────────────────────────────────
describe('transactionsVersCSV', () => {
  it('génère une ligne header + une ligne de données', () => {
    const csv = transactionsVersCSV([txnFixture])
    const lignes = csv.split('\n')
    expect(lignes[0]).toBe('id,type,montant,description,categorie,date,note,recurrente')
    expect(lignes[1]).toBe('txn_1,depense,5000,"Courses du marché",alimentation,2026-06-01,"",false')
  })

  it('échappe les guillemets doubles dans la description', () => {
    const txn = { ...txnFixture, description: 'Achat "urgent"' }
    const csv = transactionsVersCSV([txn])
    expect(csv).toContain('"Achat ""urgent"""')
  })

  it('inclut la note et recurrente=true si présents', () => {
    const txn = { ...txnFixture, note: 'Paiement Wave', recurrente: true }
    const csv = transactionsVersCSV([txn])
    expect(csv).toContain('"Paiement Wave",true')
  })

  it('retourne uniquement le header pour un tableau vide', () => {
    const csv = transactionsVersCSV([])
    expect(csv.trim()).toBe('id,type,montant,description,categorie,date,note,recurrente')
  })
})

// ── parseLigneCSV ────────────────────────────────────────────────────────────
describe('parseLigneCSV', () => {
  it('parse une ligne CSV simple', () => {
    expect(parseLigneCSV('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('parse un champ entre guillemets contenant une virgule', () => {
    expect(parseLigneCSV('a,"b,c",d')).toEqual(['a', 'b,c', 'd'])
  })

  it('gère les guillemets doublés ("")', () => {
    expect(parseLigneCSV('"a ""b""",c')).toEqual(['a "b"', 'c'])
  })

  it('retourne un champ vide pour une valeur vide entre virgules', () => {
    expect(parseLigneCSV('a,,c')).toEqual(['a', '', 'c'])
  })
})

// ── validerLigneCSV ──────────────────────────────────────────────────────────
describe('validerLigneCSV', () => {
  const colsValides = ['txn_1', 'depense', '5000', 'Courses', 'alimentation', '2026-06-01', '', 'false']

  it('accepte une ligne valide', () => {
    const { erreur, transaction } = validerLigneCSV(colsValides, 2)
    expect(erreur).toBeNull()
    expect(transaction.montant).toBe(5000)
    expect(transaction.note).toBeNull()
    expect(transaction.recurrente).toBe(false)
  })

  it('génère un nouvel ID (ignore celui du CSV)', () => {
    const { transaction } = validerLigneCSV(colsValides, 2)
    expect(transaction.id).not.toBe('txn_1')
    expect(transaction.id).toMatch(/^txn_/)
  })

  it('accepte recurrente=true', () => {
    const cols = [...colsValides]; cols[7] = 'true'
    const { transaction } = validerLigneCSV(cols, 2)
    expect(transaction.recurrente).toBe(true)
  })

  it('rejette un type invalide', () => {
    const cols = [...colsValides]; cols[1] = 'foo'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('Ligne 2')
    expect(erreur).toContain('type invalide')
  })

  it('rejette un montant nul ou négatif', () => {
    const cols = [...colsValides]; cols[2] = '-100'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('montant invalide')
  })

  it('rejette une date mal formatée', () => {
    const cols = [...colsValides]; cols[5] = '01/06/2026'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('date invalide')
  })

  it('rejette une catégorie inconnue', () => {
    const cols = [...colsValides]; cols[4] = 'pizza'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('catégorie inconnue')
  })

  it('rejette si moins de 6 colonnes', () => {
    const { erreur } = validerLigneCSV(['a', 'b', 'c'], 5)
    expect(erreur).toContain('Ligne 5')
    expect(erreur).toContain('colonnes insuffisantes')
  })
})
```

- [ ] **Step 2.2 — Lancer les tests — vérifier qu'ils échouent**

```bash
npm test
```

Expected : `FAIL src/utils/csv.test.js` avec `Cannot find module './csv.js'`

- [ ] **Step 2.3 — Créer src/utils/csv.js**

```js
import { ALL_CATEGORIES } from '@/constants/categories'

const ENTETES = 'id,type,montant,description,categorie,date,note,recurrente'

// ── Fonctions pures (testables) ──────────────────────────────────────────────

export function transactionsVersCSV(transactions) {
  const lignes = transactions.map(t => [
    t.id,
    t.type,
    t.montant,
    csvChamp(t.description ?? ''),
    t.categorie,
    t.date,
    csvChamp(t.note ?? ''),
    t.recurrente ? 'true' : 'false',
  ].join(','))
  return [ENTETES, ...lignes].join('\n')
}

export function parseLigneCSV(ligne) {
  const cols = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i]
    if (c === '"') {
      if (inQuotes && ligne[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (c === ',' && !inQuotes) {
      cols.push(current); current = ''
    } else {
      current += c
    }
  }
  cols.push(current)
  return cols
}

export function validerLigneCSV(cols, numLigne) {
  if (cols.length < 6)
    return { erreur: `Ligne ${numLigne} : colonnes insuffisantes (${cols.length}/6 minimum)`, transaction: null }

  const [, type, montantStr, description, categorie, date, note = '', recurrenteStr = 'false'] = cols
  const montant = parseFloat(montantStr)

  if (!['revenu', 'depense'].includes(type))
    return { erreur: `Ligne ${numLigne} : type invalide "${type}" (attendu : revenu ou depense)`, transaction: null }

  if (isNaN(montant) || montant <= 0)
    return { erreur: `Ligne ${numLigne} : montant invalide "${montantStr}" (doit être > 0)`, transaction: null }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return { erreur: `Ligne ${numLigne} : date invalide "${date}" (format attendu : YYYY-MM-DD)`, transaction: null }

  if (!ALL_CATEGORIES.includes(categorie))
    return { erreur: `Ligne ${numLigne} : catégorie inconnue "${categorie}"`, transaction: null }

  return {
    erreur: null,
    transaction: {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      montant,
      description,
      categorie,
      date,
      note: note.trim() || null,
      recurrente: recurrenteStr === 'true',
    },
  }
}

// ── Fonctions browser (non testées unitairement) ─────────────────────────────

export function exporterCSV(transactions) {
  const BOM = '﻿'
  const csv = BOM + transactionsVersCSV(transactions)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importerCSV(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = (e.target.result ?? '').replace(/^﻿/, '')
      const toutes = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (toutes.length < 2) {
        resolve({ valides: [], erreurs: ['Fichier vide ou sans données'] })
        return
      }
      const valides = []
      const erreurs = []
      toutes.slice(1).forEach((ligne, idx) => {
        const cols = parseLigneCSV(ligne)
        const { erreur, transaction } = validerLigneCSV(cols, idx + 2)
        if (erreur) erreurs.push(erreur)
        else valides.push(transaction)
      })
      resolve({ valides, erreurs })
    }
    reader.readAsText(file, 'UTF-8')
  })
}

// ── Utilitaire interne ────────────────────────────────────────────────────────

function csvChamp(val) {
  return `"${val.replace(/"/g, '""')}"`
}
```

- [ ] **Step 2.4 — Lancer les tests — vérifier qu'ils passent**

```bash
npm test
```

Expected :
```
✓ src/utils/csv.test.js (14)
  ✓ transactionsVersCSV (4)
  ✓ parseLigneCSV (4)
  ✓ validerLigneCSV (8)
Test Files  1 passed (1)
Tests  14 passed (14)
```

- [ ] **Step 2.5 — Commit**

```bash
git add src/utils/csv.js src/utils/csv.test.js
git commit -m "feat: add csv utility — serialization, parsing, validation (TDD)"
```

---

## Task 3 : Créer CSVActions.jsx

**Files:**
- Create: `src/components/transactions/CSVActions.jsx`

- [ ] **Step 3.1 — Créer le composant**

```jsx
import { useState, useRef } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Modal } from '@/components/ui/Modal'
import { exporterCSV, importerCSV } from '@/utils/csv'

export function CSVActions({ transactionsFiltrees }) {
  const { dispatch } = useBudget()
  const inputRef = useRef(null)
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(false)

  async function handleFichier(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setChargement(true)
    const res = await importerCSV(file)
    setResultat(res)
    setChargement(false)
    e.target.value = ''
  }

  function confirmerImport() {
    resultat.valides.forEach(t =>
      dispatch({ type: 'ADD_TRANSACTION', payload: t })
    )
    setResultat(null)
  }

  const btnBase = {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(148,163,184,0.8)',
  }
  const btnHover = { background: 'rgba(255,255,255,0.08)' }

  return (
    <>
      <div className="flex gap-2">
        {/* ── Export ── */}
        <button
          onClick={() => exporterCSV(transactionsFiltrees)}
          aria-label="Exporter les transactions en CSV"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all focus:outline-none"
          style={btnBase}
          onMouseEnter={e => Object.assign(e.currentTarget.style, btnHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, btnBase)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        {/* ── Import ── */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={chargement}
          aria-label="Importer des transactions depuis un fichier CSV"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={btnBase}
          onMouseEnter={e => { if (!chargement) Object.assign(e.currentTarget.style, btnHover) }}
          onMouseLeave={e => Object.assign(e.currentTarget.style, btnBase)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {chargement ? 'Lecture…' : 'Import CSV'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFichier}
        />
      </div>

      {/* ── Modal confirmation import ── */}
      <Modal
        isOpen={!!resultat}
        onClose={() => setResultat(null)}
        titre="Confirmer l'import CSV"
      >
        {resultat && (
          <div className="flex flex-col gap-4">
            {/* Résumé chiffres */}
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                <p className="font-display text-2xl font-extrabold" style={{ color: '#34d399' }}>
                  {resultat.valides.length}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>
                  transaction{resultat.valides.length !== 1 ? 's' : ''} valide{resultat.valides.length !== 1 ? 's' : ''}
                </p>
              </div>
              {resultat.erreurs.length > 0 && (
                <div
                  className="flex-1 rounded-xl px-4 py-3 text-center"
                  style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
                >
                  <p className="font-display text-2xl font-extrabold" style={{ color: '#fb7185' }}>
                    {resultat.erreurs.length}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>
                    ligne{resultat.erreurs.length !== 1 ? 's' : ''} ignorée{resultat.erreurs.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Détail erreurs */}
            {resultat.erreurs.length > 0 && (
              <div
                className="rounded-xl p-3 max-h-36 overflow-y-auto"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(251,113,133,0.7)' }}>
                  Détail des erreurs
                </p>
                {resultat.erreurs.map((err, i) => (
                  <p key={i} className="text-[11px] py-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setResultat(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                Annuler
              </button>
              <button
                onClick={confirmerImport}
                disabled={resultat.valides.length === 0}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: resultat.valides.length > 0
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: resultat.valides.length > 0 ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
                }}
                onMouseEnter={e => { if (resultat.valides.length > 0) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Importer {resultat.valides.length} transaction{resultat.valides.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
```

- [ ] **Step 3.2 — Vérifier que l'app compile (CSVActions pas encore branché)**

```bash
npm run dev
```

Ouvrir http://localhost:5173 — l'app s'affiche sans erreur de console.

- [ ] **Step 3.3 — Commit**

```bash
git add src/components/transactions/CSVActions.jsx
git commit -m "feat: add CSVActions component — export/import buttons with confirmation modal"
```

---

## Task 4 : Étendre TransactionForm.jsx (note + recurrente)

**Files:**
- Modify: `src/components/transactions/TransactionForm.jsx`

- [ ] **Step 4.1 — Mettre à jour defaultForm**

Remplacer :
```js
const defaultForm = {
  type:        'depense',
  montant:     '',
  categorie:   '',
  description: '',
  date:        format(new Date(), 'yyyy-MM-dd'),
}
```
Par :
```js
const defaultForm = {
  type:        'depense',
  montant:     '',
  categorie:   '',
  description: '',
  date:        format(new Date(), 'yyyy-MM-dd'),
  note:        '',
  recurrente:  false,
}
```

- [ ] **Step 4.2 — Mettre à jour l'initialisation depuis `initial`**

Remplacer :
```js
  const [form, setForm] = useState(initial
    ? { ...initial, montant: String(initial.montant) }
    : defaultForm
  )
```
Par :
```js
  const [form, setForm] = useState(initial
    ? { ...initial, montant: String(initial.montant), note: initial.note ?? '', recurrente: initial.recurrente ?? false }
    : defaultForm
  )
```

- [ ] **Step 4.3 — Inclure note et recurrente dans handleSubmit**

Remplacer le bloc `onSubmit(...)` dans `handleSubmit` :
```js
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      type:        form.type,
      montant:     parseFloat(form.montant),
      categorie:   form.categorie,
      description: form.description.trim(),
      date:        form.date,
    })
```
Par :
```js
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      type:        form.type,
      montant:     parseFloat(form.montant),
      categorie:   form.categorie,
      description: form.description.trim(),
      date:        form.date,
      note:        form.note.trim() || null,
      recurrente:  form.recurrente,
    })
```

- [ ] **Step 4.4 — Ajouter le textarea Note et la checkbox Récurrence**

Remplacer le commentaire `{/* ── Actions ── */}` et tout son bloc JSX par :

```jsx
      {/* ── Note ── */}
      <div>
        <FieldLabel>
          Note{' '}
          <span style={{ color: 'rgba(100,116,139,0.4)', textTransform: 'none', letterSpacing: 0, fontSize: '9px', fontWeight: 400 }}>
            (optionnel)
          </span>
        </FieldLabel>
        <div className="relative">
          <textarea
            placeholder="Commentaire, référence, contexte…"
            value={form.note}
            onChange={e => set('note', e.target.value.slice(0, 500))}
            aria-label="Note"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 resize-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(226,232,240,0.9)',
              caretColor: typeColor,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = typeColor + '45'; e.currentTarget.style.boxShadow = `0 0 0 3px ${typeColor}10` }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <span
            className="absolute bottom-2 right-3 text-[10px] tabular-nums pointer-events-none"
            style={{ color: form.note.length > 450 ? '#fb923c' : 'rgba(100,116,139,0.45)' }}
          >
            {form.note.length}/500
          </span>
        </div>
      </div>

      {/* ── Récurrence ── */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          className="relative w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: form.recurrente ? typeColor : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${form.recurrente ? typeColor : 'rgba(255,255,255,0.15)'}`,
            boxShadow: form.recurrente ? `0 0 8px ${typeColor}44` : 'none',
          }}
        >
          {form.recurrente && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <input
            type="checkbox"
            checked={form.recurrente}
            onChange={e => set('recurrente', e.target.checked)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            aria-label="Transaction récurrente"
          />
        </div>
        <div>
          <span className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.85)' }}>
            Transaction récurrente
          </span>
          <span className="text-xs ml-1.5" style={{ color: 'rgba(100,116,139,0.55)' }}>
            (loyer, salaire, abonnement…)
          </span>
        </div>
      </label>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-semibold rounded-2xl transition-all focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-3 font-display text-sm font-bold rounded-2xl text-white transition-all duration-200 focus:outline-none flex items-center justify-center gap-2"
          style={{ background: typeGrad, boxShadow: `0 6px 20px ${typeColor}44` }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {isRevenu ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
          )}
          {initial ? 'Enregistrer' : isRevenu ? 'Ajouter le revenu' : 'Ajouter la dépense'}
        </button>
      </div>
```

- [ ] **Step 4.5 — Test manuel**

```bash
npm run dev
```

- Ouvrir http://localhost:5173/transactions → cliquer "Nouvelle transaction"
- Vérifier que le textarea **Note** et la checkbox **Transaction récurrente** sont visibles
- Créer une transaction avec note + récurrente cochée → vérifier en console `localStorage.getItem('budget_transactions')` que `note` et `recurrente` sont présents

- [ ] **Step 4.6 — Commit**

```bash
git add src/components/transactions/TransactionForm.jsx
git commit -m "feat: add note textarea and recurrente checkbox to TransactionForm"
```

---

## Task 5 : Étendre TransactionItem.jsx (affichage note + badge récurrence)

**Files:**
- Modify: `src/components/transactions/TransactionItem.jsx`

- [ ] **Step 5.1 — Remplacer le bloc Info pour ajouter badge récurrence et note**

Remplacer entièrement le bloc `{/* ── Info ── */}` :

```jsx
        {/* ── Info ── */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[13px] font-semibold truncate leading-snug"
            style={{ color: 'rgba(226,232,240,0.92)' }}>
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge categorie={transaction.categorie} />
            <span className="text-[10px] font-medium" style={{ color: 'rgba(100,116,139,0.65)' }}>
              {formatDate(transaction.date, 'd MMM yyyy')}
            </span>
          </div>
        </div>
```

Par :

```jsx
        {/* ── Info ── */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[13px] font-semibold truncate leading-snug"
            style={{ color: 'rgba(226,232,240,0.92)' }}>
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge categorie={transaction.categorie} />
            {transaction.recurrente && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(129,140,248,0.12)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.2)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Récurrente
              </span>
            )}
            <span className="text-[10px] font-medium" style={{ color: 'rgba(100,116,139,0.65)' }}>
              {formatDate(transaction.date, 'd MMM yyyy')}
            </span>
          </div>
          {transaction.note && (
            <p
              className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
              style={{ color: 'rgba(100,116,139,0.7)' }}
              title={transaction.note}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline mr-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
                style={{ verticalAlign: 'text-bottom' }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {transaction.note}
            </p>
          )}
        </div>
```

- [ ] **Step 5.2 — Test manuel**

```bash
npm run dev
```

- Ouvrir http://localhost:5173/transactions
- La transaction créée en Task 4 (avec note + récurrente) doit afficher :
  - Le badge indigo "↻ Récurrente" à côté de la catégorie
  - La note en gris clair sous les badges, avec icône crayon

- [ ] **Step 5.3 — Commit**

```bash
git add src/components/transactions/TransactionItem.jsx
git commit -m "feat: display recurrente badge and note text in TransactionItem"
```

---

## Task 6 : Mettre à jour Transactions.jsx (recherche + CSVActions)

**Files:**
- Modify: `src/pages/Transactions.jsx`

- [ ] **Step 6.1 — Ajouter l'import de CSVActions en haut du fichier**

Après la dernière ligne d'import, ajouter :
```js
import { CSVActions } from '@/components/transactions/CSVActions'
```

- [ ] **Step 6.2 — Ajouter l'état recherche après les autres useState**

Après `const [page, setPage] = useState(0)`, ajouter :
```js
  const [recherche, setRecherche] = useState('')
```

- [ ] **Step 6.3 — Étendre le useMemo de filtrage**

Dans le `useMemo` de `filtered`, ajouter après les 3 filtres existants et avant `return list` :
```js
    if (recherche.trim())
      list = list.filter(t =>
        t.description.toLowerCase().includes(recherche.toLowerCase().trim())
      )
```

Ajouter `recherche` dans le tableau de dépendances :
```js
  }, [state.transactions, filtreType, filtreCateg, filtreMois, recherche])
```

- [ ] **Step 6.4 — Mettre à jour hasFiltre**

Remplacer :
```js
  const hasFiltre = filtreType !== 'tous' || filtreCateg !== 'toutes' || filtreMois
```
Par :
```js
  const hasFiltre = filtreType !== 'tous' || filtreCateg !== 'toutes' || filtreMois || recherche.trim()
```

- [ ] **Step 6.5 — Ajouter recherche dans activeFilters**

Dans le tableau `activeFilters`, ajouter une entrée après celle de `filtreMois` :
```js
    recherche.trim() && {
      key:   'recherche',
      label: `"${recherche.trim()}"`,
      clear: () => { setRecherche(''); setPage(0) },
    },
```

- [ ] **Step 6.6 — Ajouter setRecherche au bouton Réinitialiser**

Remplacer :
```jsx
              onClick={() => { setFiltreType('tous'); setFiltreCateg('toutes'); setFiltreMois(''); setPage(0) }}
```
Par :
```jsx
              onClick={() => { setFiltreType('tous'); setFiltreCateg('toutes'); setFiltreMois(''); setRecherche(''); setPage(0) }}
```

- [ ] **Step 6.7 — Ajouter le champ de recherche dans le panneau Filtres**

Dans le bloc `{/* Controls */}`, après `<input type="month" ...>` et avant le bouton "Réinitialiser", ajouter :

```jsx
          {/* Recherche texte */}
          <div className="relative flex-1 min-w-[180px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: recherche ? '#818cf8' : 'rgba(100,116,139,0.5)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={recherche}
              onChange={e => { setRecherche(e.target.value); setPage(0) }}
              placeholder="Rechercher une transaction…"
              aria-label="Rechercher une transaction par description"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${recherche ? 'rgba(129,140,248,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: 'rgba(226,232,240,0.9)',
                boxShadow: recherche ? '0 0 0 3px rgba(129,140,248,0.1)' : 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
              onBlur={e => {
                if (!recherche) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            />
          </div>
```

- [ ] **Step 6.8 — Intégrer CSVActions dans le header**

Remplacer le bloc `{/* ── Header ── */}` entier :
```jsx
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            {state.transactions.length} transaction{state.transactions.length > 1 ? 's' : ''} au total
            {hasFiltre && (
              <span className="font-semibold" style={{ color: '#818cf8' }}>
                {' · '}{filtered.length} après filtrage
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="hidden sm:flex flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle transaction
        </Button>
      </div>
```
Par :
```jsx
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            {state.transactions.length} transaction{state.transactions.length > 1 ? 's' : ''} au total
            {hasFiltre && (
              <span className="font-semibold" style={{ color: '#818cf8' }}>
                {' · '}{filtered.length} après filtrage
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CSVActions transactionsFiltrees={filtered} />
          <Button onClick={() => setAddOpen(true)} className="hidden sm:flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle transaction
          </Button>
        </div>
      </div>
```

- [ ] **Step 6.9 — Test manuel complet**

```bash
npm run dev
```

**Scénario 1 — Recherche :**
- Taper "courses" → seules les transactions contenant "courses" s'affichent
- Un chip `"courses"` apparaît dans les filtres actifs
- Cliquer × sur le chip ou "Réinitialiser" → la recherche s'efface

**Scénario 2 — Export CSV :**
- Cliquer "Export CSV" → fichier `transactions_YYYY-MM-DD.csv` téléchargé
- Ouvrir dans un éditeur texte → vérifier colonnes `id,type,montant,description,categorie,date,note,recurrente`

**Scénario 3 — Import CSV :**
- Ouvrir le CSV exporté, ajouter une nouvelle ligne valide, sauvegarder
- Cliquer "Import CSV", sélectionner le fichier
- Le modal affiche "X transaction(s) valide(s)"
- Cliquer "Importer" → la transaction apparaît dans la liste

- [ ] **Step 6.10 — Commit**

```bash
git add src/pages/Transactions.jsx
git commit -m "feat: add text search and CSV actions to Transactions page"
```

---

## Task 7 : Vérification finale

- [ ] **Step 7.1 — Lancer tous les tests**

```bash
cd budget-app && npm test
```

Expected :
```
✓ src/utils/csv.test.js (14)
Test Files  1 passed (1)
Tests  14 passed (14)
```

- [ ] **Step 7.2 — Vérifier le build de production**

```bash
npm run build
```

Expected : `✓ built in Xs` sans erreur ni warning critique.

- [ ] **Step 7.3 — Commit final**

```bash
git add -A
git commit -m "feat: transactions enrichies — search, CSV export/import, recurrence badge, notes"
```

---

## Self-review

| Requirement spec | Tâche |
|---|---|
| Recherche par texte | T6 (state + filtre + input) |
| Export CSV | T2 (`exporterCSV`) + T3 (bouton) + T6 (branché sur `filtered`) |
| Import CSV | T2 (`importerCSV` + `validerLigneCSV`) + T3 (modal) + T6 (branché) |
| Récurrence — marqueur visuel | T4 (checkbox form) + T5 (badge item) |
| Notes texte | T4 (textarea form) + T5 (affichage item) |

Noms cohérents entre tâches : `transactionsVersCSV`, `parseLigneCSV`, `validerLigneCSV`, `exporterCSV`, `importerCSV`, `transactionsFiltrees`, `confirmerImport`.
