import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBudget } from '@/context/BudgetContext'
import { getProjectionsMensuelles } from '@/utils/calculations'
import { useFormatMontant } from '@/utils/useFormatMontant'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// Custom bar shape: dashed+transparent for projections, solid for real data.
// Recharts spreads all data-item fields into shape props, so estProjection is available.
function ProjectionBarShape({ x, y, width, height, fill, estProjection }) {
  if (!height || height <= 0) return null
  return estProjection ? (
    <rect
      x={x} y={y} width={width} height={height}
      fill={`${fill}40`} stroke={fill} strokeWidth={1.5}
      strokeDasharray="4 3" rx={3}
    />
  ) : (
    <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} rx={3} />
  )
}

function ProjectionTooltip({ active, payload, label }) {
  const fmt = useFormatMontant()
  if (!active || !payload?.length) return null
  const estProjection = payload[0]?.payload?.estProjection
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[170px]"
      style={{
        background: 'rgba(10,12,28,0.95)',
        border: '1px solid rgba(129,140,248,0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <p
        className="font-bold text-slate-300 mb-2 pb-1.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {label}
        {estProjection && (
          <span style={{ color: '#818cf8', fontSize: '9px', fontWeight: 600 }}>· prévision</span>
        )}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="font-bold text-white tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Projections() {
  const { state } = useBudget()
  const fmt = useFormatMontant()
  const [horizon, setHorizon] = useState(6)

  const effectiveHorizon = Math.max(horizon, 4)

  const rawData = useMemo(
    () => getProjectionsMensuelles(state.transactions, effectiveHorizon),
    [state.transactions, effectiveHorizon]
  )

  // Add abbreviated French month label for X axis
  const chartData = useMemo(
    () => rawData.map(d => ({
      ...d,
      label: format(parseISO(d.mois + '-01'), 'MMM', { locale: fr }),
    })),
    [rawData]
  )

  const moisCourantLabel = format(new Date(), 'MMM', { locale: fr })

  // KPI aggregates
  const totalRevenus    = rawData.reduce((s, d) => s + d.revenus,  0)
  const totalDepenses   = rawData.reduce((s, d) => s + d.depenses, 0)
  const totalEpargne    = totalRevenus - totalDepenses
  const revenuReels     = rawData.filter(d => !d.estProjection).reduce((s, d) => s + d.revenus,  0)
  const depensesReelles = rawData.filter(d => !d.estProjection).reduce((s, d) => s + d.depenses, 0)
  const epargneParMois  = Math.round(totalEpargne / effectiveHorizon)

  if (rawData.length === 0) {
    return (
      <EmptyState
        titre="Pas encore assez de données"
        message="Ajoutez des transactions pour générer des projections."
      />
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, var(--banner-bg-from) 0%, var(--banner-bg-mid) 45%, var(--banner-bg-to) 100%)',
          border: '1px solid var(--banner-border)',
        }}
      >
        <div className="px-5 pt-5 pb-5">

          {/* Header row with horizon selector */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p
                className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1"
                style={{ color: 'var(--text-accent-purple)', opacity: 0.7 }}
              >
                BUDGET PRO
              </p>
              <h1
                className="text-2xl font-black leading-tight tracking-tight"
                style={{ color: 'var(--text-on-banner)' }}
              >
                Projections
              </h1>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Flux mensuel prévisionnel · Moyenne des 3 derniers mois
              </p>
            </div>

            {/* Horizon toggle */}
            <div
              className="flex gap-1 rounded-xl p-1 flex-shrink-0"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}
            >
              {[3, 6, 12].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                  style={horizon === h ? {
                    background: 'rgba(99,102,241,0.9)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                  } : {
                    color: 'var(--text-muted)',
                    background: 'transparent',
                  }}
                >
                  {h} mois
                </button>
              ))}
            </div>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-3 gap-3">

            <div className="rounded-2xl p-3" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(52,211,153,0.6)' }}>
                Revenus prévus · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none" style={{ color: '#34d399' }}>
                {fmt(totalRevenus)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                dont {fmt(revenuReels)} réels
              </p>
            </div>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(251,113,133,0.6)' }}>
                Dépenses prévues · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none" style={{ color: '#fb7185' }}>
                {fmt(totalDepenses)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                dont {fmt(depensesReelles)} réelles
              </p>
            </div>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.22)' }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(129,140,248,0.6)' }}>
                Épargne nette · {effectiveHorizon} mois
              </p>
              <p className="text-lg font-black tabular-nums leading-none"
                style={{ color: totalEpargne >= 0 ? '#a5b4fc' : '#fb7185' }}>
                {totalEpargne >= 0 ? '+' : ''}{fmt(totalEpargne)}
              </p>
              <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                soit ~{fmt(Math.abs(epargneParMois))} / mois
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Chart card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        {/* Legend bar */}
        <div
          className="px-5 py-3 flex items-center gap-5 flex-wrap"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#34d399' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Revenus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb7185' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dépenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: 'rgba(129,140,248,0.3)', border: '1px dashed #818cf8' }}
            />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Prévision</span>
          </div>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barCategoryGap="28%" barGap={3}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 1000)}k`}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<ProjectionTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <ReferenceLine
                x={moisCourantLabel}
                stroke="rgba(99,102,241,0.4)"
                strokeDasharray="4 3"
                label={{ value: 'Auj.', position: 'insideTopRight', fill: '#818cf8', fontSize: 9 }}
              />
              <Bar dataKey="revenus"  name="Revenus"   fill="#34d399" shape={<ProjectionBarShape />} />
              <Bar dataKey="depenses" name="Dépenses"  fill="#fb7185" shape={<ProjectionBarShape />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <div
        className="flex gap-3 items-start px-4 py-3 rounded-xl"
        style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.14)' }}
      >
        <span style={{ color: 'rgba(251,191,36,0.7)', fontSize: '13px', lineHeight: 1.4 }}>ℹ</span>
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.6)' }}>
          Les projections sont des estimations basées sur vos habitudes passées.
        </p>
      </div>

    </div>
  )
}
