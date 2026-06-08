import { useBudget } from '@/context/BudgetContext'
import { formatMontant, getDeviseLabel } from '@/utils/formatters'

export function useFormatMontant() {
  const { state } = useBudget()
  const devise = state.settings.devise ?? 'fcfa'
  return (montant) => formatMontant(montant, devise)
}

export function useDeviseLabel() {
  const { state } = useBudget()
  return getDeviseLabel(state.settings.devise ?? 'fcfa')
}
