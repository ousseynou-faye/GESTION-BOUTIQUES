import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'
import { getSoldeNet, getTauxEpargne } from '@/utils/calculations'
import { useFormatMontant } from '@/utils/useFormatMontant'

const navItems = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    ),
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-8" />
      </svg>
    ),
  },
  {
    to: '/graphiques',
    label: 'Graphiques',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v9l5 3" />
      </svg>
    ),
  },
  {
    to: '/projections',
    label: 'Projections',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    to: '/analyse',
    label: 'Analyse',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
        <line x1="2"  y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[16px] h-[16px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[16px] h-[16px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function Sidebar() {
  const { state, dispatch } = useBudget()
  const fmt = useFormatMontant()
  const isDark = state.settings.theme === 'dark'
  const mois   = state.settings.moisCourant

  const solde = useMemo(() => getSoldeNet(state.transactions, mois),     [state.transactions, mois])
  const taux  = useMemo(() => getTauxEpargne(state.transactions, mois),  [state.transactions, mois])

  const soldePositif = solde >= 0
  const soldeColor   = soldePositif ? '#34d399' : '#fb7185'
  const soldeBg      = soldePositif
    ? 'linear-gradient(135deg, rgba(5,150,105,0.18) 0%, rgba(16,185,129,0.06) 100%)'
    : 'linear-gradient(135deg, rgba(225,29,72,0.18) 0%, rgba(244,63,94,0.06) 100%)'
  const soldeBorder  = soldePositif ? 'rgba(52,211,153,0.18)' : 'rgba(251,113,133,0.18)'

  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0 relative overflow-hidden"
      style={{ background: 'var(--sidebar-bg)' }}
      role="complementary"
      aria-label="Navigation principale"
    >
      {/* ── Top prismatic line ──────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.8) 35%, rgba(196,181,253,1) 50%, rgba(129,140,248,0.8) 65%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* ── Ambient glows ───────────────────────────────── */}
      <div className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 5% 0%, rgba(99,102,241,0.14) 0%, transparent 60%)' }}
        aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-56 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 95% 100%, rgba(139,92,246,0.10) 0%, transparent 60%)' }}
        aria-hidden="true" />

      {/* ── Brand ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c6af7 0%, #5b52e8 100%)',
            boxShadow: '0 0 0 1px rgba(124,106,247,0.35), 0 8px 24px rgba(99,102,241,0.55)',
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
            <path d="M21 12h-5a2 2 0 000 4h5" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-bold text-white leading-tight tracking-tight">Budget Pro</p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mt-0.5"
            style={{ color: 'rgba(129,140,248,0.6)' }}>
            Gestion financière
          </p>
        </div>
      </div>

      {/* ── Solde du mois card ──────────────────────────── */}
      <div className="px-3 mb-4">
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: soldeBg, border: `1px solid ${soldeBorder}` }}
        >
          {/* Decorative circle */}
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: `${soldeColor}12` }} aria-hidden="true" />

          <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: `${soldeColor}99` }}>
            Solde du mois
          </p>
          <p className="font-display font-bold leading-none tabular-nums mb-2"
            style={{ fontSize: '1.5rem', color: soldeColor }}>
            {soldePositif ? '+' : ''}{fmt(solde)}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${soldeColor}18`, color: soldeColor }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={3} aria-hidden="true">
                {soldePositif
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 5 5M7 11l5-5 5 5" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l5 5 5-5M7 13l5 5 5-5" />}
              </svg>
              Épargne {taux.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Nav label ──────────────────────────────────── */}
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] px-5 mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        Navigation
      </p>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5" aria-label="Menu principal">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(79,70,229,0.14) 100%)',
              boxShadow: '0 2px 16px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
              border: '1px solid rgba(129,140,248,0.2)',
            } : { border: '1px solid transparent' }}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium',
                'transition-all duration-200 group',
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon container */}
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(129,140,248,0.25)',
                    boxShadow: '0 0 10px rgba(129,140,248,0.3)',
                    color: '#a5b4fc',
                  } : { color: 'inherit' }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="leading-tight tracking-tight flex-1 font-medium" style={{ color: isActive ? '#fff' : 'var(--sidebar-nav-text)' }}>{item.label}</span>

                {/* Active glow dot */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#818cf8', boxShadow: '0 0 8px rgba(129,140,248,1)' }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="mx-4 my-3"
        style={{ height: '1px', background: 'var(--border-separator)' }}
        aria-hidden="true" />

      {/* ── Theme toggle ───────────────────────────────── */}
      <div className="px-3 mb-2">
        <button
          onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
          aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 group"
          style={{ border: '1px solid transparent', color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-subtle)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = ''
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
            style={{ background: 'var(--bg-subtle)', color: 'inherit' }}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </span>
          <span className="font-medium">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
      </div>

      {/* ── User card ──────────────────────────────────── */}
      <div className="px-3 pb-5">
        <div
          className="flex items-center gap-3 rounded-2xl px-3 py-3 cursor-pointer group transition-all duration-200"
          style={{
            background: 'var(--sidebar-user-bg)',
            border: '1px solid var(--sidebar-user-border)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--sidebar-user-bg)'}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
              boxShadow: '0 3px 12px rgba(244,63,94,0.35)',
            }}
            aria-hidden="true"
          >
            BP
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-300 text-[12px] font-semibold truncate leading-tight">Mon Compte</p>
            <p className="text-[10px] truncate leading-tight mt-0.5"
              style={{ color: 'rgba(100,116,139,0.7)' }}>
              Gestion personnelle
            </p>
          </div>
          <div className="flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--border-card)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-600" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  )
}
