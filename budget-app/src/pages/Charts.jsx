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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2} aria-hidden="true">
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key:   'solde',
    label: 'Solde',
    desc:  'Évolution cumulative',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
]

function StatMini({ label, value, color }) {
  return (
    <div
      className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border"
      style={{ background: color + '0a', borderColor: color + '22' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">{value}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[160px]">
      {label && (
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          {label}
        </p>
      )}
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{p.name || p.dataKey}</span>
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            {formatMontant(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Charts() {
  const { state } = useBudget()
  const [onglet, setOnglet] = useState('depenses')
  const mois = state.settings.moisCourant

  const pieData  = useMemo(() => getDepensesParCategoriePieData(state.transactions, mois), [state.transactions, mois])
  const barData  = useMemo(
    () => getDonnees12Mois(state.transactions).map(d => ({ ...d, label: formatMoisCourt(d.mois) })),
    [state.transactions]
  )
  const lineData = useMemo(() => getSoldesCumulatifs(state.transactions), [state.transactions])

  const axisStyle = { fontSize: 11, fill: '#94a3b8' }

  const totalDepensesMois  = pieData.reduce((s, d) => s + d.value, 0)
  const totalRevenus12     = barData.reduce((s, d) => s + d.revenus, 0)
  const totalDepenses12    = barData.reduce((s, d) => s + d.depenses, 0)
  const soldeActuel        = lineData.length > 0 ? lineData[lineData.length - 1].solde : 0
  const soldeMini          = lineData.length > 0 ? Math.min(...lineData.map(d => d.solde)) : 0

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Graphiques
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Analysez vos données financières visuellement
        </p>
      </div>

      {/* ── Tabs ── */}
      <div
        className="grid grid-cols-3 gap-3"
        role="tablist"
        aria-label="Sélectionner un graphique"
      >
        {ONGLETS.map(o => (
          <button
            key={o.key}
            role="tab"
            aria-selected={onglet === o.key}
            aria-controls={`panel-${o.key}`}
            id={`tab-${o.key}`}
            onClick={() => setOnglet(o.key)}
            className={[
              'flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-950',
              onglet === o.key
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:text-indigo-600 dark:hover:text-indigo-400',
            ].join(' ')}
          >
            <span className={onglet === o.key ? 'text-white' : ''}>{o.icon}</span>
            <div className="text-center">
              <p className="text-sm font-bold leading-tight">{o.label}</p>
              <p className={`text-[10px] font-medium mt-0.5 ${onglet === o.key ? 'text-white/60' : 'text-slate-400'}`}>
                {o.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Dépenses par catégorie ── */}
      {onglet === 'depenses' && (
        <div
          id="panel-depenses"
          role="tabpanel"
          aria-labelledby="tab-depenses"
          className="flex flex-col gap-4 animate-fade-in"
        >
          {/* Mini stats */}
          <div className="flex flex-wrap gap-3">
            <StatMini label="Total dépenses ce mois" value={formatMontant(totalDepensesMois)} color="#f43f5e" />
            <StatMini label="Catégories actives" value={`${pieData.length}`} color="#6366f1" />
            {pieData.length > 0 && (
              <StatMini
                label="Catégorie principale"
                value={[...pieData].sort((a, b) => b.value - a.value)[0]?.name || '—'}
                color={[...pieData].sort((a, b) => b.value - a.value)[0]?.couleur || '#6366f1'}
              />
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/60">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Répartition des dépenses</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Mois de {mois}</p>
            </div>
            <div className="p-6">
              {pieData.length === 0 ? (
                <EmptyState
                  titre="Aucune dépense ce mois"
                  message="Ajoutez des transactions pour voir ce graphique."
                />
              ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Pie chart */}
                  <div className="w-full lg:w-64 lg:flex-shrink-0">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          outerRadius={110} innerRadius={55}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {pieData.map(e => <Cell key={e.key} fill={e.couleur} stroke="transparent" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend with proportional bars */}
                  <div className="flex flex-col gap-3 w-full flex-1">
                    {[...pieData].sort((a, b) => b.value - a.value).map(d => {
                      const total = pieData.reduce((s, x) => s + x.value, 0)
                      const pct   = total > 0 ? (d.value / total) * 100 : 0
                      return (
                        <div key={d.key} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.couleur }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {d.name}
                              </span>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                  {formatMontant(d.value)}
                                </span>
                                <span
                                  className="text-[11px] font-extrabold w-9 text-right tabular-nums"
                                  style={{ color: d.couleur }}
                                >
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: d.couleur }}
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
          </div>
        </div>
      )}

      {/* ── Revenus vs Dépenses mensuel ── */}
      {onglet === 'mensuel' && (
        <div
          id="panel-mensuel"
          role="tabpanel"
          aria-labelledby="tab-mensuel"
          className="flex flex-col gap-4 animate-fade-in"
        >
          <div className="flex flex-wrap gap-3">
            <StatMini label="Revenus 12 mois"  value={formatMontant(totalRevenus12)}  color="#10b981" />
            <StatMini label="Dépenses 12 mois" value={formatMontant(totalDepenses12)} color="#f43f5e" />
            <StatMini
              label="Épargne nette"
              value={formatMontant(totalRevenus12 - totalDepenses12)}
              color={totalRevenus12 >= totalDepenses12 ? '#6366f1' : '#f97316'}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Revenus vs Dépenses</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Comparaison sur 12 mois</p>
              </div>
              <div className="ml-auto flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Revenus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dépenses</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(248,250,252,0.7)', radius: 6 }} />
                  <Bar dataKey="revenus"  name="Revenus"  fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Solde cumulatif ── */}
      {onglet === 'solde' && (
        <div
          id="panel-solde"
          role="tabpanel"
          aria-labelledby="tab-solde"
          className="flex flex-col gap-4 animate-fade-in"
        >
          <div className="flex flex-wrap gap-3">
            <StatMini label="Solde actuel"  value={formatMontant(soldeActuel)} color={soldeActuel >= 0 ? '#6366f1' : '#f43f5e'} />
            <StatMini label="Solde minimum" value={formatMontant(soldeMini)}   color={soldeMini  >= 0 ? '#10b981' : '#f97316'} />
            <StatMini label="Transactions"  value={`${state.transactions.length}`} color="#94a3b8" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/60">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Évolution du solde cumulatif</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Depuis la première transaction enregistrée
              </p>
            </div>
            <div className="p-6">
              {lineData.length === 0 ? (
                <EmptyState
                  titre="Pas de données"
                  message="Ajoutez des transactions pour voir l'évolution de votre solde."
                />
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="soldeGradPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={0}
                      stroke="#f43f5e"
                      strokeDasharray="5 4"
                      strokeOpacity={0.6}
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="solde"
                      name="Solde"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#soldeGradPos)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
