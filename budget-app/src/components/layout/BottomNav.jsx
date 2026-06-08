import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/',
    label: 'Accueil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Txns',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-8" />
      </svg>
    ),
  },
  {
    to: '/graphiques',
    label: 'Charts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
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
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    to: '/objectifs',
    label: 'Objectifs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'var(--bg-bottomnav)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-bottomnav)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch h-16">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-1 relative',
                'text-[10px] font-semibold transition-colors duration-200',
                isActive ? 'text-indigo-400' : 'text-slate-500',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #818cf8, #6366f1, #818cf8, transparent)' }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={[
                    'relative flex items-center justify-center w-9 h-7 rounded-lg transition-all duration-200',
                    isActive ? 'text-indigo-300' : 'text-slate-600',
                  ].join(' ')}
                  style={isActive ? { background: 'rgba(99,102,241,0.15)' } : {}}
                >
                  {item.icon}
                </span>
                <span className="leading-none font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
