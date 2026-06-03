import { useMemo, useState } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { getDonnees12Mois, getDepensesParCategoriePieData, getSoldesCumulatifs } from '@/utils/calculations'
import { formatMoisCourt, formatMontant } from '@/utils/formatters'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, ReferenceLine,
} from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'

const ONGLETS = [
  {
    key:   'depenses',
    label: 'Dépenses',
    desc:  'Par catégorie',
    color: '#f43f5e',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    key:   'mensuel',
    label: 'Mensuel',
    desc:  '12 derniers mois',
    color: '#34d399',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key:   'solde',
    label: 'Solde',
    desc:  'Évolution cumulative',
    color: '#818cf8',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
]

// ─── Stat mini card ───────────────────────────────────────────────────────────
function StatMini({ label, value, color }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 rounded-2xl flex-1 min-w-[140px]"
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}22`,
      }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: `${color}aa` }}>{label}</p>
      <p className="font-display text-[15px] font-extrabold tabular-nums leading-tight"
        style={{ color: 'rgba(226,232,240,0.92)' }}>
        {value}
      </p>
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
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
      {label && (
        <p className="font-display font-bold text-slate-300 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {label}
        </p>
      )}
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-400">{p.name || p.dataKey}</span>
          </div>
          <span className="font-display font-extrabold text-white tabular-nums">
            {formatMontant(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, legend, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0b0e1c',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[13px] font-extrabold leading-tight"
            style={{ color: 'rgba(226,232,240,0.92)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>{subtitle}</p>
          )}
        </div>
        {legend && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {legend}
          </div>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

export default function Charts() {
  const { state } = useBudget()
  const [onglet, setOnglet] = useState('depenses')
  const mois = state.settings.moisCourant
  const isDark = state.settings.theme === 'dark'

  const pieData  = useMemo(() => getDepensesParCategoriePieData(state.transactions, mois), [state.transactions, mois])
  const barData  = useMemo(
    () => getDonnees12Mois(state.transactions).map(d => ({ ...d, label: formatMoisCourt(d.mois) })),
    [state.transactions]
  )
  const lineData = useMemo(() => getSoldesCumulatifs(state.transactions), [state.transactions])

  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const axisColor  = isDark ? 'rgba(100,116,139,0.7)'  : '#94a3b8'
  const axisStyle  = { fontSize: 11, fill: axisColor }
  const cursorFill = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.8)'

  const totalDepensesMois = pieData.reduce((s, d) => s + d.value, 0)
  const totalRevenus12    = barData.reduce((s, d) => s + d.revenus, 0)
  const totalDepenses12   = barData.reduce((s, d) => s + d.depenses, 0)
  const soldeActuel       = lineData.length > 0 ? lineData[lineData.length - 1].solde : 0
  const soldeMini         = lineData.length > 0 ? Math.min(...lineData.map(d => d.solde)) : 0

  const activeTab = ONGLETS.find(o => o.key === onglet)

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>Graphiques</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
          Analysez vos données financières visuellement
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="grid grid-cols-3 gap-3" role="tablist" aria-label="Sélectionner un graphique">
        {ONGLETS.map(o => {
          const isActive = onglet === o.key
          return (
            <button
              key={o.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${o.key}`}
              id={`tab-${o.key}`}
              onClick={() => setOnglet(o.key)}
              className="relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all duration-200 focus:outline-none overflow-hidden"
              style={isActive ? {
                background: 'linear-gradient(145deg, #050818 0%, #0a0d24 50%, #0d0a2e 100%)',
                boxShadow: `0 8px 24px rgba(5,8,24,0.4), 0 2px 8px ${o.color}22`,
                border: `1px solid ${o.color}30`,
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'none',
              }}
            >
              {/* Prismatic top line for active */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${o.color}99, ${o.color}, ${o.color}99, transparent)` }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
                style={isActive ? {
                  background: `${o.color}18`,
                  color: o.color,
                  boxShadow: `0 0 14px ${o.color}33`,
                } : {
                  color: 'rgba(100,116,139,0.6)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                {o.icon}
              </span>

              <div className="text-center">
                <p
                  className="font-display text-[13px] font-bold leading-tight"
                  style={{ color: isActive ? '#fff' : '#64748b' }}
                >
                  {o.label}
                </p>
                <p
                  className="text-[10px] font-medium mt-0.5"
                  style={{ color: isActive ? `${o.color}88` : '#94a3b8' }}
                >
                  {o.desc}
                </p>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: o.color, boxShadow: `0 0 8px ${o.color}` }}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Dépenses par catégorie ── */}
      {onglet === 'depenses' && (
        <div id="panel-depenses" role="tabpanel" aria-labelledby="tab-depenses" className="flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <StatMini label="Total dépenses ce mois" value={formatMontant(totalDepensesMois)} color="#fb7185" />
            <StatMini label="Catégories actives" value={`${pieData.length}`} color="#818cf8" />
            {pieData.length > 0 && (
              <StatMini
                label="Catégorie principale"
                value={[...pieData].sort((a, b) => b.value - a.value)[0]?.name || '—'}
                color={[...pieData].sort((a, b) => b.value - a.value)[0]?.couleur || '#818cf8'}
              />
            )}
          </div>

          <ChartCard
            title="Répartition des dépenses"
            subtitle={`Mois de ${mois}`}
          >
            <div>
              {pieData.length === 0 ? (
                <EmptyState
                  titre="Aucune dépense ce mois"
                  message="Ajoutez des transactions pour voir ce graphique."
                />
              ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Pie */}
                  <div className="w-full lg:w-64 lg:flex-shrink-0">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          outerRadius={110} innerRadius={58}
                          dataKey="value"
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {pieData.map(e => (
                            <Cell
                              key={e.key}
                              fill={e.couleur}
                              stroke="transparent"
                              style={{ filter: `drop-shadow(0 2px 6px ${e.couleur}44)` }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend bars */}
                  <div className="flex flex-col gap-3 w-full flex-1">
                    {[...pieData].sort((a, b) => b.value - a.value).map(d => {
                      const total = pieData.reduce((s, x) => s + x.value, 0)
                      const pct   = total > 0 ? (d.value / total) * 100 : 0
                      return (
                        <div key={d.key} className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: d.couleur, boxShadow: `0 0 6px ${d.couleur}88` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center text-[11px] mb-1.5">
                              <span className="font-semibold truncate" style={{ color: 'rgba(148,163,184,0.85)' }}>
                                {d.name}
                              </span>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                <span className="tabular-nums" style={{ color: 'rgba(100,116,139,0.7)' }}>
                                  {formatMontant(d.value)}
                                </span>
                                <span
                                  className="font-display text-[11px] font-extrabold w-9 text-right tabular-nums"
                                  style={{ color: d.couleur }}
                                >
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: `${d.couleur}15` }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: d.couleur,
                                  boxShadow: `0 0 6px ${d.couleur}66`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Revenus vs Dépenses mensuel ── */}
      {onglet === 'mensuel' && (
        <div id="panel-mensuel" role="tabpanel" aria-labelledby="tab-mensuel" className="flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <StatMini label="Revenus 12 mois"  value={formatMontant(totalRevenus12)}  color="#34d399" />
            <StatMini label="Dépenses 12 mois" value={formatMontant(totalDepenses12)} color="#fb7185" />
            <StatMini
              label="Épargne nette"
              value={formatMontant(totalRevenus12 - totalDepenses12)}
              color={totalRevenus12 >= totalDepenses12 ? '#818cf8' : '#fb923c'}
            />
          </div>

          <ChartCard
            title="Revenus vs Dépenses"
            subtitle="Comparaison sur 12 mois"
            legend={
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#34d399', boxShadow: '0 0 6px #34d39988' }} aria-hidden="true" />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.7)' }}>Revenus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#fb7185', boxShadow: '0 0 6px #fb718588' }} aria-hidden="true" />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.7)' }}>Dépenses</span>
                </div>
              </>
            }
          >
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} tickFormatter={v => v.toLocaleString('fr-FR')} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill, radius: 8 }} />
                <Bar dataKey="revenus"  name="Revenus"  fill="#34d399" radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="depenses" name="Dépenses" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Solde cumulatif ── */}
      {onglet === 'solde' && (
        <div id="panel-solde" role="tabpanel" aria-labelledby="tab-solde" className="flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <StatMini label="Solde actuel"  value={formatMontant(soldeActuel)} color={soldeActuel >= 0 ? '#818cf8' : '#fb7185'} />
            <StatMini label="Solde minimum" value={formatMontant(soldeMini)}   color={soldeMini  >= 0 ? '#34d399' : '#fb923c'} />
            <StatMini label="Transactions"  value={`${state.transactions.length}`} color="#94a3b8" />
          </div>

          <ChartCard
            title="Évolution du solde cumulatif"
            subtitle="Depuis la première transaction enregistrée"
          >
            {lineData.length === 0 ? (
              <EmptyState
                titre="Pas de données"
                message="Ajoutez des transactions pour voir l'évolution de votre solde."
              />
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} tickFormatter={v => v.toLocaleString('fr-FR')} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={0}
                    stroke="#fb7185"
                    strokeDasharray="5 4"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="solde"
                    name="Solde"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fill="url(#soldeGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#818cf8', stroke: isDark ? '#0b0e1c' : '#fff', strokeWidth: 2.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  )
}
