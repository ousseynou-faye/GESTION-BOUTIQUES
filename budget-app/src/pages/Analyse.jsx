import { useState, useMemo, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBudget } from '@/context/BudgetContext'
import { CATEGORIES } from '@/constants/categories'
import { getEvolutionCategorie, getKpiCategorie } from '@/utils/calculations'
import { useFormatMontant } from '@/utils/useFormatMontant'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

function AnalyseTooltip({ active, payload, label }) {
  const fmt = useFormatMontant()
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[160px]"
      style={{
        background: 'rgba(10,12,28,0.95)',
        border: '1px solid rgba(129,140,248,0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <p
        className="font-bold text-slate-300 mb-2 pb-1.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {label}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">{p.name}</span>
          <span className="font-bold text-white tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analyse() {
  const { state } = useBudget()
  const fmt = useFormatMontant()

  const [mode, setMode]                       = useState('depense')
  const [categorieActive, setCategorieActive] = useState(null)
  const [horizon, setHorizon]                 = useState(6)

  const moisCourant = format(new Date(), 'yyyy-MM')

  // Catégories actives : celles du mode sélectionné ayant ≥1 transaction sur la période
  const categoriesActives = useMemo(() => {
    return Object.entries(CATEGORIES)
      .filter(([, cat]) => cat.type === mode)
      .map(([key, cat]) => {
        const evolution = getEvolutionCategorie(state.transactions, key, horizon)
        const total = evolution.reduce((s, d) => s + d.montant, 0)
        return { key, label: cat.label, couleur: cat.couleur, total }
      })
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [state.transactions, mode, horizon])

  // Auto-sélectionner la première catégorie disponible
  useEffect(() => {
    if (categoriesActives.length === 0) {
      setCategorieActive(null)
      return
    }
    const exists = categoriesActives.some(c => c.key === categorieActive)
    if (!exists) setCategorieActive(categoriesActives[0].key)
  }, [categoriesActives, categorieActive])

  // Données du graphique pour la catégorie active
  const evolution = useMemo(
    () => categorieActive ? getEvolutionCategorie(state.transactions, categorieActive, horizon) : [],
    [state.transactions, categorieActive, horizon]
  )

  const chartData = useMemo(
    () => evolution.map(d => ({
      ...d,
      label: format(parseISO(d.mois + '-01'), 'MMM', { locale: fr }),
    })),
    [evolution]
  )

  const moisCourantLabel = format(new Date(), 'MMM', { locale: fr })

  // KPIs
  const kpi = useMemo(
    () => categorieActive
      ? getKpiCategorie(state.transactions, categorieActive, horizon)
      : { total: 0, moyenne: 0, variationPct: null, montantMoisCourant: 0, montantMoisPrecedent: 0 },
    [state.transactions, categorieActive, horizon]
  )

  // Budget du mois courant pour la catégorie active (dépenses uniquement)
  const budgetActif = useMemo(() => {
    if (mode !== 'depense' || !categorieActive) return null
    return state.budgets.find(b => b.categorie === categorieActive && b.mois === moisCourant) ?? null
  }, [state.budgets, categorieActive, mode, moisCourant])

  const progressionBudget = budgetActif && budgetActif.montantMensuel > 0
    ? Math.min(100, (kpi.montantMoisCourant / budgetActif.montantMensuel) * 100)
    : null

  const categorieInfo = categorieActive ? CATEGORIES[categorieActive] : null
  const couleurCateg  = categorieInfo?.couleur ?? '#818cf8'

  // Couleur tendance : pour dépenses, hausse = mauvais (rouge) ; pour revenus, hausse = bon (vert)
  const tendanceCouleur = kpi.variationPct === null
    ? '#64748b'
    : mode === 'depense'
      ? kpi.variationPct > 0 ? '#fb7185' : '#34d399'
      : kpi.variationPct > 0 ? '#34d399' : '#fb7185'

  if (categoriesActives.length === 0) {
    return (
      <EmptyState
        titre="Aucune transaction trouvée"
        message="Ajoutez des transactions pour voir les tendances par catégorie."
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

          {/* Header row */}
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
                Analyse
              </h1>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Tendances par catégorie · évolution mensuelle
              </p>
            </div>

            {/* Horizon selector */}
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

          {/* Toggle Dépenses / Revenus */}
          <div
            className="flex gap-1 rounded-xl p-1 mb-4 w-fit"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}
          >
            {[
              { value: 'depense', label: 'Dépenses' },
              { value: 'revenu',  label: 'Revenus'  },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={mode === value ? {
                  background: value === 'depense' ? 'rgba(251,113,133,0.85)' : 'rgba(52,211,153,0.85)',
                  color: '#fff',
                  boxShadow: value === 'depense'
                    ? '0 2px 8px rgba(251,113,133,0.35)'
                    : '0 2px 8px rgba(52,211,153,0.35)',
                } : {
                  color: 'var(--text-muted)',
                  background: 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Pills catégories */}
          <div className="flex flex-wrap gap-2">
            {categoriesActives.map(c => (
              <button
                key={c.key}
                onClick={() => setCategorieActive(c.key)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                style={categorieActive === c.key ? {
                  background: c.couleur + 'bf',
                  color: '#fff',
                  boxShadow: `0 2px 8px ${c.couleur}40`,
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-muted)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI tiles ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">

        <div className="rounded-2xl p-3" style={{ background: `${couleurCateg}1a`, border: `1px solid ${couleurCateg}38` }}>
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: `${couleurCateg}99` }}>
            Total · {horizon} mois
          </p>
          <p className="text-lg font-black tabular-nums leading-none" style={{ color: couleurCateg }}>
            {fmt(kpi.total)}
          </p>
          <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {categorieInfo?.label ?? '—'}
          </p>
        </div>

        <div className="rounded-2xl p-3" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.22)' }}>
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(129,140,248,0.6)' }}>
            Moy. / mois
          </p>
          <p className="text-lg font-black tabular-nums leading-none" style={{ color: '#818cf8' }}>
            {fmt(Math.round(kpi.moyenne))}
          </p>
          <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            sur {horizon} mois
          </p>
        </div>

        <div className="rounded-2xl p-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
            vs mois préc.
          </p>
          <p className="text-lg font-black tabular-nums leading-none" style={{ color: tendanceCouleur }}>
            {kpi.variationPct === null
              ? '—'
              : `${kpi.variationPct > 0 ? '↑' : '↓'} ${Math.abs(kpi.variationPct).toFixed(1)}%`}
          </p>
          <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {fmt(kpi.montantMoisPrecedent)} → {fmt(kpi.montantMoisCourant)}
          </p>
        </div>

      </div>

      {/* ── Barre budget (conditionnelle) ───────────────────────────────── */}
      {budgetActif && progressionBudget !== null && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Budget {categorieInfo?.label} — {format(parseISO(moisCourant + '-01'), 'MMMM yyyy', { locale: fr })}
            </span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: couleurCateg }}>
              {fmt(kpi.montantMoisCourant)} / {fmt(budgetActif.montantMensuel)} · {Math.round(progressionBudget)}%
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)', height: '6px' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressionBudget}%`,
                background: progressionBudget >= 100
                  ? '#fb7185'
                  : progressionBudget >= 80
                    ? 'linear-gradient(90deg,#fbbf24,#fb7185)'
                    : 'linear-gradient(90deg,#34d399,#818cf8)',
                boxShadow: progressionBudget >= 80 ? '0 0 6px rgba(251,113,133,0.4)' : 'none',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Dépensé</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              Reste : {fmt(Math.max(0, budgetActif.montantMensuel - kpi.montantMoisCourant))}
            </span>
          </div>
        </div>
      )}

      {/* ── AreaChart ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        {/* Légende */}
        <div
          className="px-5 py-3 flex items-center gap-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-[2px] rounded-full" style={{ background: couleurCateg }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {categorieInfo?.label ?? 'Catégorie'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="6">
              <line x1="0" y1="3" x2="16" y2="3" stroke="rgba(129,140,248,0.55)" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Moyenne</span>
          </div>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={couleurCateg} stopOpacity={0.28} />
                  <stop offset="85%"  stopColor={couleurCateg} stopOpacity={0.03} />
                </linearGradient>
              </defs>
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
                content={<AnalyseTooltip />}
                cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
              />
              <ReferenceLine
                y={Math.round(kpi.moyenne)}
                stroke="rgba(129,140,248,0.45)"
                strokeDasharray="5 3"
                label={{
                  value: `moy. ${Math.round(kpi.moyenne / 1000)}k`,
                  position: 'insideTopLeft',
                  fill: 'rgba(129,140,248,0.6)',
                  fontSize: 9,
                }}
              />
              <ReferenceLine
                x={moisCourantLabel}
                stroke="rgba(129,140,248,0.2)"
                strokeDasharray="4 3"
              />
              <Area
                type="monotone"
                dataKey="montant"
                name={categorieInfo?.label ?? 'Montant'}
                stroke={couleurCateg}
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 4, fill: couleurCateg, stroke: couleurCateg, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Note informative ────────────────────────────────────────────── */}
      <div
        className="flex gap-3 items-start px-4 py-3 rounded-xl"
        style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)' }}
      >
        <span style={{ color: 'rgba(129,140,248,0.6)', fontSize: '13px', lineHeight: 1.4 }}>ℹ</span>
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(129,140,248,0.55)' }}>
          La barre budget n&apos;apparaît que si un budget est défini pour cette catégorie ce mois-ci.
        </p>
      </div>

    </div>
  )
}
