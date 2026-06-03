import { useLocation } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'

const pageTitles = {
  '/':             'Tableau de bord',
  '/transactions': 'Transactions',
  '/budgets':      'Budgets',
  '/graphiques':   'Graphiques',
  '/objectifs':    'Objectifs',
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function TopBar() {
  const { state, dispatch } = useBudget()
  const location = useLocation()
  const isDark    = state.settings.theme === 'dark'
  const pageTitle = pageTitles[location.pathname] ?? 'Budget Pro'

  return (
    <header
      className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: isDark ? 'rgba(6,11,24,0.94)' : 'rgba(241,245,249,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
      }}
    >
      {/* Logo + titre de page */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 2px 10px rgba(99,102,241,0.40)',
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-indigo-500 dark:text-indigo-400/70 leading-tight font-bold tracking-[0.18em] uppercase">
            Budget Pro
          </p>
          <p className="font-display text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
            {pageTitle}
          </p>
        </div>
      </div>

      {/* Toggle thème */}
      <button
        onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
        aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}
