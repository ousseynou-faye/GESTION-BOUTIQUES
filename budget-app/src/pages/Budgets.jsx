import { useState, useMemo } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { getProgressionBudgets } from '@/utils/calculations'
import { formatMontant, formatMois } from '@/utils/formatters'
import { CATEGORIES, CATEGORIES_DEPENSES } from '@/constants/categories'

// ─── SVG Ring progress ────────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 68 }) {
  const sw    = 5
  const r     = (size - sw) / 2
  const circ  = 2 * Math.PI * r
  const dash  = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} stroke={color + '1e'} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        strokeWidth={sw}
        stroke={color}
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

// ─── Budget form ──────────────────────────────────────────────────────────────
function BudgetForm({ initial, mois, onSubmit, onCancel }) {
  const [categorie, setCategorie] = useState(initial?.categorie || '')
  const [montant, setMontant]     = useState(initial ? String(initial.montantMensuel) : '')
  const [errors, setErrors]       = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!categorie) errs.categorie = 'Choisissez une catégorie'
    if (!montant || parseFloat(montant) <= 0) errs.montant = 'Montant invalide'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ categorie, montantMensuel: parseFloat(montant), mois })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Category selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          Catégorie de dépense
        </label>
        <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
          {CATEGORIES_DEPENSES.map(k => {
            const cat      = CATEGORIES[k]
            const selected = categorie === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setCategorie(k)}
                aria-pressed={selected}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150',
                  selected
                    ? 'text-white border-transparent shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 bg-white dark:bg-slate-800',
                ].join(' ')}
                style={selected ? { backgroundColor: cat.couleur, boxShadow: `0 4px 12px ${cat.couleur}38` } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selected ? 'rgba(255,255,255,0.7)' : cat.couleur }}
                  aria-hidden="true"
                />
                {cat.label}
                {selected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 ml-0.5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {errors.categorie && (
          <p className="text-xs text-rose-500 font-medium">{errors.categorie}</p>
        )}
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          Budget mensuel (€)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-400" aria-hidden="true">
            €
          </span>
          <input
            type="number"
            step="0.01"
            min="1"
            placeholder="0,00"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            aria-label="Montant mensuel"
            className={[
              'w-full pl-10 pr-4 py-3.5 text-2xl font-bold rounded-2xl border-2',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200',
              'focus:outline-none transition-all',
              errors.montant
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-400',
            ].join(' ')}
          />
        </div>
        {/* Quick amount shortcuts */}
        <div className="flex gap-2 flex-wrap mt-1">
          {[100, 200, 300, 500, 1000].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setMontant(String(v))}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              {v}€
            </button>
          ))}
        </div>
        {errors.montant && (
          <p className="text-xs text-rose-500 font-medium">{errors.montant}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">
          {initial ? 'Enregistrer' : 'Créer le budget'}
        </Button>
      </div>
    </form>
  )
}

// ─── Budget card ──────────────────────────────────────────────────────────────
function BudgetCard({ b, onEdit, onDelete }) {
  const statusColor = b.depasse ? '#f43f5e' : b.pourcentage >= 80 ? '#f97316' : '#10b981'
  const statusLabel = b.depasse ? 'Dépassé' : b.pourcentage >= 80 ? 'Attention' : 'OK'
  const statusBg    = b.depasse
    ? 'bg-rose-50 dark:bg-rose-900/20'
    : b.pourcentage >= 80
    ? 'bg-orange-50 dark:bg-orange-900/20'
    : 'bg-emerald-50 dark:bg-emerald-900/20'

  return (
    <div className={[
      'bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden',
      'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      b.depasse
        ? 'border-rose-200 dark:border-rose-800/40 shadow-sm shadow-rose-100/60 dark:shadow-none'
        : b.pourcentage >= 80
        ? 'border-orange-200 dark:border-orange-800/40 shadow-sm'
        : 'border-slate-100 dark:border-slate-800 shadow-sm',
    ].join(' ')}>
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${b.couleur}66, ${b.couleur})` }}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* Header: icon + title + ring + actions */}
        <div className="flex items-start gap-3 mb-4">
          {/* Category initial icon */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm"
            style={{ background: `linear-gradient(135deg, ${b.couleur}cc, ${b.couleur})` }}
            aria-hidden="true"
          >
            {b.label.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate leading-tight">
              {b.label}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${statusBg}`}
              style={{ color: statusColor }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.depasse ? 'animate-pulse' : ''}`}
                style={{ background: statusColor }}
                aria-hidden="true"
              />
              {statusLabel}
            </span>
          </div>

          {/* Ring + action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <RingProgress pct={b.pourcentage} color={statusColor} size={50} />
              <span
                className="absolute text-[10px] font-extrabold tabular-nums"
                style={{ color: statusColor }}
                aria-label={`${Math.round(Math.min(b.pourcentage, 999))}% utilisé`}
              >
                {Math.round(Math.min(b.pourcentage, 999))}%
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => onEdit(b)}
                aria-label={`Modifier le budget ${b.label}`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(b)}
                aria-label={`Supprimer le budget ${b.label}`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-500 dark:text-slate-400">
              Dépensé :{' '}
              <span className={`font-bold ${b.depasse ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {formatMontant(b.depense)}
              </span>
            </span>
            <span className="font-bold text-slate-500 dark:text-slate-400 tabular-nums">
              {formatMontant(b.montantMensuel)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(b.pourcentage, 100)}%`,
                background: `linear-gradient(90deg, ${statusColor}77, ${statusColor})`,
                boxShadow: `0 0 8px ${statusColor}44`,
              }}
              role="progressbar"
              aria-valuenow={Math.round(b.pourcentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Budget</p>
            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatMontant(b.montantMensuel)}
            </p>
          </div>
          <div className={`rounded-xl px-3 py-2.5 ${b.depasse ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: statusColor }}>
              {b.depasse ? 'Dépassement' : 'Restant'}
            </p>
            <p className="text-sm font-extrabold tabular-nums" style={{ color: statusColor }}>
              {b.depasse
                ? `+${formatMontant(b.depense - b.montantMensuel)}`
                : formatMontant(b.restant)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, count, color, pulse }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}
        style={{ background: color }}
        aria-hidden="true"
      />
      <h2 className="text-xs font-extrabold uppercase tracking-widest" style={{ color }}>
        {label}
      </h2>
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: color + '18', color }}
        aria-label={`${count} budget(s)`}
      >
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: color + '20' }} aria-hidden="true" />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Budgets() {
  const { state, dispatch } = useBudget()
  const [mois, setMois]           = useState(state.settings.moisCourant)
  const [addOpen, setAddOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const progression = useMemo(
    () => getProgressionBudgets(state.transactions, state.budgets, mois),
    [state.transactions, state.budgets, mois]
  )

  const totalBudgete = progression.reduce((s, b) => s + b.montantMensuel, 0)
  const totalDepense = progression.reduce((s, b) => s + b.depense, 0)
  const totalRestant = Math.max(0, totalBudgete - totalDepense)
  const pctGlobal    = totalBudgete > 0 ? Math.min(100, (totalDepense / totalBudgete) * 100) : 0
  const nbDepasses   = progression.filter(b => b.depasse).length
  const nbAttention  = progression.filter(b => !b.depasse && b.pourcentage >= 80).length

  function goMois(delta) {
    const [y, m] = mois.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMois(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  function handleSubmit(data) {
    dispatch({ type: 'SET_BUDGET', payload: data })
    setAddOpen(false); setEditTarget(null)
  }
  function handleDelete(id) {
    dispatch({ type: 'DELETE_BUDGET', payload: { id } })
    setDeleteTarget(null)
  }

  const pctColor = pctGlobal >= 100 ? '#f43f5e' : pctGlobal >= 80 ? '#f97316' : '#10b981'

  const budgetsDepasses      = progression.filter(b => b.depasse)
  const budgetsAttention     = progression.filter(b => !b.depasse && b.pourcentage >= 80)
  const budgetsSousControle  = progression.filter(b => b.pourcentage < 80)

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Planifiez et contrôlez vos dépenses par catégorie
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-1 shadow-xs">
            <button
              onClick={() => goMois(-1)}
              aria-label="Mois précédent"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-lg font-bold leading-none"
            >
              ‹
            </button>
            <input
              type="month"
              value={mois}
              onChange={e => setMois(e.target.value)}
              aria-label="Sélectionner le mois"
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-300 w-32 text-center cursor-pointer"
            />
            <button
              onClick={() => goMois(1)}
              aria-label="Mois suivant"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-lg font-bold leading-none"
            >
              ›
            </button>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau budget
          </Button>
        </div>
      </div>

      {/* ── Global overview banner ── */}
      {progression.length > 0 && (
        <div
          className="rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        >
          <div className="relative p-6 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-full opacity-[0.04] bg-white pointer-events-none" aria-hidden="true" />
            <div className="absolute left-[-20px] bottom-[-30px] w-32 h-32 rounded-full opacity-[0.05] bg-indigo-400 pointer-events-none" aria-hidden="true" />

            <div className="relative">
              {/* Title + stats row */}
              <div className="flex flex-wrap gap-6 items-start justify-between mb-5">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {formatMois(mois)} — Vue d'ensemble
                  </p>
                  <p className="text-white text-3xl font-extrabold tracking-tight tabular-nums">
                    {formatMontant(totalDepense)}
                    <span className="text-slate-500 text-lg font-normal ml-2">
                      / {formatMontant(totalBudgete)}
                    </span>
                  </p>
                </div>

                <div className="flex gap-5">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white tabular-nums">{progression.length}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">
                      Budget{progression.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-px bg-white/10" aria-hidden="true" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold tabular-nums" style={{ color: pctColor }}>
                      {Math.round(pctGlobal)}%
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">Utilisé</p>
                  </div>
                  <div className="w-px bg-white/10" aria-hidden="true" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                      {formatMontant(totalRestant)}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">Restant</p>
                  </div>
                </div>
              </div>

              {/* Global progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pctGlobal}%`,
                    background: `linear-gradient(90deg, ${pctColor}77, ${pctColor})`,
                    boxShadow: `0 0 14px ${pctColor}55`,
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(pctGlobal)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(pctGlobal)}% du budget mensuel utilisé`}
                />
              </div>

              {/* Status pills */}
              <div className="flex gap-3 flex-wrap">
                {nbDepasses > 0 && (
                  <div className="flex items-center gap-2 bg-rose-500/12 border border-rose-500/20 rounded-xl px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" aria-hidden="true" />
                    <p className="text-rose-300 text-xs font-semibold">
                      {nbDepasses} dépassé{nbDepasses > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {nbAttention > 0 && (
                  <div className="flex items-center gap-2 bg-orange-500/12 border border-orange-500/20 rounded-xl px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-orange-300 text-xs font-semibold">
                      {nbAttention} à surveiller
                    </p>
                  </div>
                )}
                {budgetsSousControle.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-500/12 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-emerald-300 text-xs font-semibold">
                      {budgetsSousControle.length} sous contrôle
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget grid ── */}
      {progression.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            titre={`Aucun budget pour ${formatMois(mois)}`}
            message="Définissez des limites mensuelles par catégorie pour mieux contrôler vos dépenses."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Créer mon premier budget
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {budgetsDepasses.length > 0 && (
            <div>
              <SectionLabel label="Budgets dépassés" count={budgetsDepasses.length} color="#f43f5e" pulse />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgetsDepasses.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}

          {budgetsAttention.length > 0 && (
            <div>
              <SectionLabel label="À surveiller" count={budgetsAttention.length} color="#f97316" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgetsAttention.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}

          {budgetsSousControle.length > 0 && (
            <div>
              <SectionLabel label="Sous contrôle" count={budgetsSousControle.length} color="#10b981" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgetsSousControle.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} titre="Nouveau budget">
        <BudgetForm mois={mois} onSubmit={handleSubmit} onCancel={() => setAddOpen(false)} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} titre="Modifier le budget">
        {editTarget && (
          <BudgetForm initial={editTarget} mois={mois} onSubmit={handleSubmit} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        titre="Supprimer le budget"
        message={`Supprimer le budget "${deleteTarget?.label}" pour ${formatMois(mois)} ?`}
      />
    </div>
  )
}
