import { NavLink } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'

const navItems = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v9l5 3" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function Sidebar() {
  const { state, dispatch } = useBudget()
  const isDark = state.settings.theme === 'dark'

  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1424 0%, #0f172a 35%, #131a30 65%, #1c1840 100%)' }}
      role="complementary"
      aria-label="Navigation principale"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 50%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* Subtle radial glow in top-left */}
      <div
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* ── Brand ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
          }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-[15px] tracking-wide leading-tight">Budget Pro</p>
          <p className="text-slate-500 text-[10px] mt-0.5 leading-tight tracking-wide">Gestion financière</p>
        </div>
      </div>

      {/* ── Nav section label ──────────────────────────── */}
      <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.18em] px-6 mb-1.5">
        Navigation
      </p>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5" aria-label="Menu principal">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium',
                'transition-all duration-200 group relative',
                isActive
                  ? 'bg-white/[0.09] text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #a5b4fc, #6366f1)' }}
                    aria-hidden="true"
                  />
                )}

                {/* Icon */}
                <span
                  className={[
                    'flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400',
                  ].join(' ')}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="leading-tight tracking-tight">{item.label}</span>

                {/* Active dot */}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#818cf8', boxShadow: '0 0 6px rgba(99,102,241,0.7)' }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="mx-5 border-t border-white/[0.06] my-2" aria-hidden="true" />

      {/* ── Theme toggle ───────────────────────────────── */}
      <div className="px-3 mb-2">
        <button
          onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
          aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className={[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px]',
            'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]',
            'transition-all duration-200',
          ].join(' ')}
        >
          <span className="text-slate-600">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </span>
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
      </div>

      {/* ── User card ──────────────────────────────────── */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.07] rounded-xl px-3 py-2.5 border border-white/[0.05] transition-colors cursor-pointer group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
              boxShadow: '0 2px 8px rgba(244,63,94,0.28)',
            }}
            aria-hidden="true"
          >
            BP
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-300 text-xs font-semibold truncate leading-tight">Mon Compte</p>
            <p className="text-slate-600 text-[10px] truncate leading-tight mt-0.5">Gestion personnelle</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
