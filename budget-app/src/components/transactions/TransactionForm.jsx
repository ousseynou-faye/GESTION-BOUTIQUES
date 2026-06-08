import { useState, useRef } from 'react'
import { CATEGORIES, CATEGORIES_REVENUS, CATEGORIES_DEPENSES } from '@/constants/categories'
import { format } from 'date-fns'
import { useFormatMontant } from '@/utils/useFormatMontant'

const defaultForm = {
  type:        'depense',
  montant:     '',
  categorie:   '',
  description: '',
  date:        format(new Date(), 'yyyy-MM-dd'),
  note:        '',
  recurrente:  false,
}

const QUICK_AMOUNTS = [5000, 10000, 50000, 100000, 200000, 500000, 1000000]

function FieldLabel({ children }) {
  return (
    <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 leading-none"
      style={{ color: 'rgba(100,116,139,0.7)' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'var(--border-separator)' }} aria-hidden="true" />
}

function StepIndicator({ etape }) {
  const done = etape === 2
  return (
    <div className="flex items-center gap-2 mb-1">
      {/* Step 1 */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={done
            ? { background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' }
            : { background: 'rgba(129,140,248,0.9)', color: '#fff', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }
          }
        >
          {done ? '✓' : '1'}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: done ? 'rgba(52,211,153,0.8)' : 'var(--text-primary)' }}>
          Montant
        </span>
      </div>
      {/* Connector */}
      <div className="flex-1 h-px" style={{ background: done ? 'rgba(52,211,153,0.3)' : 'var(--border-input)' }} aria-hidden="true" />
      {/* Step 2 */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={done
            ? { background: 'rgba(129,140,248,0.9)', color: '#fff', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }
            : { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' }
          }
        >
          2
        </div>
        <span className="text-[10px] font-semibold" style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          Détails
        </span>
      </div>
    </div>
  )
}

export function TransactionForm({ initial, onSubmit, onCancel }) {
  const fmt = useFormatMontant()
  const [etape, setEtape]   = useState(1)
  const [form, setForm]     = useState(initial
    ? { ...initial, montant: String(initial.montant), note: initial.note ?? '', recurrente: initial.recurrente ?? false }
    : defaultForm
  )
  const [errors, setErrors] = useState({})
  const montantInputRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isRevenu  = form.type === 'revenu'
  const typeColor = isRevenu ? '#34d399' : '#fb7185'
  const typeGrad  = isRevenu
    ? 'linear-gradient(135deg, #059669 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)'
  // CATEGORIES_REVENUS and CATEGORIES_DEPENSES are arrays of string keys
  const categorieKeys = isRevenu ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES

  function validateStep1() {
    const e = {}
    const montantNum = parseFloat(form.montant)
    if (!form.montant || isNaN(montantNum) || montantNum <= 0)
      e.montant = 'Le montant doit être supérieur à 0'
    else if (!Number.isInteger(montantNum))
      e.montant = 'Le montant doit être un nombre entier (sans centimes)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!form.categorie)          e.categorie   = 'Sélectionnez une catégorie'
    if (!form.description.trim()) e.description = 'Ajoutez une description'
    if (!form.date)               e.date        = 'Choisissez une date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep2()) return
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      type:        form.type,
      montant:     parseFloat(form.montant),
      categorie:   form.categorie,
      description: form.description.trim(),
      date:        form.date,
      note:        form.note.trim() || null,
      recurrente:  form.recurrente,
    })
  }

  // ── Étape 1 : Montant ────────────────────────────────────────────────────────
  if (etape === 1) {
    return (
      <div className="flex flex-col gap-4">

        <StepIndicator etape={1} />
        <Divider />

        {/* Type toggle */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}
        >
          {[
            { val: 'depense', label: 'Dépense', grad: 'linear-gradient(135deg,#e11d48,#fb7185)' },
            { val: 'revenu',  label: 'Revenu',  grad: 'linear-gradient(135deg,#059669,#34d399)' },
          ].map(({ val, label, grad }) => {
            const active = form.type === val
            return (
              <button
                key={val}
                type="button"
                onClick={() => { set('type', val); set('categorie', '') }}
                className="py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none"
                style={active
                  ? { background: grad, color: '#fff', boxShadow: val === 'depense' ? '0 4px 14px rgba(251,113,133,0.35)' : '0 4px 14px rgba(52,211,153,0.35)' }
                  : { color: 'rgba(100,116,139,0.7)', background: 'transparent' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Montant input */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Montant</FieldLabel>
          <div
            className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              background: errors.montant ? 'rgba(251,113,133,0.06)' : `${typeColor}0a`,
              border: `2px solid ${errors.montant ? '#fb7185' : typeColor + '30'}`,
            }}
            onClick={e => e.currentTarget.querySelector('input')?.focus()}
          >
            <span
              className="pl-4 font-display font-black leading-none select-none flex-shrink-0 text-[15px]"
              style={{ color: typeColor }}
              aria-hidden="true"
            >
              F CFA
            </span>
            <input
              ref={montantInputRef}
              type="number"
              step="1"
              min="1"
              placeholder="0"
              value={form.montant}
              onChange={e => { set('montant', e.target.value); if (errors.montant) setErrors({}) }}
              aria-label="Montant de la transaction"
              autoFocus
              className="flex-1 bg-transparent pl-2 pr-4 py-4 font-display font-black focus:outline-none min-w-0"
              style={{ color: typeColor, caretColor: typeColor, fontSize: '2.25rem', letterSpacing: '-0.01em' }}
              onFocus={e => {
                const w = e.currentTarget.parentElement
                if (!errors.montant) w.style.borderColor = typeColor + '70'
                w.style.boxShadow = `0 0 0 3px ${typeColor}18`
              }}
              onBlur={e => {
                const w = e.currentTarget.parentElement
                w.style.borderColor = errors.montant ? '#fb7185' : typeColor + '30'
                w.style.boxShadow = 'none'
              }}
            />
          </div>
          {errors.montant && (
            <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: '#fb7185' }} role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              {errors.montant}
            </p>
          )}
        </div>

        {/* Montants rapides F CFA */}
        <div>
          <FieldLabel>Montants rapides</FieldLabel>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map(amt => {
              const selected = String(form.montant) === String(amt)
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { set('montant', String(amt)); setErrors({}) }}
                  className="py-2.5 rounded-xl text-center transition-all duration-150 focus:outline-none"
                  style={{
                    background: selected ? `${typeColor}18` : 'var(--bg-subtle)',
                    border: `1px solid ${selected ? typeColor + '55' : 'var(--border-input)'}`,
                    boxShadow: selected ? `0 0 10px ${typeColor}22` : 'none',
                  }}
                  onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'var(--bg-subtle-hover)'; e.currentTarget.style.borderColor = typeColor + '30' } }}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-input)' } }}
                >
                  <span
                    className="font-display text-[11px] font-bold tabular-nums block"
                    style={{ color: selected ? typeColor : 'var(--text-secondary)' }}
                  >
                    {new Intl.NumberFormat('fr-FR').format(amt)}
                  </span>
                </button>
              )
            })}
            {/* Autre */}
            <button
              type="button"
              onClick={() => { set('montant', ''); setErrors({}); setTimeout(() => montantInputRef.current?.focus(), 50) }}
              className="py-2.5 rounded-xl text-center transition-all duration-150 focus:outline-none"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-input)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
            >
              <span className="font-display text-[11px] font-bold block" style={{ color: 'rgba(100,116,139,0.7)' }}>
                Autre
              </span>
            </button>
          </div>
        </div>

        <Divider />

        {/* Boutons étape 1 */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 rounded-2xl text-sm font-semibold transition-all focus:outline-none"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => validateStep1() && setEtape(2)}
            className="py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all focus:outline-none"
            style={{ background: typeGrad, boxShadow: `0 6px 20px ${typeColor}44` }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Suivant
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ── Étape 2 : Détails ────────────────────────────────────────────────────────
  const montantFormate = form.montant ? fmt(parseFloat(form.montant)) : ''
  const typeLabel      = isRevenu ? 'Revenu' : 'Dépense'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <StepIndicator etape={2} />

      {/* Récapitulatif montant */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: `${typeColor}0a`, border: `1px solid ${typeColor}25` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeGrad, boxShadow: `0 4px 12px ${typeColor}44` }}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            {isRevenu
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            }
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${typeColor}88` }}>{typeLabel}</p>
          <p className="font-display text-base font-extrabold tabular-nums" style={{ color: typeColor }}>{montantFormate}</p>
        </div>
      </div>

      <Divider />

      {/* Catégorie */}
      <div>
        <FieldLabel>Catégorie</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {categorieKeys.map(key => {
            const cat    = CATEGORIES[key]
            const active = form.categorie === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => { set('categorie', key); if (errors.categorie) setErrors(er => ({ ...er, categorie: undefined })) }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all focus:outline-none"
                style={{
                  background: active ? `${cat.couleur}20` : 'var(--bg-subtle)',
                  border:     `1px solid ${active ? cat.couleur + '55' : 'var(--border-input)'}`,
                  color:      active ? cat.couleur : 'var(--text-secondary)',
                  boxShadow:  active ? `0 0 10px ${cat.couleur}22` : 'none',
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.couleur, boxShadow: active ? `0 0 6px ${cat.couleur}` : 'none' }} aria-hidden="true" />
                {cat.label}
              </button>
            )
          })}
        </div>
        {errors.categorie && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-2" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {errors.categorie}
          </p>
        )}
      </div>

      <Divider />

      {/* Description + Date */}
      <div className="grid grid-cols-2 gap-3">
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Description</FieldLabel>
          <input
            type="text"
            aria-label="Description de la transaction"
            placeholder="ex : Courses marché"
            value={form.description}
            onChange={e => { set('description', e.target.value); if (errors.description) setErrors(er => ({ ...er, description: undefined })) }}
            aria-invalid={errors.description ? 'true' : undefined}
            className="w-full px-3 py-2.5 text-sm font-medium rounded-xl focus:outline-none"
            style={{
              background: errors.description ? 'rgba(251,113,133,0.06)' : 'var(--bg-subtle)',
              border: `1px solid ${errors.description ? 'rgba(251,113,133,0.5)' : 'var(--border-input)'}`,
              color: 'var(--text-primary)',
            }}
            onFocus={e => { if (!errors.description) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' } }}
            onBlur={e => { e.currentTarget.style.borderColor = errors.description ? 'rgba(251,113,133,0.5)' : 'var(--border-input)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.description && (
            <p className="text-[10px] font-medium" style={{ color: '#fb7185' }} role="alert">{errors.description}</p>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Date</FieldLabel>
          <input
            type="date"
            aria-label="Date de la transaction"
            value={form.date}
            onChange={e => { set('date', e.target.value); if (errors.date) setErrors(er => ({ ...er, date: undefined })) }}
            aria-invalid={errors.date ? 'true' : undefined}
            className="w-full px-3 py-2.5 text-sm font-medium rounded-xl focus:outline-none"
            style={{
              background: errors.date ? 'rgba(251,113,133,0.06)' : 'var(--bg-subtle)',
              border: `1px solid ${errors.date ? 'rgba(251,113,133,0.5)' : 'var(--border-input)'}`,
              color: 'var(--text-primary)',
              colorScheme: 'var(--color-scheme)',
            }}
            onFocus={e => { if (!errors.date) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' } }}
            onBlur={e => { e.currentTarget.style.borderColor = errors.date ? 'rgba(251,113,133,0.5)' : 'var(--border-input)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {errors.date && (
            <p className="text-[10px] font-medium" style={{ color: '#fb7185' }} role="alert">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '9px', color: 'rgba(100,116,139,0.4)' }}>(optionnel)</span></FieldLabel>
        <textarea
          maxLength={500}
          placeholder="Détails supplémentaires…"
          value={form.note}
          onChange={e => set('note', e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none resize-none"
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-input)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>

      {/* Récurrente */}
      <button
        type="button"
        onClick={() => set('recurrente', !form.recurrente)}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all focus:outline-none text-left"
        style={{
          background: form.recurrente ? 'rgba(99,102,241,0.1)' : 'var(--bg-subtle)',
          border: `1px solid ${form.recurrente ? 'rgba(129,140,248,0.3)' : 'var(--border-card)'}`,
        }}
        aria-pressed={form.recurrente}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: form.recurrente ? 'rgba(99,102,241,0.9)' : 'var(--border-card)',
            border: `1px solid ${form.recurrente ? 'transparent' : 'var(--border-input)'}`,
            boxShadow: form.recurrente ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }}
          aria-hidden="true"
        >
          {form.recurrente && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: form.recurrente ? '#a5b4fc' : 'var(--text-secondary)' }}>
            Transaction récurrente
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(100,116,139,0.6)' }}>
            Se reproduit chaque mois automatiquement
          </p>
        </div>
      </button>

      <Divider />

      {/* Boutons étape 2 */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-2">
        <button
          type="button"
          onClick={() => { setEtape(1); setErrors({}) }}
          className="py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          type="submit"
          className="py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all focus:outline-none"
          style={{ background: typeGrad, boxShadow: `0 6px 20px ${typeColor}44` }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {initial ? 'Enregistrer' : `Ajouter la ${typeLabel.toLowerCase()}`}
        </button>
      </div>
    </form>
  )
}
