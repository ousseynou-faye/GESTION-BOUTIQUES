const KEYS = {
  transactions: 'budget_transactions',
  budgets: 'budget_budgets',
  goals: 'budget_goals',
  settings: 'budget_settings',
  seeded: 'budget_seeded',
}

export function loadAll() {
  try {
    const transactions = JSON.parse(localStorage.getItem(KEYS.transactions) || 'null')
    const budgets = JSON.parse(localStorage.getItem(KEYS.budgets) || 'null')
    const goals = JSON.parse(localStorage.getItem(KEYS.goals) || 'null')
    const settings = JSON.parse(localStorage.getItem(KEYS.settings) || 'null')
    const seeded = localStorage.getItem(KEYS.seeded) === 'true'

    if (!transactions && !budgets && !goals) return null

    return { transactions: transactions || [], budgets: budgets || [], goals: goals || [], settings, seeded }
  } catch {
    return null
  }
}

export function saveAll(state) {
  try {
    localStorage.setItem(KEYS.transactions, JSON.stringify(state.transactions))
    localStorage.setItem(KEYS.budgets, JSON.stringify(state.budgets))
    localStorage.setItem(KEYS.goals, JSON.stringify(state.goals))
    localStorage.setItem(KEYS.settings, JSON.stringify(state.settings))
    localStorage.setItem(KEYS.seeded, String(state.seeded))
  } catch {
    // localStorage plein ou désactivé
  }
}

export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
}
