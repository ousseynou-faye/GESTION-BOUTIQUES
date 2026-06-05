import { useState, useMemo } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { getProgressionBudgets } from '@/utils/calculations'
import { formatMois } from '@/utils/formatters'
import { useFormatMontant } from '@/utils/useFormatMontant'
import { CATEGORIES, CATEGORIES_DEPENSES } from '@/constants/categories'

// ─── SVG Ring progress ────────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 64 }) {
  const sw   = 4.5
  const r    = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} stroke={color + '1a'} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" strokeWidth={sw} stroke={color}
        strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
    </svg>
  )
}

// ─── Budget form ──────────────────────────────────────────────────────────────
function BudgetForm({ initial, mois, onSubmit, onCancel }) {
  const [categorie, setCategorie] = useState(initial?.categorie || '')
  const [montant, setMontant]     = useState(initial ? String(initial.montantMensuel) : '')
  const [errors, setErrors]       = useState({})

  const catColor = categorie ? (CATEGORIES[categorie]?.couleur || '#818cf8') : '#818cf8'

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

      {/* Catégorie */}
      <div>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-2 leading-none"
          style={{ color: 'rgba(100,116,139,0.7)' }}>
          Catégorie de dépense
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
          {CATEGORIES_DEPENSES.map(k => {
            const cat      = CATEGORIES[k]
            const selected = categorie === k
            return (
              <button
                key={k} type="button"
                onClick={() => setCategorie(k)}
                aria-pressed={selected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150"
                style={selected ? {
                  background: `linear-gradient(135deg, ${cat.couleur}dd, ${cat.couleur})`,
                  color: '#fff',
                  boxShadow: `0 4px 12px ${cat.couleur}44`,
                  border: '1px solid transparent',
                } : {
                  background: `${cat.couleur}0d`,
                  color: 'rgba(148,163,184,0.85)',
                  border: `1px solid ${cat.couleur}25`,
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = `${cat.couleur}1a`; e.currentTarget.style.color = '#e2e8f0' } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = `${cat.couleur}0d`; e.currentTarget.style.color = 'rgba(148,163,184,0.85)' } }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: selected ? 'rgba(255,255,255,0.8)' : cat.couleur }}
                  aria-hidden="true" />
                {cat.label}
                {selected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {errors.categorie && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-1.5" style={{ color: '#fb7185' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {errors.categorie}
          </p>
        )}
      </div>

      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />

      {/* Montant */}
      <div>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 leading-none"
          style={{ color: 'rgba(100,116,139,0.7)' }}>
          Budget mensuel
        </p>
        {/* F + input in a flex row */}
        <div
          className="flex items-center rounded-2xl transition-all duration-200"
          style={{
            background: `${catColor}0a`,
            border: `2px solid ${errors.montant ? '#fb7185' : catColor + '30'}`,
          }}
          onClick={e => e.currentTarget.querySelector('input')?.focus()}
        >
          <span
            className="pl-5 font-display font-black leading-none select-none flex-shrink-0"
            style={{ color: catColor, fontSize: '1.1rem' }}
            aria-hidden="true"
          >F CFA</span>
          <input
            type="number" step="1" min="1" placeholder="0"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            aria-label="Montant mensuel"
            className="flex-1 bg-transparent pl-2 pr-5 py-4 font-display font-black focus:outline-none min-w-0"
            style={{
              color: catColor,
              caretColor: catColor,
              fontSize: '2.25rem',
              letterSpacing: '-0.01em',
            }}
            onFocus={e => {
              const wrap = e.currentTarget.parentElement
              wrap.style.borderColor = catColor + '70'
              wrap.style.boxShadow = `0 0 0 3px ${catColor}18`
            }}
            onBlur={e => {
              const wrap = e.currentTarget.parentElement
              wrap.style.borderColor = errors.montant ? '#fb7185' : catColor + '30'
              wrap.style.boxShadow = 'none'
            }}
          />
        </div>
        <div className="grid grid-cols-5 gap-1.5 mt-2.5">
          {[10000, 25000, 50000, 100000, 200000].map(v => (
            <button key={v} type="button" onClick={() => setMontant(String(v))}
              className="py-2.5 text-xs font-bold rounded-xl transition-all focus:outline-none"
              style={{
                background: String(montant) === String(v) ? `${catColor}22` : `${catColor}0e`,
                color: catColor,
                border: `1px solid ${String(montant) === String(v) ? catColor + '55' : catColor + '22'}`,
                boxShadow: String(montant) === String(v) ? `0 2px 8px ${catColor}22` : 'none',
              }}
              onMouseEnter={e => { if (String(montant) !== String(v)) e.currentTarget.style.background = `${catColor}18` }}
              onMouseLeave={e => { if (String(montant) !== String(v)) e.currentTarget.style.background = `${catColor}0e` }}
            >
              {v.toLocaleString('fr-FR')}
            </button>
          ))}
        </div>
        {errors.montant && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-1.5" style={{ color: '#fb7185' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {errors.montant}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 text-sm font-semibold rounded-2xl transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >Annuler</button>
        <button type="submit"
          className="flex-1 py-3 font-display text-sm font-bold rounded-2xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${catColor}cc, ${catColor})`,
            boxShadow: `0 6px 20px ${catColor}44`,
          }}
        >
          {initial ? 'Enregistrer' : 'Créer le budget'}
        </button>
      </div>
    </form>
  )
}

// ─── Budget card ──────────────────────────────────────────────────────────────
function BudgetCard({ b, onEdit, onDelete }) {
  const fmt = useFormatMontant()
  const statusColor = b.depasse ? '#fb7185' : b.pourcentage >= 80 ? '#fb923c' : '#34d399'
  const statusLabel = b.depasse ? 'Dépassé' : b.pourcentage >= 80 ? 'Attention' : 'OK'

  return (
    <div
      className="relative flex overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: '#0b0e1c',
        border: `1px solid ${b.depasse ? 'rgba(251,113,133,0.2)' : b.pourcentage >= 80 ? 'rgba(251,146,60,0.16)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: b.depasse
          ? '0 4px 24px rgba(251,113,133,0.1), 0 2px 8px rgba(0,0,0,0.3)'
          : b.pourcentage >= 80
          ? '0 4px 24px rgba(251,146,60,0.08), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Prismatic top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${statusColor}55, ${statusColor}cc, ${statusColor}55, transparent)` }}
        aria-hidden="true"
      />

      {/* Left accent strip */}
      <div
        className="w-1 flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${statusColor}cc 0%, ${statusColor}44 100%)`,
          boxShadow: `2px 0 10px ${statusColor}28`,
        }}
        aria-hidden="true"
      />

      <div className="relative flex-1 p-4 min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Category icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-display font-extrabold text-sm"
              style={{
                background: `linear-gradient(135deg, ${b.couleur}cc, ${b.couleur})`,
                boxShadow: `0 4px 10px ${b.couleur}44`,
              }}
              aria-hidden="true"
            >
              {b.label.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-display text-[13px] font-bold text-slate-100 truncate leading-tight">
                {b.label}
              </p>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                style={{ background: `${statusColor}15`, color: statusColor }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.depasse ? 'animate-pulse' : ''}`}
                  style={{ background: statusColor }}
                  aria-hidden="true"
                />
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Ring + action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <RingProgress pct={b.pourcentage} color={statusColor} size={48} />
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
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all focus:outline-none"
                style={{ color: 'rgba(100,116,139,0.6)', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(129,140,248,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.6)'; e.currentTarget.style.background = 'transparent' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(b)}
                aria-label={`Supprimer le budget ${b.label}`}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all focus:outline-none"
                style={{ color: 'rgba(100,116,139,0.6)', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(251,113,133,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.6)'; e.currentTarget.style.background = 'transparent' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span style={{ color: 'rgba(100,116,139,0.7)' }}>
              Dépensé :{' '}
              <span className="font-bold" style={{ color: b.depasse ? '#fb7185' : 'rgba(226,232,240,0.8)' }}>
                {fmt(b.depense)}
              </span>
            </span>
            <span className="font-bold tabular-nums" style={{ color: 'rgba(100,116,139,0.6)' }}>
              {fmt(b.montantMensuel)}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: `${statusColor}14` }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(b.pourcentage, 100)}%`,
                background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`,
                boxShadow: `0 0 8px ${statusColor}55`,
              }}
              role="progressbar"
              aria-valuenow={Math.round(b.pourcentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(100,116,139,0.55)' }}>Budget</p>
            <p className="font-display text-[13px] font-extrabold tabular-nums" style={{ color: 'rgba(226,232,240,0.85)' }}>
              {fmt(b.montantMensuel)}
            </p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: `${statusColor}0d` }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: `${statusColor}99` }}>
              {b.depasse ? 'Dépassement' : 'Restant'}
            </p>
            <p className="font-display text-[13px] font-extrabold tabular-nums" style={{ color: statusColor }}>
              {b.depasse
                ? `+${fmt(b.depense - b.montantMensuel)}`
                : fmt(b.restant)}
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
        style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
        aria-hidden="true"
      />
      <h2 className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em]" style={{ color }}>
        {label}
      </h2>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: color + '18', color }}
        aria-label={`${count} budget(s)`}
      >
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}25, transparent)` }} aria-hidden="true" />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Budgets() {
  const { state, dispatch } = useBudget()
  const fmt = useFormatMontant()
  const [mois, setMois]               = useState(state.settings.moisCourant)
  const [addOpen, setAddOpen]         = useState(false)
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

  const pctColor = pctGlobal >= 100 ? '#fb7185' : pctGlobal >= 80 ? '#fb923c' : '#34d399'

  const budgetsDepasses     = progression.filter(b => b.depasse)
  const budgetsAttention    = progression.filter(b => !b.depasse && b.pourcentage >= 80)
  const budgetsSousControle = progression.filter(b => b.pourcentage < 80)

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>Budgets</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            Planifiez et contrôlez vos dépenses par catégorie
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month navigator */}
          <div
            className="flex items-center gap-0.5 rounded-xl px-1 py-1"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => goMois(-1)}
              aria-label="Mois précédent"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold leading-none transition-all focus:outline-none"
              style={{ color: 'rgba(100,116,139,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.7)'; e.currentTarget.style.background = 'transparent' }}
            >
              ‹
            </button>
            <input
              type="month"
              value={mois}
              onChange={e => setMois(e.target.value)}
              aria-label="Sélectionner le mois"
              className="bg-transparent border-none outline-none text-[12px] font-bold w-28 text-center cursor-pointer focus:outline-none"
              style={{ color: 'rgba(226,232,240,0.9)', colorScheme: 'dark' }}
            />
            <button
              onClick={() => goMois(1)}
              aria-label="Mois suivant"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold leading-none transition-all focus:outline-none"
              style={{ color: 'rgba(100,116,139,0.7)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.7)'; e.currentTarget.style.background = 'transparent' }}
            >
              ›
            </button>
          </div>

          <Button onClick={() => setAddOpen(true)} className="hidden sm:flex">
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
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #050818 0%, #0a0d24 45%, #0d0a2e 100%)',
            boxShadow: '0 20px 60px rgba(5,8,24,0.5), 0 4px 16px rgba(99,102,241,0.08)',
          }}
        >
          {/* Prismatic top line */}
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.6) 30%, rgba(196,181,253,0.9) 50%, rgba(129,140,248,0.6) 70%, transparent 100%)' }}
            aria-hidden="true"
          />

          <div className="relative p-6 overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 90% 10%, rgba(99,102,241,0.1) 0%, transparent 60%)' }}
              aria-hidden="true" />
            <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 10% 90%, rgba(139,92,246,0.07) 0%, transparent 60%)' }}
              aria-hidden="true" />

            <div className="relative">
              {/* Month label + main numbers */}
              <div className="flex flex-wrap gap-4 items-start justify-between mb-5">
                <div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2"
                    style={{ color: 'rgba(129,140,248,0.6)' }}
                  >
                    {formatMois(mois)} — Vue d'ensemble
                  </p>
                  <p
                    className="font-display font-extrabold leading-none tabular-nums text-white"
                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
                  >
                    {fmt(totalDepense)}
                    <span className="text-slate-500 font-normal ml-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                      / {fmt(totalBudgete)}
                    </span>
                  </p>
                </div>

                {/* Stats trio */}
                <div className="flex gap-4 sm:gap-6 items-center">
                  <div className="text-center">
                    <p className="font-display text-xl font-extrabold text-white tabular-nums">{progression.length}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>
                      Budget{progression.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
                  <div className="text-center">
                    <p className="font-display text-xl font-extrabold tabular-nums" style={{ color: pctColor }}>
                      {Math.round(pctGlobal)}%
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Utilisé</p>
                  </div>
                  <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
                  <div className="text-center">
                    <p className="font-display text-xl font-extrabold tabular-nums text-emerald-400">
                      {fmt(totalRestant)}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Restant</p>
                  </div>
                </div>
              </div>

              {/* Global progress bar */}
              <div
                className="h-2 rounded-full overflow-hidden mb-3"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pctGlobal}%`,
                    background: `linear-gradient(90deg, ${pctColor}66, ${pctColor})`,
                    boxShadow: `0 0 16px ${pctColor}66`,
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(pctGlobal)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(pctGlobal)}% du budget mensuel utilisé`}
                />
              </div>

              {/* Status pills */}
              <div className="flex gap-2.5 flex-wrap">
                {nbDepasses > 0 && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                    style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.18)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold" style={{ color: '#fda4af' }}>
                      {nbDepasses} dépassé{nbDepasses > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {nbAttention > 0 && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                    style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.18)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold" style={{ color: '#fdba74' }}>
                      {nbAttention} à surveiller
                    </p>
                  </div>
                )}
                {budgetsSousControle.length > 0 && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.18)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-[11px] font-semibold" style={{ color: '#6ee7b7' }}>
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
        <div className="rounded-3xl" style={{ background: '#0b0e1c', border: '1px solid rgba(255,255,255,0.05)' }}>
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
              <SectionLabel label="Budgets dépassés" count={budgetsDepasses.length} color="#fb7185" pulse />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {budgetsDepasses.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}

          {budgetsAttention.length > 0 && (
            <div>
              <SectionLabel label="À surveiller" count={budgetsAttention.length} color="#fb923c" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {budgetsAttention.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}

          {budgetsSousControle.length > 0 && (
            <div>
              <SectionLabel label="Sous contrôle" count={budgetsSousControle.length} color="#34d399" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {budgetsSousControle.map(b => (
                  <BudgetCard key={b.id} b={b} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB mobile ── */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Nouveau budget"
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7c6af7 0%, #5b52e8 100%)',
          boxShadow: '0 8px 24px rgba(99,102,241,0.55)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
