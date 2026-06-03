import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'

const navItems = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

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
  const [isOpen, setIsOpen] = useState(false)
  const { state, dispatch } = useBudget()
  const location = useLocation()
  const isDark    = state.settings.theme === 'dark'
  const pageTitle = pageTitles[location.pathname] ?? 'Budget Pro'

  return (
    <>
      {/* ── Sticky topbar ──────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: isDark ? 'rgba(6,11,24,0.92)' : 'rgba(241,245,249,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
        }}
      >
        {/* Left: logo + page title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
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
            <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight font-medium tracking-wide uppercase">
              Budget Pro
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
              {pageTitle}
            </p>
          </div>
        </div>

        {/* Right: theme toggle + hamburger */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: isDark ? 'light' : 'dark' } })}
            aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" id="mobile-nav">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <nav
            className="relative w-72 h-full shadow-2xl flex flex-col animate-slide-in-right"
            style={{ background: 'linear-gradient(180deg, #0d1424 0%, #0f172a 40%, #131a30 70%, #1a1740 100%)' }}
            role="navigation"
            aria-label="Menu mobile"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
                  aria-hidden="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <span className="text-white font-bold text-[15px] tracking-wide">Budget Pro</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav label */}
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em] px-6 pt-4 pb-2">
              Navigation
            </p>

            {/* Nav items */}
            <div className="flex flex-col gap-0.5 px-3 flex-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium',
                      'transition-all duration-200 relative',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: 'linear-gradient(180deg, #a5b4fc, #6366f1)' }}
                          aria-hidden="true"
                        />
                      )}
                      <span className={isActive ? 'text-indigo-400' : 'text-slate-600'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Bottom: user card */}
            <div className="px-3 pb-6 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-3 py-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)' }}
                  aria-hidden="true"
                >
                  BP
                </div>
                <div className="min-w-0">
                  <p className="text-slate-300 text-xs font-semibold truncate leading-tight">Mon Compte</p>
                  <p className="text-slate-600 text-[10px] truncate leading-tight mt-0.5">Gestion personnelle</p>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
