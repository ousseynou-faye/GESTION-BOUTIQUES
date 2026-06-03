import { format, parseISO, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatMontant(montant, devise = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant)
}

export function formatDate(dateStr, pattern = 'd MMM yyyy') {
  try {
    return format(parseISO(dateStr), pattern, { locale: fr })
  } catch {
    return dateStr
  }
}

export function formatMois(moisStr) {
  try {
    return format(parseISO(moisStr + '-01'), 'MMMM yyyy', { locale: fr })
  } catch {
    return moisStr
  }
}

export function formatMoisCourt(moisStr) {
  try {
    return format(parseISO(moisStr + '-01'), 'MMM yy', { locale: fr })
  } catch {
    return moisStr
  }
}

export function formatPourcentage(valeur, decimales = 1) {
  return `${valeur.toFixed(decimales)}%`
}

export function joursRestants(dateStr) {
  try {
    return differenceInDays(parseISO(dateStr), new Date())
  } catch {
    return 0
  }
}

export function getMoisCourant() {
  return format(new Date(), 'yyyy-MM')
}
