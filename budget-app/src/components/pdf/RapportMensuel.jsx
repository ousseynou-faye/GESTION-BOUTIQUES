import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getTop5Categories, getProgressionBudgets, getObjectifProgression,
} from '@/utils/calculations'
import { formatMontant, formatMois, formatDate } from '@/utils/formatters'
import { CATEGORIES } from '@/constants/categories'

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
  if (b.depasse)            return { label: 'X Dépassé', style: S.over }
  if (b.pourcentage >= 80)  return { label: '! Proche',  style: S.warn }
  return                           { label: 'OK',        style: S.ok   }
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
            <View style={[S.kpiCard, { marginRight: 8 }]}>
              <Text style={S.kpiLabel}>Revenus</Text>
              <Text style={[S.kpiValue, S.green]}>{formatMontant(revenus)}</Text>
            </View>
            <View style={[S.kpiCard, { marginRight: 8 }]}>
              <Text style={S.kpiLabel}>Dépenses</Text>
              <Text style={[S.kpiValue, S.red]}>{formatMontant(depenses)}</Text>
            </View>
            <View style={[S.kpiCard, { marginRight: 8 }]}>
              <Text style={S.kpiLabel}>Solde net</Text>
              <Text style={[S.kpiValue, solde >= 0 ? S.blue : S.orange]}>{formatMontant(solde)}</Text>
            </View>
            <View style={S.kpiCard}>
              <Text style={S.kpiLabel}>Taux d'épargne</Text>
              <Text style={[S.kpiValue, epargne > 0 ? S.ok : S.over]}>{epargne.toFixed(1)}%</Text>
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
                  <Text style={[S.td, { width: 70 }]}>{CATEGORIES[t.categorie]?.label ?? t.categorie}</Text>
                  <Text style={[S.td, t.type === 'revenu' ? S.green : S.red, { width: 100, textAlign: 'right' }]}>
                    {t.type === 'revenu' ? '+' : '-'}{formatMontant(t.montant)}
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
