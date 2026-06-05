import { useBudget } from '@/context/BudgetContext'
import { formatMontant } from '@/utils/formatters'

export function useFormatMontant() {
  const { state } = useBudget()
  const devise = state.settings.devise ?? 'fcfa'
  return (montant) => formatMontant(montant, devise)
}
