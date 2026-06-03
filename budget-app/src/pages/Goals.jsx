import { useState, useMemo } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { getObjectifProgression } from '@/utils/calculations'
import { formatMontant, formatDate } from '@/utils/formatters'

const COULEURS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

// ─── SVG ring progress ────────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 88 }) {
  const sw   = 6
  const r    = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (Math.min(pct, 100) / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
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
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-xl font-black tabular-nums leading-none" style={{ color }}>
          {Math.round(Math.min(pct, 100))}%
        </span>
      </div>
    </div>
  )
}

// ─── Goal form ────────────────────────────────────────────────────────────────
function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial
    ? { ...initial, montantCible: String(initial.montantCible), montantActuel: String(initial.montantActuel) }
    : { nom: '', description: '', montantCible: '', montantActuel: '', dateEcheance: '', couleur: '#6366f1' }
  )
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis'
    if (!form.montantCible || parseFloat(form.montantCible) <= 0) e.montantCible = 'Montant cible invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      nom:           form.nom.trim(),
      description:   form.description.trim(),
      montantCible:  parseFloat(form.montantCible),
      montantActuel: parseFloat(form.montantActuel) || 0,
      dateEcheance:  form.dateEcheance,
      couleur:       form.couleur,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Color picker */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide block mb-2">
          Couleur
        </label>
        <div className="flex gap-2 flex-wrap">
          {COULEURS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('couleur', c)}
              aria-label={`Couleur ${c}`}
              aria-pressed={form.couleur === c}
              className={[
                'w-8 h-8 rounded-full transition-all duration-150',
                form.couleur === c
                  ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 dark:ring-offset-slate-900'
                  : 'hover:scale-110',
              ].join(' ')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <Input
        label="Nom de l'objectif"
        placeholder="ex : Vacances été 2027"
        value={form.nom}
        onChange={e => set('nom', e.target.value)}
        error={errors.nom}
      />
      <Input
        label="Description (optionnel)"
        placeholder="Décrivez votre objectif"
        value={form.description}
        onChange={e => set('description', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
            Cible (€)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-indigo-400" aria-hidden="true">
              €
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="0,00"
              value={form.montantCible}
              onChange={e => set('montantCible', e.target.value)}
              aria-label="Montant cible"
              className={[
                'w-full pl-8 pr-3 py-3 text-xl font-bold rounded-xl border-2',
                'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200',
                'focus:outline-none transition-all',
                errors.montantCible
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-400',
              ].join(' ')}
            />
          </div>
          {errors.montantCible && (
            <p className="text-xs text-rose-500 font-medium">{errors.montantCible}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
            Déjà épargné (€)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400" aria-hidden="true">
              €
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={form.montantActuel}
              onChange={e => set('montantActuel', e.target.value)}
              aria-label="Montant déjà épargné"
              className="w-full pl-8 pr-3 py-3 text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>
        </div>
      </div>

      <Input
        label="Date d'échéance (optionnel)"
        type="date"
        value={form.dateEcheance}
        onChange={e => set('dateEcheance', e.target.value)}
      />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">
          {initial ? 'Enregistrer' : "Créer l'objectif"}
        </Button>
      </div>
    </form>
  )
}

// ─── Deposit form ─────────────────────────────────────────────────────────────
function DepositForm({ goal, onSubmit, onCancel }) {
  const [montant, setMontant] = useState('')
  const [error, setError]     = useState('')
  const restant = Math.max(0, goal.montantCible - goal.montantActuel)

  function handleSubmit(e) {
    e.preventDefault()
    const val = parseFloat(montant)
    if (!val || val <= 0) { setError('Montant invalide'); return }
    onSubmit(Math.min(val, restant))
  }

  const suggestions = [
    Math.round(restant * 0.1),
    Math.round(restant * 0.25),
    Math.round(restant * 0.5),
    Math.round(restant),
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Goal preview */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: goal.couleur + '10', border: `1px solid ${goal.couleur}22` }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${goal.couleur}cc, ${goal.couleur})` }}
          aria-hidden="true"
        >
          {goal.nom.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">{goal.nom}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatMontant(goal.montantActuel)} / {formatMontant(goal.montantCible)}
            {' · '}
            <span className="font-semibold" style={{ color: goal.couleur }}>
              Restant : {formatMontant(restant)}
            </span>
          </p>
        </div>
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          Montant à déposer (€)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: goal.couleur }} aria-hidden="true">
            €
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            aria-label="Montant à déposer"
            className={[
              'w-full pl-10 pr-4 py-4 text-3xl font-bold rounded-2xl border-2',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200',
              'focus:outline-none transition-all',
              error
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700',
            ].join(' ')}
            style={!error ? { '--tw-ring-color': goal.couleur } : {}}
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {suggestions.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {suggestions.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMontant(String(v))}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border transition-all hover:opacity-80"
                style={{ borderColor: goal.couleur + '44', color: goal.couleur, background: goal.couleur + '0e' }}
              >
                {i === 0 ? '10%' : i === 1 ? '25%' : i === 2 ? '50%' : 'Tout'} — {formatMontant(v)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" variant="success" className="flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Déposer les fonds
        </Button>
      </div>
    </form>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onDelete, onDeposit }) {
  const { pct, restant, jours, mensualiteRequise } = getObjectifProgression(goal)
  const atteint = goal.montantActuel >= goal.montantCible
  const urgence = jours !== null && jours <= 30 && !atteint

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">

      {/* ── Header with ring ── */}
      <div
        className="relative px-5 pt-5 pb-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${goal.couleur}12 0%, ${goal.couleur}04 100%)` }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute right-[-24px] top-[-24px] w-28 h-28 rounded-full pointer-events-none"
          style={{ background: goal.couleur + '18' }}
          aria-hidden="true"
        />
        <div
          className="absolute left-[-16px] bottom-[-16px] w-20 h-20 rounded-full pointer-events-none"
          style={{ background: goal.couleur + '08' }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-4">
          {/* Ring or completion check */}
          <div className="flex-shrink-0">
            {atteint ? (
              <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center"
                style={{ background: `${goal.couleur}18`, border: `6px solid ${goal.couleur}` }}
                aria-label="Objectif atteint"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24"
                  stroke={goal.couleur} strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <RingProgress pct={pct} color={goal.couleur} size={88} />
            )}
          </div>

          {/* Goal info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  {goal.nom}
                </h3>
                {goal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                )}
                {atteint && (
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: goal.couleur }}
                  >
                    Objectif atteint !
                  </span>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(goal)}
                  aria-label={`Modifier l'objectif ${goal.nom}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(goal)}
                  aria-label={`Supprimer l'objectif ${goal.nom}`}
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
        </div>
      </div>

      {/* ── Thin progress bar ── */}
      <div className="px-5 py-0.5">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: `linear-gradient(90deg, ${goal.couleur}88, ${goal.couleur})`,
              boxShadow: `0 0 8px ${goal.couleur}44`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Amounts row */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Épargné</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatMontant(goal.montantActuel)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Objectif</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatMontant(goal.montantCible)}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Restant</p>
            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatMontant(restant)}
            </p>
          </div>
          {jours !== null ? (
            <div className={`rounded-xl px-3 py-2.5 ${urgence ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: urgence ? '#f97316' : '#94a3b8' }}
              >
                {jours > 0 ? 'Jours restants' : 'Échéance'}
              </p>
              <p className={`text-sm font-extrabold tabular-nums ${urgence ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {jours > 0 ? `${jours} j` : jours === 0 ? "Aujourd'hui" : 'Dépassée'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Échéance</p>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Non définie</p>
            </div>
          )}
        </div>

        {/* Monthly savings requirement */}
        {mensualiteRequise !== null && mensualiteRequise > 0 && !atteint && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{ background: goal.couleur + '08', borderColor: goal.couleur + '22' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: goal.couleur + '15' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke={goal.couleur} strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: goal.couleur }}>
                À épargner / mois
              </p>
              <p className="text-sm font-extrabold tabular-nums" style={{ color: goal.couleur }}>
                {formatMontant(mensualiteRequise)}
              </p>
            </div>
          </div>
        )}

        {/* Deadline */}
        {goal.dateEcheance && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Échéance :{' '}
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {formatDate(goal.dateEcheance)}
            </span>
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {atteint ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
              style={{ background: goal.couleur + '12', color: goal.couleur, border: `1px solid ${goal.couleur}28` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Objectif atteint !
            </div>
          ) : (
            <button
              onClick={() => onDeposit(goal)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-100"
              style={{
                background: `linear-gradient(135deg, ${goal.couleur}cc, ${goal.couleur})`,
                boxShadow: `0 4px 16px ${goal.couleur}30`,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter des fonds
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Goals() {
  const { state, dispatch } = useBudget()
  const [addOpen, setAddOpen]             = useState(false)
  const [editTarget, setEditTarget]       = useState(null)
  const [depositTarget, setDepositTarget] = useState(null)
  const [deleteTarget, setDeleteTarget]   = useState(null)

  function handleAdd(data)    { dispatch({ type: 'ADD_GOAL',    payload: data }); setAddOpen(false) }
  function handleEdit(data)   { dispatch({ type: 'UPDATE_GOAL', payload: data }); setEditTarget(null) }
  function handleDeposit(goal, montant) {
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { ...goal, montantActuel: Math.min(goal.montantCible, goal.montantActuel + montant) },
    })
    setDepositTarget(null)
  }
  function handleDelete(id) { dispatch({ type: 'DELETE_GOAL', payload: { id } }); setDeleteTarget(null) }

  const totalCible  = state.goals.reduce((s, g) => s + g.montantCible, 0)
  const totalEpargne = state.goals.reduce((s, g) => s + g.montantActuel, 0)
  const nbAtteints  = state.goals.filter(g => g.montantActuel >= g.montantCible).length
  const pctGlobal   = totalCible > 0 ? (totalEpargne / totalCible) * 100 : 0

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Objectifs d'épargne
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Suivez la progression de vos projets financiers
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel objectif
        </Button>
      </div>

      {/* ── Global banner ── */}
      {state.goals.length > 0 && (
        <div
          className="rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a2e 100%)' }}
        >
          <div className="relative p-6 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute right-[-40px] top-[-40px] w-56 h-56 rounded-full opacity-[0.03] bg-white pointer-events-none" aria-hidden="true" />
            <div className="absolute left-[30%] bottom-[-30px] w-40 h-40 rounded-full opacity-[0.04] bg-indigo-400 pointer-events-none" aria-hidden="true" />

            <div className="relative flex flex-wrap gap-6 items-center justify-between">
              {/* Progress summary */}
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Vue d'ensemble — {state.goals.length} objectif{state.goals.length > 1 ? 's' : ''}
                </p>
                <p className="text-white text-3xl font-extrabold tracking-tight tabular-nums">
                  {formatMontant(totalEpargne)}
                  <span className="text-slate-500 text-lg font-normal ml-2">/ {formatMontant(totalCible)}</span>
                </p>
                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden w-48">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${Math.min(pctGlobal, 100)}%`, boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
                    role="progressbar"
                    aria-valuenow={Math.round(pctGlobal)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1.5">
                  {Math.round(pctGlobal)}% de l'objectif total atteint
                </p>
              </div>

              {/* Quick stats */}
              <div className="flex gap-5">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white tabular-nums">{state.goals.length}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">Objectifs</p>
                </div>
                <div className="w-px bg-white/10" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-indigo-400 tabular-nums">
                    {formatMontant(totalEpargne)}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">Épargné</p>
                </div>
                <div className="w-px bg-white/10" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                    {nbAtteints} / {state.goals.length}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">Atteints</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Goals grid ── */}
      {state.goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            titre="Aucun objectif d'épargne"
            message="Définissez vos projets financiers — vacances, fond d'urgence, achat — et suivez votre progression."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Créer mon premier objectif
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {state.goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onDeposit={setDepositTarget}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} titre="Nouvel objectif d'épargne">
        <GoalForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} titre="Modifier l'objectif">
        {editTarget && (
          <GoalForm initial={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>
      <Modal isOpen={!!depositTarget} onClose={() => setDepositTarget(null)} titre="Ajouter des fonds" size="sm">
        {depositTarget && (
          <DepositForm
            goal={depositTarget}
            onSubmit={m => handleDeposit(depositTarget, m)}
            onCancel={() => setDepositTarget(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        titre="Supprimer l'objectif"
        message={`Supprimer définitivement "${deleteTarget?.nom}" et toute sa progression ?`}
      />
    </div>
  )
}
