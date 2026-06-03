import { SEED_TRANSACTIONS, SEED_BUDGETS, SEED_GOALS } from '@/constants/initialState'

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function budgetReducer(state, action) {
  switch (action.type) {
    // ─── Chargement depuis localStorage ───────────────────────────────
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload }

    // ─── Seed data (premier lancement) ────────────────────────────────
    case 'SEED_DATA':
      return {
        ...state,
        transactions: SEED_TRANSACTIONS,
        budgets: SEED_BUDGETS,
        goals: SEED_GOALS,
        seeded: true,
      }

    // ─── Transactions ──────────────────────────────────────────────────
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [
          { ...action.payload, id: makeId('txn'), createdAt: Date.now() },
          ...state.transactions,
        ],
      }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload.id),
      }

    // ─── Budgets ───────────────────────────────────────────────────────
    case 'SET_BUDGET': {
      const exists = state.budgets.find(
        b => b.categorie === action.payload.categorie && b.mois === action.payload.mois
      )
      if (exists) {
        return {
          ...state,
          budgets: state.budgets.map(b =>
            b.categorie === action.payload.categorie && b.mois === action.payload.mois
              ? { ...b, ...action.payload }
              : b
          ),
        }
      }
      return {
        ...state,
        budgets: [...state.budgets, { ...action.payload, id: makeId('bud') }],
      }
    }
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload.id),
      }

    // ─── Objectifs ─────────────────────────────────────────────────────
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, { ...action.payload, id: makeId('goal'), createdAt: Date.now() }],
      }
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g),
      }
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload.id),
      }

    // ─── Paramètres ────────────────────────────────────────────────────
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload.theme } }
    case 'SET_MOIS_COURANT':
      return { ...state, settings: { ...state.settings, moisCourant: action.payload.mois } }

    default:
      return state
  }
}
