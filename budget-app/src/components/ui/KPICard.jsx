function Sparkline({ data }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 100
  const H = 28
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(' ')
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, display: 'block' }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KPICard({
  titre,
  valeur,
  sousTitre,
  gradient = ['#4f46e5', '#6366f1'],
  icon,
  tendance,
  sparkData,
}) {
  const [from, to] = gradient
  const trendUp = tendance !== undefined && tendance !== null && tendance >= 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white flex flex-col gap-3"
      style={{
        background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 12px 32px -6px ${from}60, 0 4px 12px -2px ${from}35`,
      }}
    >
      {/* ── Large background circle top-right ────────────── */}
      <div
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.09)' }}
        aria-hidden="true"
      />
      <div
        className="absolute right-4 bottom-[-36px] w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.05)' }}
        aria-hidden="true"
      />
      <div
        className="absolute left-[-24px] bottom-[-24px] w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.10)' }}
        aria-hidden="true"
      />

      {/* ── Top shine line ───────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* ── Glass highlight overlay ───────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%)' }}
        aria-hidden="true"
      />

      {/* ── Icon + Trend badge ──────────────────────────── */}
      <div className="relative z-10 flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.20)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          {icon}
        </div>

        {tendance !== undefined && tendance !== null && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full leading-none"
            style={{
              background: trendUp ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
              backdropFilter: 'blur(6px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            aria-label={`Tendance : ${trendUp ? '+' : ''}${tendance.toFixed(1)}%`}
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
        <p className="text-white/55 text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5 leading-none">
          {titre}
        </p>
        <p
          className="font-display text-white leading-none tabular-nums"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)', fontWeight: 800 }}
        >
          {valeur}
        </p>
        {sousTitre && (
          <p className="text-white/45 text-[11px] mt-2 font-medium leading-tight">
            {sousTitre}
          </p>
        )}
      </div>

      {/* ── Sparkline ───────────────────────────────────── */}
      {sparkData?.length >= 2 && (
        <div className="relative z-10 -mx-1 -mb-1">
          <Sparkline data={sparkData} />
        </div>
      )}
    </div>
  )
}
