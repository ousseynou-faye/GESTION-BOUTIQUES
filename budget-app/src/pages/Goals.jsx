import { useState } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { getObjectifProgression } from '@/utils/calculations'
import { formatMontant, formatDate } from '@/utils/formatters'

const COULEURS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

// ─── SVG ring progress ────────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 88 }) {
  const sw   = 5.5
  const r    = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = circ - (Math.min(pct, 100) / 100) * circ

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', position: 'absolute' }}
        aria-hidden="true"
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} stroke={color + '18'} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={sw} stroke={color}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 5px ${color}88)`,
          }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="font-display text-[18px] font-black tabular-nums leading-none" style={{ color }}>
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

  const goalColor = form.couleur || '#6366f1'

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

  const labelStyle = { color: 'rgba(100,116,139,0.8)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Colour picker ── */}
      <div className="flex flex-col gap-2.5">
        <span className="font-display block leading-none" style={labelStyle}>Couleur de l'objectif</span>
        <div className="flex gap-2.5 flex-wrap">
          {COULEURS.map(c => (
            <button
              key={c} type="button"
              onClick={() => set('couleur', c)}
              aria-label={`Couleur ${c}`}
              aria-pressed={form.couleur === c}
              className="w-9 h-9 rounded-full transition-all duration-200 focus:outline-none"
              style={{
                backgroundColor: c,
                transform: form.couleur === c ? 'scale(1.2)' : 'scale(1)',
                boxShadow: form.couleur === c
                  ? `0 0 0 3px rgba(10,12,28,1), 0 0 0 5px ${c}, 0 4px 14px ${c}66`
                  : `0 2px 6px ${c}44`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />

      {/* ── Name ── */}
      <div className="flex flex-col gap-1.5">
        <span className="font-display block leading-none" style={labelStyle}>Nom de l'objectif</span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke={goalColor} strokeWidth={2} style={{ opacity: 0.7 }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 7h18M3 12h18M3 17h12" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="ex : Vacances été 2027"
            value={form.nom}
            onChange={e => set('nom', e.target.value)}
            aria-invalid={errors.nom ? 'true' : undefined}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl focus:outline-none transition-all duration-200"
            style={{
              background: errors.nom ? 'rgba(251,113,133,0.06)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${errors.nom ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: '#e2e8f0',
              caretColor: goalColor,
            }}
            onFocus={e => { if (!errors.nom) e.currentTarget.style.borderColor = goalColor + '60'; e.currentTarget.style.boxShadow = `0 0 0 3px ${goalColor}14` }}
            onBlur={e => { e.currentTarget.style.borderColor = errors.nom ? 'rgba(251,113,133,0.5)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
        {errors.nom && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {errors.nom}
          </p>
        )}
      </div>

      {/* ── Description ── */}
      <div className="flex flex-col gap-1.5">
        <span className="font-display block leading-none" style={labelStyle}>Description <span style={{ color: 'rgba(100,116,139,0.4)', textTransform: 'none', letterSpacing: 0, fontSize: '9px' }}>(optionnel)</span></span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="rgba(100,116,139,0.5)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Décrivez votre objectif"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl focus:outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              caretColor: goalColor,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = goalColor + '60'; e.currentTarget.style.boxShadow = `0 0 0 3px ${goalColor}14` }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />

      {/* ── Amounts ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Target amount */}
        <div className="flex flex-col gap-1.5">
          <span className="font-display block leading-none" style={labelStyle}>Montant cible</span>
          <div
            className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
            style={{
              background: errors.montantCible ? 'rgba(251,113,133,0.06)' : `${goalColor}0a`,
              border: `2px solid ${errors.montantCible ? '#fb7185' : goalColor + '30'}`,
            }}
            onClick={e => e.currentTarget.querySelector('input')?.focus()}
          >
            <span
              className="pl-3.5 font-display font-black leading-none select-none flex-shrink-0"
              style={{ color: goalColor, fontSize: '0.85rem' }}
              aria-hidden="true"
            >F CFA</span>
            <input
              type="number" step="1" min="1" placeholder="0"
              value={form.montantCible}
              onChange={e => set('montantCible', e.target.value)}
              aria-label="Montant cible"
              className="flex-1 bg-transparent pl-1.5 pr-3 py-3 font-display font-bold focus:outline-none min-w-0"
              style={{ color: goalColor, caretColor: goalColor, fontSize: '1.25rem' }}
              onFocus={e => {
                const w = e.currentTarget.parentElement
                if (!errors.montantCible) w.style.borderColor = goalColor + '60'
                w.style.boxShadow = `0 0 0 3px ${goalColor}18`
              }}
              onBlur={e => {
                const w = e.currentTarget.parentElement
                w.style.borderColor = errors.montantCible ? '#fb7185' : goalColor + '30'
                w.style.boxShadow = 'none'
              }}
            />
          </div>
          {errors.montantCible && (
            <p className="text-xs font-medium flex items-center gap-1 mt-0.5" style={{ color: '#fb7185' }} role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {errors.montantCible}
            </p>
          )}
        </div>

        {/* Already saved */}
        <div className="flex flex-col gap-1.5">
          <span className="font-display block leading-none" style={labelStyle}>Déjà épargné</span>
          <div
            className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
            style={{
              background: 'rgba(52,211,153,0.06)',
              border: '2px solid rgba(52,211,153,0.2)',
            }}
            onClick={e => e.currentTarget.querySelector('input')?.focus()}
          >
            <span
              className="pl-3.5 font-display font-black leading-none select-none flex-shrink-0"
              style={{ color: '#34d399', fontSize: '0.85rem' }}
              aria-hidden="true"
            >F CFA</span>
            <input
              type="number" step="1" min="0" placeholder="0"
              value={form.montantActuel}
              onChange={e => set('montantActuel', e.target.value)}
              aria-label="Montant déjà épargné"
              className="flex-1 bg-transparent pl-1.5 pr-3 py-3 font-display font-bold focus:outline-none min-w-0"
              style={{ color: '#34d399', caretColor: '#34d399', fontSize: '1.25rem' }}
              onFocus={e => { e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.12)' }}
              onBlur={e => { e.currentTarget.parentElement.style.boxShadow = 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── Date ── */}
      <div className="flex flex-col gap-1.5">
        <span className="font-display block leading-none" style={labelStyle}>Date d'échéance <span style={{ color: 'rgba(100,116,139,0.4)', textTransform: 'none', letterSpacing: 0, fontSize: '9px' }}>(optionnel)</span></span>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="rgba(100,116,139,0.5)" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <input
            type="date"
            value={form.dateEcheance}
            onChange={e => set('dateEcheance', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl focus:outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              colorScheme: 'dark',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = goalColor + '60'; e.currentTarget.style.boxShadow = `0 0 0 3px ${goalColor}14` }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-all focus:outline-none"
          style={{
            background: `linear-gradient(135deg, ${goalColor}dd, ${goalColor})`,
            boxShadow: `0 6px 20px ${goalColor}44`,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {initial ? 'Enregistrer' : "Créer l'objectif"}
        </button>
      </div>
    </form>
  )
}

// ─── Deposit form ─────────────────────────────────────────────────────────────
function DepositForm({ goal, onSubmit, onCancel }) {
  const [montant, setMontant] = useState('')
  const [error, setError]     = useState('')
  const restant = Math.max(0, goal.montantCible - goal.montantActuel)
  const pct = goal.montantCible > 0 ? Math.min(100, (goal.montantActuel / goal.montantCible) * 100) : 0

  function handleSubmit(e) {
    e.preventDefault()
    const val = parseFloat(montant)
    if (!val || val <= 0) { setError('Montant invalide'); return }
    onSubmit(Math.min(val, restant))
  }

  const suggestions = [
    { label: '10%', val: Math.round(restant * 0.1) },
    { label: '25%', val: Math.round(restant * 0.25) },
    { label: '50%', val: Math.round(restant * 0.5) },
    { label: 'Tout', val: Math.round(restant) },
  ].filter(s => s.val > 0).filter((s, i, a) => a.findIndex(x => x.val === s.val) === i)

  const labelStyle = { color: 'rgba(100,116,139,0.8)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Goal summary card ── */}
      <div
        className="rounded-2xl p-4 overflow-hidden relative"
        style={{ background: `${goal.couleur}0c`, border: `1px solid ${goal.couleur}28` }}
      >
        {/* Top prismatic line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${goal.couleur}88, ${goal.couleur}, ${goal.couleur}88, transparent)` }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-base flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${goal.couleur}bb, ${goal.couleur})`,
              boxShadow: `0 4px 14px ${goal.couleur}44`,
            }}
            aria-hidden="true"
          >
            {goal.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-slate-100 truncate">{goal.nom}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: 'rgba(100,116,139,0.7)' }}>
                {formatMontant(goal.montantActuel)} / {formatMontant(goal.montantCible)}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span className="text-xs font-bold" style={{ color: goal.couleur }}>
                {formatMontant(restant)} restant
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="font-display text-xs font-extrabold tabular-nums" style={{ color: goal.couleur }}>
              {Math.round(pct)}%
            </span>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${goal.couleur}88, ${goal.couleur})`,
              boxShadow: `0 0 8px ${goal.couleur}66`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* ── Amount input ── */}
      <div className="flex flex-col gap-2.5">
        <span className="font-display block leading-none" style={labelStyle}>Montant à déposer</span>
        {/* € and input in a flex row — no absolute positioning overlap */}
        <div
          className="flex items-center rounded-2xl transition-all duration-200"
          style={{
            background: error ? 'rgba(251,113,133,0.06)' : `${goal.couleur}0a`,
            border: `2px solid ${error ? '#fb7185' : goal.couleur + '30'}`,
          }}
          onClick={e => e.currentTarget.querySelector('input')?.focus()}
        >
          <span
            className="pl-5 font-display font-black leading-none select-none flex-shrink-0"
            style={{ color: goal.couleur, fontSize: '1.1rem' }}
            aria-hidden="true"
          >F CFA</span>
          <input
            type="number" step="1" min="1" placeholder="0"
            value={montant}
            onChange={e => { setMontant(e.target.value); if (error) setError('') }}
            aria-label="Montant à déposer"
            className="flex-1 bg-transparent pl-2 pr-5 py-4 font-display font-black focus:outline-none min-w-0"
            style={{
              color: goal.couleur,
              caretColor: goal.couleur,
              fontSize: '2.25rem',
              letterSpacing: '-0.01em',
            }}
            onFocus={e => {
              const w = e.currentTarget.parentElement
              if (!error) w.style.borderColor = goal.couleur + '70'
              w.style.boxShadow = `0 0 0 3px ${goal.couleur}18`
            }}
            onBlur={e => {
              const w = e.currentTarget.parentElement
              w.style.borderColor = error ? '#fb7185' : goal.couleur + '30'
              w.style.boxShadow = 'none'
            }}
          />
        </div>
        {error && (
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-display block leading-none" style={labelStyle}>Suggestions rapides</span>
          <div className="grid grid-cols-4 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i} type="button"
                onClick={() => { setMontant(String(s.val)); setError('') }}
                className="flex flex-col items-center py-2.5 px-2 rounded-xl transition-all duration-150 focus:outline-none"
                style={{
                  border: `1px solid ${String(montant) === String(s.val) ? goal.couleur + '60' : goal.couleur + '25'}`,
                  background: String(montant) === String(s.val) ? `${goal.couleur}18` : `${goal.couleur}08`,
                  boxShadow: String(montant) === String(s.val) ? `0 0 12px ${goal.couleur}22` : 'none',
                }}
                onMouseEnter={e => { if (String(montant) !== String(s.val)) { e.currentTarget.style.background = `${goal.couleur}12`; e.currentTarget.style.borderColor = goal.couleur + '40' } }}
                onMouseLeave={e => { if (String(montant) !== String(s.val)) { e.currentTarget.style.background = `${goal.couleur}08`; e.currentTarget.style.borderColor = goal.couleur + '25' } }}
              >
                <span className="font-display text-[10px] font-bold uppercase tracking-wide" style={{ color: goal.couleur + 'cc' }}>{s.label}</span>
                <span className="font-display text-xs font-extrabold tabular-nums mt-0.5" style={{ color: goal.couleur }}>
                  {formatMontant(s.val)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white flex items-center justify-center gap-2 transition-all focus:outline-none"
          style={{
            background: `linear-gradient(135deg, ${goal.couleur}dd, ${goal.couleur})`,
            boxShadow: `0 6px 20px ${goal.couleur}44`,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Déposer les fonds
        </button>
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
    <div
      className="rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#0b0e1c',
        border: `1px solid ${goal.couleur}28`,
        boxShadow: `0 4px 24px ${goal.couleur}12, 0 2px 12px rgba(0,0,0,0.3)`,
      }}
    >
      {/* ── Header zone ── */}
      <div
        className="relative px-5 pt-5 pb-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${goal.couleur}12 0%, ${goal.couleur}04 100%)` }}
      >
        {/* Decorative ambient circles */}
        <div className="absolute right-[-28px] top-[-28px] w-32 h-32 rounded-full pointer-events-none"
          style={{ background: goal.couleur + '10' }} aria-hidden="true" />
        <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 rounded-full pointer-events-none"
          style={{ background: goal.couleur + '06' }} aria-hidden="true" />

        {/* Prismatic top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${goal.couleur}66, ${goal.couleur}cc, ${goal.couleur}66, transparent)` }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-4">
          {/* Ring or completion check */}
          <div className="flex-shrink-0">
            {atteint ? (
              <div
                className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
                style={{
                  background: `${goal.couleur}12`,
                  border: `5px solid ${goal.couleur}`,
                  boxShadow: `0 0 20px ${goal.couleur}44`,
                }}
                aria-label="Objectif atteint"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24"
                  stroke={goal.couleur} strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <RingProgress pct={pct} color={goal.couleur} size={80} />
            )}
          </div>

          {/* Info + action buttons */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-[13px] font-extrabold leading-tight truncate"
                  style={{ color: 'rgba(226,232,240,0.95)' }}>
                  {goal.nom}
                </h3>
                {goal.description && (
                  <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed"
                    style={{ color: 'rgba(100,116,139,0.75)' }}>
                    {goal.description}
                  </p>
                )}
                {atteint && (
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: goal.couleur, boxShadow: `0 2px 8px ${goal.couleur}55` }}
                  >
                    ✓ Objectif atteint !
                  </span>
                )}
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(goal)}
                  aria-label={`Modifier l'objectif ${goal.nom}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all focus:outline-none"
                  style={{ color: 'rgba(100,116,139,0.6)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(129,140,248,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.6)'; e.currentTarget.style.background = 'transparent' }}
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
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all focus:outline-none"
                  style={{ color: 'rgba(100,116,139,0.6)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(251,113,133,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100,116,139,0.6)'; e.currentTarget.style.background = 'transparent' }}
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

      {/* ── Progress bar ── */}
      <div className="h-1.5 w-full" style={{ background: `${goal.couleur}10` }}>
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: `linear-gradient(90deg, ${goal.couleur}88, ${goal.couleur})`,
            boxShadow: `0 0 8px ${goal.couleur}66`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-3.5 flex-1">
        {/* Amounts */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-0.5"
              style={{ color: 'rgba(100,116,139,0.55)' }}>Épargné</p>
            <p className="font-display text-xl font-extrabold tabular-nums leading-none"
              style={{ color: 'rgba(226,232,240,0.95)' }}>
              {formatMontant(goal.montantActuel)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-0.5"
              style={{ color: 'rgba(100,116,139,0.55)' }}>Objectif</p>
            <p className="font-display text-xl font-extrabold tabular-nums leading-none"
              style={{ color: 'rgba(226,232,240,0.95)' }}>
              {formatMontant(goal.montantCible)}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3 py-2.5" style={{ background: `${goal.couleur}0a` }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: `${goal.couleur}88` }}>Restant</p>
            <p className="font-display text-[13px] font-extrabold tabular-nums" style={{ color: goal.couleur }}>
              {formatMontant(restant)}
            </p>
          </div>
          {jours !== null ? (
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: urgence ? 'rgba(251,146,60,0.08)' : 'rgba(255,255,255,0.03)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: urgence ? '#fb923c' : 'rgba(100,116,139,0.55)' }}>
                {jours > 0 ? 'Jours restants' : 'Échéance'}
              </p>
              <p className="font-display text-[13px] font-extrabold tabular-nums"
                style={{ color: urgence ? '#fb923c' : 'rgba(100,116,139,0.8)' }}>
                {jours > 0 ? `${jours} j` : jours === 0 ? "Aujourd'hui" : 'Dépassée'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'rgba(100,116,139,0.55)' }}>Échéance</p>
              <p className="font-display text-[13px] font-bold"
                style={{ color: 'rgba(100,116,139,0.5)' }}>Non définie</p>
            </div>
          )}
        </div>

        {/* Monthly savings tip */}
        {mensualiteRequise !== null && mensualiteRequise > 0 && !atteint && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: `${goal.couleur}0a`, border: `1px solid ${goal.couleur}1e` }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${goal.couleur}18` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke={goal.couleur} strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: `${goal.couleur}88` }}>À épargner / mois</p>
              <p className="font-display text-[13px] font-extrabold tabular-nums" style={{ color: goal.couleur }}>
                {formatMontant(mensualiteRequise)}
              </p>
            </div>
          </div>
        )}

        {/* Deadline */}
        {goal.dateEcheance && (
          <p className="text-[11px] text-center" style={{ color: 'rgba(100,116,139,0.6)' }}>
            Échéance :{' '}
            <span className="font-bold" style={{ color: 'rgba(148,163,184,0.8)' }}>
              {formatDate(goal.dateEcheance)}
            </span>
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {atteint ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm"
              style={{ background: `${goal.couleur}12`, color: goal.couleur, border: `1px solid ${goal.couleur}28` }}
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-display text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-100"
              style={{
                background: `linear-gradient(135deg, ${goal.couleur}dd, ${goal.couleur})`,
                boxShadow: `0 6px 20px ${goal.couleur}44`,
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

  const totalCible   = state.goals.reduce((s, g) => s + g.montantCible, 0)
  const totalEpargne = state.goals.reduce((s, g) => s + g.montantActuel, 0)
  const nbAtteints   = state.goals.filter(g => g.montantActuel >= g.montantCible).length
  const pctGlobal    = totalCible > 0 ? Math.min(100, (totalEpargne / totalCible) * 100) : 0

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>
            Objectifs d'épargne
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            Suivez la progression de vos projets financiers
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="hidden sm:flex flex-shrink-0">
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
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 90% 10%, rgba(99,102,241,0.1) 0%, transparent 60%)' }}
              aria-hidden="true" />
            <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 10% 90%, rgba(139,92,246,0.07) 0%, transparent 60%)' }}
              aria-hidden="true" />

            <div className="relative flex flex-wrap gap-4 items-center justify-between">
              {/* Left: main amount + progress */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-2"
                  style={{ color: 'rgba(129,140,248,0.6)' }}>
                  Vue d'ensemble — {state.goals.length} objectif{state.goals.length > 1 ? 's' : ''}
                </p>
                <p
                  className="font-display font-extrabold leading-none tabular-nums text-white"
                  style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
                >
                  {formatMontant(totalEpargne)}
                  <span className="text-slate-500 font-normal ml-2" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                    / {formatMontant(totalCible)}
                  </span>
                </p>

                {/* Progress bar */}
                <div className="mt-3 h-2 rounded-full overflow-hidden w-52" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pctGlobal}%`,
                      background: 'linear-gradient(90deg, rgba(129,140,248,0.7), #818cf8)',
                      boxShadow: '0 0 16px rgba(129,140,248,0.6)',
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(pctGlobal)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(100,116,139,0.7)' }}>
                  {Math.round(pctGlobal)}% de l'objectif total atteint
                </p>
              </div>

              {/* Right: stats trio */}
              <div className="flex gap-4 sm:gap-6 items-center">
                <div className="text-center">
                  <p className="font-display text-xl font-extrabold text-white tabular-nums">{state.goals.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>
                    Objectif{state.goals.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
                <div className="text-center">
                  <p className="font-display text-xl font-extrabold tabular-nums" style={{ color: '#a5b4fc' }}>
                    {formatMontant(totalEpargne)}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Épargné</p>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
                <div className="text-center">
                  <p className="font-display text-xl font-extrabold text-emerald-400 tabular-nums">
                    {nbAtteints} / {state.goals.length}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>Atteints</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Goals grid ── */}
      {state.goals.length === 0 ? (
        <div className="rounded-3xl" style={{ background: '#0b0e1c', border: '1px solid rgba(255,255,255,0.05)' }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* ── FAB mobile ── */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Nouvel objectif"
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
