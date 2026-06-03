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
      style={{ background: 'linear-gradient(160deg, #050819 0%, #07091f 50%, #0a0d28 100%)' }}
      role="complementary"
      aria-label="Navigation principale"
    >
      {/* ── Top prismatic accent ────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.7) 40%, rgba(167,139,250,0.9) 60%, rgba(129,140,248,0.7) 80%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* ── Ambient glow top-left ───────────────────────── */}
      <div
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 10% 0%, rgba(99,102,241,0.12) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      {/* ── Ambient glow bottom-right ───────────────────── */}
      <div
        className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 90% 100%, rgba(139,92,246,0.08) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      {/* ── Brand ──────────────────────────────────────── */}
      <div className="flex items-center gap-3.5 px-5 pt-7 pb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c6af7, #6366f1)',
            boxShadow: '0 0 0 1px rgba(124,106,247,0.3), 0 6px 20px rgba(99,102,241,0.5)',
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
          <p className="font-display text-white font-bold text-[15px] leading-tight tracking-tight">Budget Pro</p>
          <p className="text-indigo-400/50 text-[10px] mt-0.5 leading-tight tracking-[0.12em] uppercase font-medium">Gestion financière</p>
        </div>
      </div>

      {/* ── Nav label ──────────────────────────────────── */}
      <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.22em] px-5 mb-2">
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
              background: 'linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 100%)',
              borderLeft: '2px solid rgba(129,140,248,0.85)',
            } : {}}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium',
                'transition-all duration-200 group relative',
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon */}
                <span
                  className={[
                    'flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-indigo-300' : 'text-slate-600 group-hover:text-slate-400',
                  ].join(' ')}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span className="leading-tight tracking-tight flex-1">{item.label}</span>

                {/* Active glow dot */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: '#818cf8',
                      boxShadow: '0 0 8px rgba(129,140,248,0.9)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ────────────────────────────────────── */}
      <div
        className="mx-5 my-2"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        aria-hidden="true"
      />

      {/* ── Theme toggle ───────────────────────────────── */}
      <div className="px-3 mb-2">
        <button
          onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
          aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all duration-200"
        >
          <span className="text-slate-600">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </span>
          <span className="font-medium">{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
      </div>

      {/* ── User card ──────────────────────────────────── */}
      <div className="px-3 pb-5">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer group transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
              boxShadow: '0 2px 10px rgba(244,63,94,0.30)',
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
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
