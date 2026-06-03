function ErrorMessage({ msg }) {
  return (
    <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: '#fb7185' }} role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {msg}
    </p>
  )
}

const labelClass = 'block font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 leading-none'

const inputBase = [
  'w-full rounded-xl px-3.5 py-2.5 text-sm font-medium',
  'transition-all duration-200',
  'focus:outline-none',
  'placeholder:font-normal',
].join(' ')

const inputLight = [
  'text-slate-100 placeholder-slate-600',
  'border border-white/[0.08]',
  'hover:border-white/[0.14]',
  'focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/15',
].join(' ')

const inputDark = [].join(' ')

const inputError = [
  'border-rose-500/50',
  'focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/15',
].join(' ')

export function Input({ label, error, helper, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={inputId} className={labelClass} style={{ color: 'rgba(100,116,139,0.8)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          inputBase,
          inputLight,
          inputDark,
          error ? inputError : '',
          'bg-white/[0.04]',
          className,
        ].join(' ')}
        style={error ? {} : {}}
        {...props}
      />
      {error && <span id={`${inputId}-error`}><ErrorMessage msg={error} /></span>}
      {!error && helper && (
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(100,116,139,0.7)' }}>{helper}</p>
      )}
    </div>
  )
}

export function Select({ label, error, helper, children, className = '', id, ...props }) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={selectId} className={labelClass} style={{ color: 'rgba(100,116,139,0.8)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={[
            inputBase,
            inputLight,
            inputDark,
            error ? inputError : '',
            'bg-white/[0.04]',
            'appearance-none pr-9 cursor-pointer',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(100,116,139,0.6)' }} aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && <span id={`${selectId}-error`}><ErrorMessage msg={error} /></span>}
      {!error && helper && (
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(100,116,139,0.7)' }}>{helper}</p>
      )}
    </div>
  )
}
