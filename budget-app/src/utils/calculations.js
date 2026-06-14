import { parseISO, format, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { CATEGORIES } from '@/constants/categories'

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}
// eslint-disable-next-line no-unused-vars
const _makeId = makeId

function txnsDuMois(transactions, mois) {
  return transactions.filter(t => t.date && t.date.startsWith(mois))
}

export function getTotalRevenus(transactions, mois) {
  return txnsDuMois(transactions, mois)
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0)
}

export function getTotalDepenses(transactions, mois) {
  return txnsDuMois(transactions, mois)
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0)
}

export function getSoldeNet(transactions, mois) {
  return getTotalRevenus(transactions, mois) - getTotalDepenses(transactions, mois)
}

export function getTauxEpargne(transactions, mois) {
  const revenus = getTotalRevenus(transactions, mois)
  const depenses = getTotalDepenses(transactions, mois)
  if (revenus === 0) return 0
  return Math.max(0, ((revenus - depenses) / revenus) * 100)
}

export function getDepensesParCategorie(transactions, mois) {
  const result = {}
  txnsDuMois(transactions, mois)
    .filter(t => t.type === 'depense')
    .forEach(t => {
      result[t.categorie] = (result[t.categorie] || 0) + t.montant
    })
  return result
}

export function getDepensesParCategoriePieData(transactions, mois) {
  const byCateg = getDepensesParCategorie(transactions, mois)
  return Object.entries(byCateg)
    .map(([key, value]) => ({
      name: CATEGORIES[key]?.label || key,
      value: Math.round(value * 100) / 100,
      couleur: CATEGORIES[key]?.couleur || '#6b7280',
      key,
    }))
    .sort((a, b) => b.value - a.value)
}

export function getDonnees6Mois(transactions) {
  const result = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const mois = format(date, 'yyyy-MM')
    result.push({
      mois,
      revenus: getTotalRevenus(transactions, mois),
      depenses: getTotalDepenses(transactions, mois),
    })
  }
  return result
}

export function getDonnees12Mois(transactions) {
  const result = []
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const mois = format(date, 'yyyy-MM')
    result.push({
      mois,
      revenus: getTotalRevenus(transactions, mois),
      depenses: getTotalDepenses(transactions, mois),
    })
  }
  return result
}

export function getSoldesCumulatifs(transactions) {
  if (!transactions.length) return []
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  let solde = 0
  const byDate = {}
  sorted.forEach(t => {
    const delta = t.type === 'revenu' ? t.montant : -t.montant
    solde += delta
    byDate[t.date] = solde
  })
  return Object.entries(byDate).map(([date, solde]) => ({ date, solde: Math.round(solde * 100) / 100 }))
}

export function getProgressionBudgets(transactions, budgets, mois) {
  const depensesParCateg = getDepensesParCategorie(transactions, mois)
  return budgets
    .filter(b => b.mois === mois)
    .map(b => {
      const depense = depensesParCateg[b.categorie] || 0
      const pourcentage = b.montantMensuel > 0 ? Math.min(100, (depense / b.montantMensuel) * 100) : 0
      return {
        ...b,
        depense,
        pourcentage,
        restant: Math.max(0, b.montantMensuel - depense),
        depasse: depense > b.montantMensuel,
        label: CATEGORIES[b.categorie]?.label || b.categorie,
        couleur: CATEGORIES[b.categorie]?.couleur || '#6b7280',
      }
    })
    .sort((a, b) => b.pourcentage - a.pourcentage)
}

export function getStatsGlobales(transactions) {
  // Solde de tous les temps
  const totalRevenus = transactions.filter(t => t.type === 'revenu').reduce((s, t) => s + t.montant, 0)
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0)
  return { totalRevenus, totalDepenses, solde: totalRevenus - totalDepenses }
}

export function getObjectifProgression(goal) {
  const pct = goal.montantCible > 0 ? (goal.montantActuel / goal.montantCible) * 100 : 0
  const restant = Math.max(0, goal.montantCible - goal.montantActuel)
  const jours = goal.dateEcheance
    ? Math.max(0, Math.ceil((new Date(goal.dateEcheance) - new Date()) / 86400000))
    : null
  const moisRestants = jours ? jours / 30 : null
  const mensualiteRequise = moisRestants && moisRestants > 0 ? restant / moisRestants : null
  return { pct: Math.min(100, pct), restant, jours, mensualiteRequise }
}

export function getTop5Categories(transactions, moisCourant, moisPrecedent) {
  const depCourantes  = transactions.filter(t => t.type === 'depense' && t.date?.startsWith(moisCourant))
  const depPrecedentes = transactions.filter(t => t.type === 'depense' && t.date?.startsWith(moisPrecedent))

  const mapCourant = {}
  for (const t of depCourantes)   mapCourant[t.categorie]  = (mapCourant[t.categorie]  || 0) + t.montant

  const mapPrecedent = {}
  for (const t of depPrecedentes) mapPrecedent[t.categorie] = (mapPrecedent[t.categorie] || 0) + t.montant

  const total = Object.values(mapCourant).reduce((s, v) => s + v, 0)

  return Object.entries(mapCourant)
    .map(([categorie, montantCourant]) => {
      const montantPrecedent = mapPrecedent[categorie] || 0
      return {
        categorie,
        label:      CATEGORIES[categorie]?.label   ?? categorie,
        couleur:    CATEGORIES[categorie]?.couleur  ?? '#6b7280',
        montantCourant,
        montantPrecedent,
        evolution:  montantPrecedent > 0
          ? ((montantCourant - montantPrecedent) / montantPrecedent) * 100
          : null,
        pourcentage: total > 0 ? (montantCourant / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.montantCourant - a.montantCourant)
    .slice(0, 5)
}

export function getBudgetAlerts(transactions, budgets, moisCourant) {
  return getProgressionBudgets(transactions, budgets, moisCourant)
    .map(b => ({
      ...b,
      pourcentageReel: b.montantMensuel > 0 ? (b.depense / b.montantMensuel) * 100 : 0,
      depassement: Math.max(0, b.depense - b.montantMensuel),
      statut: b.depasse ? 'depasse' : 'danger',
    }))
    .filter(b => b.depasse || b.pourcentage >= 80)
    .sort((a, b) => {
      if (a.depasse !== b.depasse) return a.depasse ? -1 : 1
      return b.pourcentageReel - a.pourcentageReel
    })
}

export function getKpiTendance(transactions, moisCourant) {
  const moisPrecedent = format(subMonths(parseISO(moisCourant + '-01'), 1), 'yyyy-MM')
  const data6Mois = getDonnees6Mois(transactions)

  const curr = {
    revenus:  getTotalRevenus(transactions, moisCourant),
    depenses: getTotalDepenses(transactions, moisCourant),
    solde:    getSoldeNet(transactions, moisCourant),
    epargne:  getTauxEpargne(transactions, moisCourant),
  }
  const prev = {
    revenus:  getTotalRevenus(transactions, moisPrecedent),
    depenses: getTotalDepenses(transactions, moisPrecedent),
    solde:    getSoldeNet(transactions, moisPrecedent),
    epargne:  getTauxEpargne(transactions, moisPrecedent),
  }

  const pct = (c, p) => p === 0 ? null : ((c - p) / Math.abs(p)) * 100

  return {
    revenus:  { tendance: pct(curr.revenus,  prev.revenus),  spark: data6Mois.map(d => d.revenus) },
    depenses: { tendance: pct(curr.depenses, prev.depenses), spark: data6Mois.map(d => d.depenses) },
    solde:    { tendance: pct(curr.solde,    prev.solde),    spark: data6Mois.map(d => d.revenus - d.depenses) },
    epargne:  {
      tendance: pct(curr.epargne, prev.epargne),
      spark: data6Mois.map(d =>
        d.revenus === 0 ? 0 : Math.max(0, ((d.revenus - d.depenses) / d.revenus) * 100)
      ),
    },
  }
}

export function getEvolutionCategorie(transactions, categorie, horizonMois = 6) {
  const today = new Date()
  const result = []
  for (let i = horizonMois - 1; i >= 0; i--) {
    const mois = format(subMonths(today, i), 'yyyy-MM')
    const montant = transactions
      .filter(t => t.categorie === categorie && t.date?.startsWith(mois))
      .reduce((sum, t) => sum + t.montant, 0)
    result.push({ mois, montant })
  }
  return result
}

export function getKpiCategorie(transactions, categorie, horizonMois = 6) {
  const today = new Date()
  const moisCourant   = format(today, 'yyyy-MM')
  const moisPrecedent = format(subMonths(today, 1), 'yyyy-MM')

  const evolution = getEvolutionCategorie(transactions, categorie, horizonMois)
  const total = evolution.reduce((sum, d) => sum + d.montant, 0)
  const moyenne = horizonMois > 0 ? total / horizonMois : 0

  const montantMoisCourant   = evolution.find(d => d.mois === moisCourant)?.montant ?? 0
  const montantMoisPrecedent = evolution.find(d => d.mois === moisPrecedent)?.montant ?? 0

  const variationPct = montantMoisPrecedent === 0
    ? null
    : ((montantMoisCourant - montantMoisPrecedent) / montantMoisPrecedent) * 100

  return { total, moyenne, variationPct, montantMoisCourant, montantMoisPrecedent }
}

// Looks back up to 12 months to find completed months with data.
// Data older than 12 months is excluded — callers with very sparse history may get [].
export function getProjectionsMensuelles(transactions, horizonMois = 6) {
  const today = new Date()
  const moisCourant = format(today, 'yyyy-MM')

  // Collect completed months (before current, with ≥1 transaction), most recent first
  const moisComplets = []
  for (let i = 1; i <= 12; i++) {
    const mois = format(subMonths(today, i), 'yyyy-MM')
    if (transactions.some(t => t.date?.startsWith(mois))) {
      moisComplets.push(mois)
    }
  }

  if (moisComplets.length === 0) return []

  const N = Math.min(3, moisComplets.length)
  const moisPourMoyenne = moisComplets.slice(0, N)
  const moyenneRevenus  = moisPourMoyenne.reduce((s, m) => s + getTotalRevenus(transactions, m), 0) / N
  const moyenneDepenses = moisPourMoyenne.reduce((s, m) => s + getTotalDepenses(transactions, m), 0) / N

  // Window: 2 past + 1 current + (max(horizonMois,4) - 3) future
  const totalBars = Math.max(horizonMois, 4)
  const nFuture   = totalBars - 3

  const result = []

  // 2 context months (always real data)
  for (let i = 2; i >= 1; i--) {
    const mois = format(subMonths(today, i), 'yyyy-MM')
    result.push({
      mois,
      revenus:  getTotalRevenus(transactions, mois),
      depenses: getTotalDepenses(transactions, mois),
      estProjection: false,
    })
  }

  // Current month (real data)
  result.push({
    mois: moisCourant,
    revenus:  getTotalRevenus(transactions, moisCourant),
    depenses: getTotalDepenses(transactions, moisCourant),
    estProjection: false,
  })

  // Future months (projected average)
  for (let i = 1; i <= nFuture; i++) {
    const mois = format(addMonths(today, i), 'yyyy-MM')
    result.push({
      mois,
      revenus:  Math.round(moyenneRevenus),
      depenses: Math.round(moyenneDepenses),
      estProjection: true,
    })
  }

  return result
}
