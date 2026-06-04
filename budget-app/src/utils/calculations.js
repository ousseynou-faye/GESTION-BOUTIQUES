import { parseISO, format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
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
