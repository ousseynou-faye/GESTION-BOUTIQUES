const baseInput = [
  'w-full rounded-xl border bg-white dark:bg-slate-900/80',
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100',
  'placeholder-slate-400/70 dark:placeholder-slate-600',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'transition-all duration-150',
].join(' ')

const normalBorder = [
  'border-slate-200 dark:border-slate-700',
  'hover:border-slate-300 dark:hover:border-slate-600',
  'focus:ring-indigo-500/25 focus:border-indigo-500',
].join(' ')

const errorBorder = [
  'border-rose-400 dark:border-rose-600',
  'hover:border-rose-500 dark:hover:border-rose-500',
  'focus:ring-rose-500/20 focus:border-rose-500',
].join(' ')

const labelClass =
  'block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide leading-none'

function ErrorMessage({ msg }) {
  return (
    <p
      className="text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-0.5"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3.5 h-3.5 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {msg}
    </p>
  )
}

export function Input({ label, error, helper, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${baseInput} ${error ? errorBorder : normalBorder} ${className}`}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`}>
          <ErrorMessage msg={error} />
        </span>
      )}
      {!error && helper && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{helper}</p>
      )}
    </div>
  )
}

export function Select({ label, error, helper, children, className = '', id, ...props }) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={[
            baseInput,
            error ? errorBorder : normalBorder,
            'appearance-none pr-9 cursor-pointer',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        {/* Custom arrow */}
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`}>
          <ErrorMessage msg={error} />
        </span>
      )}
      {!error && helper && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{helper}</p>
      )}
    </div>
  )
}
