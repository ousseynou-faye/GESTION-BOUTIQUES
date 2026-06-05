# Rapport Mensuel PDF — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton "Exporter PDF" sur le Dashboard qui génère et télécharge un rapport mensuel complet au format PDF blanc/professionnel.

**Architecture:** Un composant `@react-pdf/renderer` isolé dans `src/components/pdf/RapportMensuel.jsx` produit le document PDF (5 sections). Une fonction utilitaire `pdfUtils.js` gère la génération du blob et le téléchargement. Le bouton dans `Dashboard.jsx` appelle `downloadPdf()` avec les données du BudgetContext.

**Tech Stack:** @react-pdf/renderer, date-fns (déjà installé), calculations.js + formatters.js (existants)

---

## Fichiers impactés

| Action | Fichier |
|--------|---------|
| Créer | `src/components/pdf/RapportMensuel.jsx` |
| Créer | `src/components/pdf/pdfUtils.js` |
| Modifier | `src/pages/Dashboard.jsx` |
| Modifier | `package.json` + `package-lock.json` |

---

### Task 1 — Installer @react-pdf/renderer

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Installer la dépendance**

Depuis le dossier `budget-app/` :

```bash
npm install @react-pdf/renderer
```

Expected: la ligne `"@react-pdf/renderer": "^x.x.x"` apparaît dans `dependencies` de `package.json`.

- [ ] **Step 2: Vérifier que les tests passent toujours**

```bash
npm test
```

Expected: `49 tests passed, 0 failed` (la nouvelle dépendance ne touche rien d'existant).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @react-pdf/renderer"
```

---

### Task 2 — Créer RapportMensuel.jsx

**Files:**
- Create: `src/components/pdf/RapportMensuel.jsx`

Ce composant reçoit les données brutes, calcule les sections via les fonctions existantes, et retourne un `<Document>` @react-pdf/renderer prêt à être rendu.

- [ ] **Step 1: Créer le dossier pdf/ et le fichier**

Créer `src/components/pdf/RapportMensuel.jsx` avec le contenu suivant :

```jsx
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getTop5Categories, getProgressionBudgets, getObjectifProgression,
} from '@/utils/calculations'
import { formatMontant, formatMois, formatDate } from '@/utils/formatters'

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    color: '#1e293b',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    borderBottomStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  headerMois: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
    marginTop: 3,
  },
  headerDate: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'right',
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  kpiRow: { flexDirection: 'row' },
  kpiCard: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
  },
  kpiCardLast: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
  },
  kpiLabel: {
    fontSize: 7,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  td: { fontSize: 8, color: '#475569' },
  tdBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderTopStyle: 'solid',
  },
  green:  { color: '#059669' },
  red:    { color: '#e11d48' },
  blue:   { color: '#4338ca' },
  orange: { color: '#d97706' },
  warn:   { color: '#d97706' },
  ok:     { color: '#059669' },
  over:   { color: '#e11d48' },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statutBudget(b) {
  if (b.depasse)            return { label: '✗ Dépassé', style: S.over }
  if (b.pourcentage >= 80)  return { label: '⚠ Proche',  style: S.warn }
  return                           { label: '✓ OK',      style: S.ok   }
}

function statutObjectif(pct) {
  if (pct >= 100) return { label: 'Atteint',   style: S.ok     }
  if (pct >= 75)  return { label: 'Presque !', style: S.warn   }
  if (pct >= 21)  return { label: 'En cours',  style: S.blue   }
  return                  { label: 'Démarrage',style: S.orange  }
}

// ─── Composant ───────────────────────────────────────────────────────────────
export function RapportMensuel({ mois, transactions, budgets, goals }) {
  const moisPrecedent = format(subMonths(parseISO(mois + '-01'), 1), 'yyyy-MM')

  const revenus  = getTotalRevenus(transactions, mois)
  const depenses = getTotalDepenses(transactions, mois)
  const solde    = getSoldeNet(transactions, mois)
  const epargne  = getTauxEpargne(transactions, mois)

  const top5       = getTop5Categories(transactions, mois, moisPrecedent)
  const budgetsPro = getProgressionBudgets(transactions, budgets, mois)
  const txnsMois   = transactions
    .filter(t => t.date?.startsWith(mois))
    .sort((a, b) => b.date.localeCompare(a.date))

  const dateGen   = format(new Date(), 'd MMMM yyyy', { locale: fr })
  const moisLabel = formatMois(mois)

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Footer fixe sur chaque page ── */}
        <View style={S.footer} fixed>
          <Text>Généré par Budget Pro le {dateGen}</Text>
        </View>

        {/* ── En-tête ── */}
        <View style={S.header}>
          <View>
            <Text style={S.headerTitle}>Budget Pro</Text>
            <Text style={S.headerMois}>{moisLabel}</Text>
          </View>
          <Text style={S.headerDate}>Généré le {dateGen}</Text>
        </View>

        {/* ── KPIs ── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Résumé financier</Text>
          <View style={S.kpiRow}>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Revenus</Text>
              <Text style={[S.kpiValue, S.green]}>{formatMontant(revenus)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Dépenses</Text>
              <Text style={[S.kpiValue, S.red]}>{formatMontant(depenses)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Solde net</Text>
              <Text style={[S.kpiValue, solde >= 0 ? S.blue : S.orange]}>{formatMontant(solde)}</Text>
            </View>
            <View style={S.kpiCardLast}>
              <Text style={S.kpiLabel}>Taux d'épargne</Text>
              <Text style={[S.kpiValue, S.orange]}>{epargne.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* ── Top 5 dépenses ── */}
        {top5.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Top 5 dépenses</Text>
            <View style={S.tableHeaderRow}>
              <Text style={[S.th, { width: 20 }]}>#</Text>
              <Text style={[S.th, { flex: 1 }]}>Catégorie</Text>
              <Text style={[S.th, { width: 100, textAlign: 'right' }]}>Montant</Text>
              <Text style={[S.th, { width: 50, textAlign: 'right' }]}>% total</Text>
            </View>
            {top5.map((item, i) => (
              <View key={item.categorie} style={S.tableRow}>
                <Text style={[S.td, { width: 20 }]}>{i + 1}</Text>
                <Text style={[S.tdBold, { flex: 1 }]}>{item.label}</Text>
                <Text style={[S.td, { width: 100, textAlign: 'right' }]}>{formatMontant(item.montantCourant)}</Text>
                <Text style={[S.td, { width: 50, textAlign: 'right' }]}>{item.pourcentage.toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── État des budgets ── */}
        {budgetsPro.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>État des budgets</Text>
            <View style={S.tableHeaderRow}>
              <Text style={[S.th, { flex: 1 }]}>Catégorie</Text>
              <Text style={[S.th, { width: 85, textAlign: 'right' }]}>Budget</Text>
              <Text style={[S.th, { width: 85, textAlign: 'right' }]}>Dépensé</Text>
              <Text style={[S.th, { width: 35, textAlign: 'right' }]}>%</Text>
              <Text style={[S.th, { width: 60, textAlign: 'right' }]}>Statut</Text>
            </View>
            {budgetsPro.map(b => {
              const statut = statutBudget(b)
              return (
                <View key={b.id} style={S.tableRow}>
                  <Text style={[S.tdBold, { flex: 1 }]}>{b.label}</Text>
                  <Text style={[S.td, { width: 85, textAlign: 'right' }]}>{formatMontant(b.montantMensuel)}</Text>
                  <Text style={[S.td, { width: 85, textAlign: 'right' }]}>{formatMontant(b.depense)}</Text>
                  <Text style={[S.td, { width: 35, textAlign: 'right' }]}>{b.pourcentage.toFixed(0)}%</Text>
                  <Text style={[S.td, statut.style, { width: 60, textAlign: 'right' }]}>{statut.label}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ── Objectifs d'épargne ── */}
        {goals.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Objectifs d'épargne</Text>
            <View style={S.tableHeaderRow}>
              <Text style={[S.th, { flex: 1 }]}>Objectif</Text>
              <Text style={[S.th, { width: 85, textAlign: 'right' }]}>Actuel</Text>
              <Text style={[S.th, { width: 85, textAlign: 'right' }]}>Cible</Text>
              <Text style={[S.th, { width: 35, textAlign: 'right' }]}>%</Text>
              <Text style={[S.th, { width: 60, textAlign: 'right' }]}>Statut</Text>
            </View>
            {goals.map(goal => {
              const { pct } = getObjectifProgression(goal)
              const statut  = statutObjectif(pct)
              return (
                <View key={goal.id} style={S.tableRow}>
                  <Text style={[S.tdBold, { flex: 1 }]}>{goal.nom}</Text>
                  <Text style={[S.td, { width: 85, textAlign: 'right' }]}>{formatMontant(goal.montantActuel)}</Text>
                  <Text style={[S.td, { width: 85, textAlign: 'right' }]}>{formatMontant(goal.montantCible)}</Text>
                  <Text style={[S.td, { width: 35, textAlign: 'right' }]}>{pct.toFixed(0)}%</Text>
                  <Text style={[S.td, statut.style, { width: 60, textAlign: 'right' }]}>{statut.label}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ── Transactions du mois ── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>
            Transactions de {moisLabel} ({txnsMois.length})
          </Text>
          {txnsMois.length === 0 ? (
            <Text style={[S.td, { paddingVertical: 8 }]}>Aucune transaction ce mois.</Text>
          ) : (
            <>
              <View style={S.tableHeaderRow}>
                <Text style={[S.th, { width: 55 }]}>Date</Text>
                <Text style={[S.th, { flex: 1 }]}>Description</Text>
                <Text style={[S.th, { width: 70 }]}>Catégorie</Text>
                <Text style={[S.th, { width: 100, textAlign: 'right' }]}>Montant</Text>
              </View>
              {txnsMois.map(t => (
                <View key={t.id} style={S.tableRow} wrap={false}>
                  <Text style={[S.td, { width: 55 }]}>{formatDate(t.date, 'd MMM')}</Text>
                  <Text style={[S.tdBold, { flex: 1 }]}>{t.description}</Text>
                  <Text style={[S.td, { width: 70 }]}>{t.categorie}</Text>
                  <Text style={[S.td, t.type === 'revenu' ? S.green : S.red, { width: 100, textAlign: 'right' }]}>
                    {t.type === 'revenu' ? '+' : '−'}{formatMontant(t.montant)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Vérifier que les tests passent**

```bash
npm test
```

Expected: tous les tests passent (le nouveau fichier n'est pas importé par les tests existants).

- [ ] **Step 3: Commit**

```bash
git add src/components/pdf/RapportMensuel.jsx
git commit -m "feat: add RapportMensuel PDF component"
```

---

### Task 3 — Créer pdfUtils.js

**Files:**
- Create: `src/components/pdf/pdfUtils.js`

Ce fichier expose une seule fonction asynchrone qui génère le blob PDF et déclenche le téléchargement. Pas de JSX ici — on utilise `createElement` pour éviter l'extension `.jsx`.

- [ ] **Step 1: Créer le fichier**

Créer `src/components/pdf/pdfUtils.js` avec le contenu suivant :

```js
import { createElement } from 'react'
import { pdf } from '@react-pdf/renderer'
import { RapportMensuel } from './RapportMensuel'

export async function downloadPdf({ mois, transactions, budgets, goals }) {
  const element = createElement(RapportMensuel, { mois, transactions, budgets, goals })
  const blob    = await pdf(element).toBlob()
  const url     = URL.createObjectURL(blob)
  const link    = document.createElement('a')
  link.href     = url
  link.download = `budget-pro-${mois}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Vérifier que les tests passent**

```bash
npm test
```

Expected: tous les tests passent.

- [ ] **Step 3: Commit**

```bash
git add src/components/pdf/pdfUtils.js
git commit -m "feat: add downloadPdf utility"
```

---

### Task 4 — Ajouter le bouton sur Dashboard.jsx

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Ajouter useState à l'import React existant**

En haut de `Dashboard.jsx`, la ligne :

```js
import { useMemo } from 'react'
```

Devient :

```js
import { useMemo, useState } from 'react'
```

- [ ] **Step 2: Ajouter l'import de downloadPdf**

Juste après le dernier import existant du fichier, ajouter :

```js
import { downloadPdf } from '@/components/pdf/pdfUtils'
```

- [ ] **Step 3: Ajouter le state et la fonction dans le composant Dashboard**

Dans la fonction `Dashboard()`, après la ligne `const { transactions, budgets } = state`, ajouter :

```js
const [pdfLoading, setPdfLoading] = useState(false)

async function handleExportPdf() {
  setPdfLoading(true)
  try {
    await downloadPdf({ mois, transactions, budgets, goals: state.goals })
  } catch (err) {
    console.error(err)
    alert('Erreur lors de la génération du PDF.')
  } finally {
    setPdfLoading(false)
  }
}
```

- [ ] **Step 4: Remplacer le header dans le JSX**

Dans le `return (...)` de `Dashboard`, trouver le bloc `{/* ── Header ── */}` :

```jsx
{/* ── Header ── */}
<div className="flex items-center justify-between gap-4">
  <div>
    <h1 className="font-display text-2xl font-extrabold leading-tight"
      style={{ color: 'rgba(226,232,240,0.95)' }}>
      Tableau de bord
    </h1>
    <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
      {formatMois(mois)} — Vue d'ensemble de vos finances
    </p>
  </div>
  <MonthSelector />
</div>
```

Le remplacer par :

```jsx
{/* ── Header ── */}
<div className="flex items-center justify-between gap-4">
  <div>
    <h1 className="font-display text-2xl font-extrabold leading-tight"
      style={{ color: 'rgba(226,232,240,0.95)' }}>
      Tableau de bord
    </h1>
    <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
      {formatMois(mois)} — Vue d'ensemble de vos finances
    </p>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={handleExportPdf}
      disabled={pdfLoading}
      className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl disabled:opacity-50"
    >
      {pdfLoading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Génération...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter PDF
        </>
      )}
    </button>
    <MonthSelector />
  </div>
</div>
```

- [ ] **Step 5: Vérifier que les tests passent**

```bash
npm test
```

Expected: tous les tests passent.

- [ ] **Step 6: Lancer l'app et tester manuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:5173`. Vérifier :

1. Le bouton "Exporter PDF" est visible dans le header du Dashboard, à gauche du sélecteur de mois
2. Cliquer le bouton → spinner "Génération..." pendant ~1-2s → un fichier `budget-pro-YYYY-MM.pdf` se télécharge
3. Ouvrir le PDF → 5 sections visibles avec les bonnes données du mois
4. Changer de mois avec `← Juin 2026 →` → exporter à nouveau → le PDF reflète le nouveau mois
5. Tester sur un mois sans transactions → les sections Top 5 / Budgets / Objectifs s'affichent vides ou absentes proprement

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: add PDF export button to Dashboard"
```

---

### Task 5 — Push et déploiement

**Files:** aucun nouveau fichier

- [ ] **Step 1: Créer la branche feature**

```bash
git checkout -b feat/rapport-pdf
```

- [ ] **Step 2: Pousser la branche**

```bash
git push -u origin feat/rapport-pdf
```

- [ ] **Step 3: Créer la PR**

```bash
gh pr create --title "feat: rapport mensuel PDF" --body "$(cat <<'EOF'
## Summary
- Ajoute un bouton "Exporter PDF" dans le header du Dashboard
- Génère un rapport A4 blanc/professionnel via @react-pdf/renderer
- 5 sections : KPIs, Top 5 dépenses, Budgets, Objectifs, Transactions du mois
- Nom de fichier dynamique : budget-pro-YYYY-MM.pdf

## Test plan
- [ ] Bouton visible dans le header du Dashboard
- [ ] Clic → téléchargement automatique du PDF
- [ ] PDF contient les bonnes données du mois sélectionné
- [ ] Changer de mois → exporter → PDF reflète le nouveau mois
- [ ] Mois vide → pas de crash, sections conditionnelles absentes

🤖 Generated with Claude Code
EOF
)"
```

- [ ] **Step 4: Merger et déployer**

```bash
gh pr merge --merge
git checkout main
git pull
git push origin main
```

Expected: Vercel déploie automatiquement. Production mise à jour dans ~1 minute.
