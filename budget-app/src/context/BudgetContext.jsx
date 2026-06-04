import { createContext, useContext, useReducer, useEffect } from 'react'
import { budgetReducer } from '@/reducers/budgetReducer'
import { initialState } from '@/constants/initialState'
import { loadAll, saveAll } from '@/utils/storage'
import { format } from 'date-fns'
import { calculerTransactionsAGenerer } from '@/utils/recurrence'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState)

  // Chargement initial depuis localStorage
  useEffect(() => {
    const saved = loadAll()
    if (saved) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: saved })
    } else {
      // Premier lancement : charger les données d'exemple
      dispatch({ type: 'SEED_DATA' })
    }
  }, [])

  // Appliquer le thème sur <html>
  useEffect(() => {
    const root = document.documentElement
    if (state.settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [state.settings.theme])

  // Génération automatique des transactions récurrentes au lancement
  useEffect(() => {
    if (!state.seeded) return
    const moisCourant = format(new Date(), 'yyyy-MM')
    const { nouvelles, majOriginales } = calculerTransactionsAGenerer(
      state.transactions,
      moisCourant
    )
    if (nouvelles.length > 0 || majOriginales.length > 0) {
      dispatch({ type: 'GENERATE_RECURRENTES', payload: { nouvelles, majOriginales } })
    }
  }, [state.seeded])

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    if (state.seeded !== undefined) {
      saveAll(state)
    }
  }, [state])

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget doit être utilisé dans BudgetProvider')
  return ctx
}
