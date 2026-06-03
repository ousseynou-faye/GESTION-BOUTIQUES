/**
 * EmptyState — clean SVG illustration + clear visual hierarchy
 *
 * Props:
 *   titre    — main heading
 *   message  — supporting description
 *   action   — CTA element (button, link, etc.)
 *   icon     — optional JSX override for the illustration
 */
export function EmptyState({ titre, message, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">

      {/* Illustration container */}
      <div className="relative mb-6">
        {/* Ambient glow */}
        <div className="absolute inset-[-6px] rounded-3xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900/20 blur-md" />

        {/* Icon box */}
        <div className="relative w-[72px] h-[72px] rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center shadow-sm">
          {icon ?? <DefaultIllustration />}
        </div>
      </div>

      {/* Text hierarchy */}
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight mb-2 leading-snug">
        {titre}
      </h3>
      {message && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[30ch] leading-relaxed">
          {message}
        </p>
      )}

      {/* CTA */}
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
      className="w-8 h-8 text-slate-300 dark:text-slate-600"
      fill="none"
      viewBox="0 0 48 48"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Document */}
      <rect x="8" y="4" width="28" height="36" rx="3" />
      {/* Lines suggesting data */}
      <path d="M14 16h8M14 22h12M14 28h6" />
      {/* Small bar chart in bottom-right corner */}
      <rect x="26" y="24" width="4" height="8" rx="1" />
      <rect x="32" y="20" width="4" height="12" rx="1" />
    </svg>
  )
}
