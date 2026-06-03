/**
 * KPICard — gradient card with icon, value, trend indicator, and decorative depth.
 *
 * Props:
 *   titre      — label above the value (string)
 *   valeur     — main metric (formatted string)
 *   sousTitre  — small text below the value (string)
 *   gradient   — [fromHex, toHex] e.g. ['#059669','#10b981']
 *   icon       — SVG JSX element (white, 20×20)
 *   tendance   — number in % (positive = up, negative = down, undefined = hidden)
 */
export function KPICard({
  titre,
  valeur,
  sousTitre,
  gradient = ['#4f46e5', '#6366f1'],
  icon,
  tendance,
}) {
  const [from, to] = gradient
  const trendUp = tendance !== undefined && tendance >= 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white flex flex-col gap-3"
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 8px 24px -4px ${from}55, 0 2px 8px -2px ${from}30`,
      }}
    >
      {/* ── Decorative depth circles ─────────────────────── */}
      <div
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.10)' }}
        aria-hidden="true"
      />
      <div
        className="absolute right-6 bottom-[-30px] w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        aria-hidden="true"
      />
      <div
        className="absolute left-[-20px] bottom-[-20px] w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.07)' }}
        aria-hidden="true"
      />

      {/* ── Icon + Trend badge ──────────────────────────── */}
      <div className="relative z-10 flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
        >
          {icon}
        </div>

        {tendance !== undefined && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full leading-none"
            style={{
              background: trendUp ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label={`Tendance : ${trendUp ? '+' : '-'}${Math.abs(tendance).toFixed(1)}%`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {trendUp
                ? <path d="M7 17l5-5 5 5M7 11l5-5 5 5" />
                : <path d="M7 7l5 5 5-5M7 13l5 5 5-5" />
              }
            </svg>
            {Math.abs(tendance).toFixed(1)}%
          </span>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10">
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.14em] mb-1 leading-none">
          {titre}
        </p>
        <p className="text-[1.65rem] font-black text-white leading-tight tracking-tight tabular-nums">
          {valeur}
        </p>
        {sousTitre && (
          <p className="text-white/50 text-xs mt-1.5 font-medium leading-tight">
            {sousTitre}
          </p>
        )}
      </div>
    </div>
  )
}
