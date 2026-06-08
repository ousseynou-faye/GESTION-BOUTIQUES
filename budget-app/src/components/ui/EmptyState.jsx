export function EmptyState({ titre, message, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">

      <div className="relative mb-6">
        {/* Ambient glow */}
        <div
          className="absolute inset-[-8px] rounded-3xl blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.14), transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Icon box */}
        <div
          className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-input)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          {icon ?? <DefaultIllustration />}
        </div>
      </div>

      <h3
        className="text-sm font-bold tracking-tight mb-2 leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {titre}
      </h3>

      {message && (
        <p
          className="text-sm max-w-[30ch] leading-relaxed"
          style={{ color: 'rgba(100,116,139,0.7)' }}
        >
          {message}
        </p>
      )}

      {action && (
        <div className="mt-7">
          {action}
        </div>
      )}
    </div>
  )
}

function DefaultIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 48 48"
      stroke="rgba(99,102,241,0.5)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="4" width="28" height="36" rx="3" />
      <path d="M14 16h8M14 22h12M14 28h6" />
      <rect x="26" y="24" width="4" height="8" rx="1" />
      <rect x="32" y="20" width="4" height="12" rx="1" />
    </svg>
  )
}
