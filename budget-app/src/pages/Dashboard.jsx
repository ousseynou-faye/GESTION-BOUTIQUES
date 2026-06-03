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
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: '#0b0e1c', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      {children}
    </div>
  )
}

function CardHeader({ titre, lien, href }) {
  return (
    <div
      className="flex items-center justify-between px-5 pt-4 pb-3.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <h2 className="font-display text-[13px] font-extrabold tracking-tight"
        style={{ color: 'rgba(226,232,240,0.92)' }}>
        {titre}
      </h2>
      {href && (
        <Link
          to={href}
          className="text-[11px] font-bold transition-colors"
          style={{ color: '#818cf8' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#818cf8' }}
        >
          {lien || 'Voir tout →'}
        </Link>
      )}
    </div>
  )
}

// ─── Dark glass tooltip ───────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl px-4 py-3 shadow-2xl text-xs min-w-[150px]"
      style={{
        background: 'rgba(10,12,28,0.95)',
        border: '1px solid rgba(129,140,248,0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      {label && (
        <p className="font-display font-bold text-slate-300 mb-2 pb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {label}
        </p>
      )}
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="font-display font-extrabold text-white tabular-nums">
            {formatMontant(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Today badge ──────────────────────────────────────────────────────────────
function TodayBadge() {
  const now  = new Date()
  const jour = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const date = jour.charAt(0).toUpperCase() + jour.slice(1)

  return (
    <div
      className="hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-2"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div
        className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(129,140,248,0.15)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" style={{ color: '#818cf8' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.8)' }}>{date}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state } = useBudget()
  const mois = state.settings.moisCourant
  const isDark = state.settings.theme === 'dark'
  const { transactions, budgets } = state

  const totalRevenus       = useMemo(() => getTotalRevenus(transactions, mois),    [transactions, mois])
  const totalDepenses      = useMemo(() => getTotalDepenses(transactions, mois),   [transactions, mois])
  const soldeNet           = useMemo(() => getSoldeNet(transactions, mois),        [transactions, mois])
  const tauxEpargne        = useMemo(() => getTauxEpargne(transactions, mois),     [transactions, mois])
  const pieData            = useMemo(() => getDepensesParCategoriePieData(transactions, mois), [transactions, mois])
  const barData            = useMemo(
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

  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const axisColor  = isDark ? 'rgba(100,116,139,0.7)'  : '#94a3b8'
  const axisStyle  = { fontSize: 11, fill: axisColor }
  const cursorFill = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.8)'

  return (
    <div className="flex flex-col gap-7 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight"
            style={{ color: 'rgba(226,232,240,0.95)' }}>
            Tableau de bord
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            {formatMois(mois)} — Vue d'ensemble de vos finances
          </p>
        </div>
        <TodayBadge />
      </div>

      {/* ── KPI Cards ── */}
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

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Pie — 2 cols */}
        <Card className="md:col-span-2">
          <CardHeader titre="Dépenses par catégorie" href="/graphiques" lien="Graphiques →" />
          <div className="p-5">
            {pieData.length === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"
                    style={{ color: 'rgba(99,102,241,0.4)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <p className="text-xs" style={{ color: 'rgba(100,116,139,0.6)' }}>Aucune dépense ce mois</p>
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
                      strokeWidth={0}
                    >
                      {pieData.map(e => (
                        <Cell
                          key={e.key}
                          fill={e.couleur}
                          stroke="transparent"
                          style={{ filter: `drop-shadow(0 2px 5px ${e.couleur}44)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {pieData.slice(0, 6).map(d => (
                    <div key={d.key} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(100,116,139,0.7)' }}>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: d.couleur, boxShadow: `0 0 5px ${d.couleur}88` }}
                      />
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Bar chart — 3 cols */}
        <Card className="md:col-span-3">
          <CardHeader titre="Revenus vs Dépenses — 6 derniers mois" href="/graphiques" lien="Graphiques →" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} tickFormatter={v => v.toLocaleString('fr-FR')} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill, radius: 6 }} />
                <Bar dataKey="revenus"  name="Revenus"  fill="#34d399" radius={[5, 5, 0, 0]} maxBarSize={26} />
                <Bar dataKey="depenses" name="Dépenses" fill="#fb7185" radius={[5, 5, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
            {/* Manual legend */}
            <div className="flex items-center gap-5 mt-1 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.7)' }} />
                <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.7)' }}>Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#fb7185', boxShadow: '0 0 6px rgba(251,113,133,0.7)' }} />
                <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.7)' }}>Dépenses</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Budgets + Transactions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Budgets */}
        <Card>
          <CardHeader titre="Budgets du mois" href="/budgets" lien="Gérer →" />
          <div className="p-5">
            {progressionBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <p className="text-sm" style={{ color: 'rgba(100,116,139,0.7)' }}>
                  Aucun budget configuré pour {formatMois(mois)}.
                </p>
                <Link to="/budgets" className="text-[11px] font-bold transition-colors" style={{ color: '#818cf8' }}>
                  Créer des budgets →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {progressionBudgets.slice(0, 5).map(b => {
                  const statusColor = b.depasse ? '#fb7185' : b.pourcentage >= 80 ? '#fb923c' : '#34d399'
                  return (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: b.couleur, boxShadow: `0 0 6px ${b.couleur}88` }}
                            aria-hidden="true"
                          />
                          <span className="font-display text-[12px] font-semibold"
                            style={{ color: 'rgba(148,163,184,0.85)' }}>
                            {b.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {b.depasse && (
                            <span
                              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg"
                              style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185' }}
                            >
                              Dépassé
                            </span>
                          )}
                          <span className="text-[11px] tabular-nums" style={{ color: 'rgba(100,116,139,0.7)' }}>
                            <span className="font-display font-bold" style={{ color: b.depasse ? '#fb7185' : 'rgba(148,163,184,0.85)' }}>
                              {formatMontant(b.depense)}
                            </span>
                            {' / '}{formatMontant(b.montantMensuel)}
                          </span>
                        </div>
                      </div>
                      <ProgressBar valeur={b.pourcentage} couleur={statusColor} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Dernières transactions */}
        <Card>
          <CardHeader titre="Dernières transactions" href="/transactions" lien="Voir tout →" />
          <div>
            {dernieresTxns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-1.5">
                <p className="text-sm" style={{ color: 'rgba(100,116,139,0.7)' }}>Aucune transaction</p>
                <Link to="/transactions" className="text-[11px] font-bold" style={{ color: '#818cf8' }}>
                  Ajouter une transaction →
                </Link>
              </div>
            ) : (
              dernieresTxns.map((t, idx) => {
                const isRevenu   = t.type === 'revenu'
                const amtColor   = isRevenu ? '#34d399' : '#fb7185'
                return (
                  <div key={t.id}>
                    <div
                      className="flex items-center gap-3 px-5 py-3 transition-colors cursor-default"
                      onMouseEnter={e => { e.currentTarget.style.background = isRevenu ? 'rgba(52,211,153,0.04)' : 'rgba(251,113,133,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '' }}
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: isRevenu
                            ? 'linear-gradient(135deg, rgba(5,150,105,0.16) 0%, rgba(52,211,153,0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(225,29,72,0.16) 0%, rgba(251,113,133,0.08) 100%)',
                          border: `1px solid ${isRevenu ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}`,
                        }}
                      >
                        {isRevenu ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
                            viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none"
                            viewBox="0 0 24 24" stroke="#fb7185" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[12px] font-semibold truncate leading-tight"
                          style={{ color: 'rgba(226,232,240,0.9)' }}>
                          {t.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge categorie={t.categorie} />
                          <span className="text-[10px]" style={{ color: 'rgba(100,116,139,0.6)' }}>
                            {formatDate(t.date, 'd MMM')}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <span
                        className="font-display text-[13px] font-extrabold flex-shrink-0 tabular-nums"
                        style={{ color: amtColor }}
                      >
                        {isRevenu ? '+' : '−'}{formatMontant(t.montant)}
                      </span>
                    </div>
                    {idx < dernieresTxns.length - 1 && (
                      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} aria-hidden="true" />
                    )}
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
