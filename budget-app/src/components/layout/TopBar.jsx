import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'
import { getSoldeNet, getTauxEpargne } from '@/utils/calculations'
import { formatPourcentage } from '@/utils/formatters'
import { useFormatMontant } from '@/utils/useFormatMontant'

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
  const fmt = useFormatMontant()
  const { state, dispatch } = useBudget()
  const location = useLocation()
  const isDark    = state.settings.theme === 'dark'
  const pageTitle = pageTitles[location.pathname] ?? 'Budget Pro'

  const mois    = state.settings.moisCourant
  const solde   = useMemo(() => getSoldeNet(state.transactions, mois),    [state.transactions, mois])
  const epargne = useMemo(() => getTauxEpargne(state.transactions, mois), [state.transactions, mois])

  return (
    <div className="md:hidden sticky top-0 z-40">
      {/* ── Barre principale ── */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: 'var(--bg-topbar)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderColor: 'var(--border-topbar)',
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
              fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
              <path d="M21 12h-5a2 2 0 000 4h5" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="leading-tight font-bold tracking-[0.18em] uppercase text-[9px]"
              style={{ color: 'rgba(99,102,241,0.7)' }}>
              Budget Pro
            </p>
            <p className="font-display text-sm font-bold truncate leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              {pageTitle}
            </p>
          </div>
        </div>

        {/* Toggle thème */}
        <button
          onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
          aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-subtle)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── Bande contextuelle Dashboard ── */}
      {location.pathname === '/' && (
        <div
          className="flex items-center justify-around px-6 py-2 border-b"
          style={{
            background: 'rgba(99,102,241,0.04)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-dimmed)' }}>Solde</span>
            <span className="font-display text-[13px] font-bold tabular-nums"
              style={{ color: solde >= 0 ? '#34d399' : '#fb7185' }}>
              {fmt(solde)}
            </span>
          </div>
          <div className="w-px h-6" style={{ background: 'var(--border-separator)' }} aria-hidden="true" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-dimmed)' }}>Épargne</span>
            <span className="font-display text-[13px] font-bold tabular-nums"
              style={{ color: '#818cf8' }}>
              {formatPourcentage(epargne)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
