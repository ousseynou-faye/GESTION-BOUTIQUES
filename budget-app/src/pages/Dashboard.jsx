import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBudget } from '@/context/BudgetContext'
import { KPICard } from '@/components/ui/KPICard'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  getTotalRevenus, getTotalDepenses, getSoldeNet, getTauxEpargne,
  getDepensesParCategoriePieData, getDonnees6Mois, getProgressionBudgets,
} from '@/utils/calculations'
import { formatMontant, formatPourcentage, formatMoisCourt, formatDate, formatMois } from '@/utils/formatters'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconRevenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
  </svg>
)
const IconDepense = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
  </svg>
)
const IconSolde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconEpargne = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

// ─── Reusable card wrapper ────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ titre, lien, href }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-slate-50 dark:border-slate-800/60">
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{titre}</h2>
      {href && (
        <Link
          to={href}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          {lien || 'Voir tout →'}
        </Link>
      )}
    </div>
  )
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      {label && (
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          {label}
        </p>
      )}
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto pl-3">
            {formatMontant(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Current date badge ───────────────────────────────────────────────────────
function TodayBadge() {
  const now  = new Date()
  const jour = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const date = jour.charAt(0).toUpperCase() + jour.slice(1)

  return (
    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span className="font-medium">{date}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state } = useBudget()
  const mois = state.settings.moisCourant
  const { transactions, budgets } = state

  const totalRevenus    = useMemo(() => getTotalRevenus(transactions, mois),    [transactions, mois])
  const totalDepenses   = useMemo(() => getTotalDepenses(transactions, mois),   [transactions, mois])
  const soldeNet        = useMemo(() => getSoldeNet(transactions, mois),        [transactions, mois])
  const tauxEpargne     = useMemo(() => getTauxEpargne(transactions, mois),     [transactions, mois])
  const pieData         = useMemo(() => getDepensesParCategoriePieData(transactions, mois), [transactions, mois])
  const barData         = useMemo(
    () => getDonnees6Mois(transactions).map(d => ({ ...d, label: formatMoisCourt(d.mois) })),
    [transactions]
  )
  const progressionBudgets = useMemo(
    () => getProgressionBudgets(transactions, budgets, mois),
    [transactions, budgets, mois]
  )
  const dernieresTxns = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [transactions]
  )

  return (
    <div className="flex flex-col gap-7 animate-fade-slide-up">

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {formatMois(mois)} — Vue d'ensemble de vos finances
          </p>
        </div>
        <TodayBadge />
      </div>

      {/* ─── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          titre="Revenus du mois"
          valeur={formatMontant(totalRevenus)}
          sousTitre={formatMois(mois)}
          gradient={['#059669', '#10b981']}
          icon={<IconRevenu />}
        />
        <KPICard
          titre="Dépenses du mois"
          valeur={formatMontant(totalDepenses)}
          sousTitre={formatMois(mois)}
          gradient={['#e11d48', '#f43f5e']}
          icon={<IconDepense />}
        />
        <KPICard
          titre="Solde net"
          valeur={formatMontant(soldeNet)}
          sousTitre={soldeNet >= 0 ? 'Solde positif' : 'Solde négatif'}
          gradient={soldeNet >= 0 ? ['#4338ca', '#6366f1'] : ['#ea580c', '#f97316']}
          icon={<IconSolde />}
        />
        <KPICard
          titre="Taux d'épargne"
          valeur={formatPourcentage(tauxEpargne)}
          sousTitre={tauxEpargne >= 20 ? 'Excellent' : tauxEpargne >= 10 ? 'Correct' : 'À améliorer'}
          gradient={['#b45309', '#f59e0b']}
          icon={<IconEpargne />}
        />
      </div>

      {/* ─── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Pie chart — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader titre="Dépenses par catégorie" href="/graphiques" lien="Graphiques →" />
          <div className="p-5">
            {pieData.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-300 dark:text-slate-600"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Aucune dépense ce mois</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={80}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {pieData.map(e => <Cell key={e.key} fill={e.couleur} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {pieData.slice(0, 6).map(d => (
                    <div key={d.key} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.couleur }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Bar chart — 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader titre="Revenus vs Dépenses — 6 derniers mois" href="/graphiques" lien="Graphiques →" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}€`} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(248,250,252,0.7)', radius: 6 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#94a3b8' }} />
                <Bar dataKey="revenus"  name="Revenus"  fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
                <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ─── Budgets + Dernières transactions ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Budgets */}
        <Card>
          <CardHeader titre="Budgets du mois" href="/budgets" lien="Gérer →" />
          <div className="p-5">
            {progressionBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Aucun budget configuré pour {formatMois(mois)}.
                </p>
                <Link
                  to="/budgets"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline underline-offset-2"
                >
                  Créer des budgets →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {progressionBudgets.slice(0, 5).map(b => (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: b.couleur }}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {b.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.depasse && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-lg">
                            Dépassé
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          <span className={b.depasse ? 'text-rose-500 font-bold' : 'font-medium'}>
                            {formatMontant(b.depense)}
                          </span>
                          {' / '}{formatMontant(b.montantMensuel)}
                        </span>
                      </div>
                    </div>
                    <ProgressBar valeur={b.pourcentage} couleur={b.couleur} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Dernières transactions */}
        <Card>
          <CardHeader titre="Dernières transactions" href="/transactions" lien="Voir tout →" />
          <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
            {dernieresTxns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-1.5">
                <p className="text-sm text-slate-400 dark:text-slate-500">Aucune transaction</p>
                <Link
                  to="/transactions"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline underline-offset-2"
                >
                  Ajouter une transaction →
                </Link>
              </div>
            ) : (
              dernieresTxns.map(t => {
                const isRevenu = t.type === 'revenu'
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/25 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: isRevenu ? 'rgba(209,250,229,0.22)' : 'rgba(255,228,230,0.22)',
                        border: `1.5px solid ${isRevenu ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                      }}
                    >
                      {isRevenu ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-500"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-rose-500"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge categorie={t.categorie} />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatDate(t.date, 'd MMM')}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <span className={[
                      'text-[13px] font-bold flex-shrink-0 tabular-nums',
                      isRevenu
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    ].join(' ')}>
                      {isRevenu ? '+' : '−'}{formatMontant(t.montant)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
