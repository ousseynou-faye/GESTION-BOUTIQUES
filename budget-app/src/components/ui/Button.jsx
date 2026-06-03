const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white ' +
    'shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-500/30 ' +
    'focus-visible:ring-indigo-500',
  secondary:
    'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 ' +
    'text-slate-700 dark:text-slate-200 ' +
    'border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 ' +
    'shadow-xs hover:shadow-sm ' +
    'focus-visible:ring-slate-400',
  outline:
    'bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ' +
    'text-indigo-600 dark:text-indigo-400 ' +
    'border border-indigo-300 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 ' +
    'focus-visible:ring-indigo-500',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white ' +
    'shadow-sm shadow-rose-600/20 hover:shadow-md hover:shadow-rose-500/30 ' +
    'focus-visible:ring-rose-500',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 ' +
    'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 ' +
    'focus-visible:ring-slate-400',
  success:
    'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white ' +
    'shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-500/30 ' +
    'focus-visible:ring-emerald-500',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1 h-7',
  sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
  md: 'px-4 py-2 text-sm gap-2 h-9',
  lg: 'px-5 py-2.5 text-sm gap-2.5 h-11',
  xl: 'px-6 py-3 text-base gap-3 h-12',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none',
        'select-none whitespace-nowrap',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
    >
      {loading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Chargement…</span>
        </>
      ) : children}
    </button>
  )
}
