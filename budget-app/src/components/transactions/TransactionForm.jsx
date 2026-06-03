import { useState } from 'react'
import { CATEGORIES, CATEGORIES_REVENUS, CATEGORIES_DEPENSES } from '@/constants/categories'
import { format } from 'date-fns'

const defaultForm = {
  type:        'depense',
  montant:     '',
  categorie:   '',
  description: '',
  date:        format(new Date(), 'yyyy-MM-dd'),
  note:        '',
  recurrente:  false,
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000]

function FieldLabel({ children }) {
  return (
    <p className="font-display text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 leading-none"
      style={{ color: 'rgba(100,116,139,0.7)' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} aria-hidden="true" />
}

export function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial
    ? { ...initial, montant: String(initial.montant), note: initial.note ?? '', recurrente: initial.recurrente ?? false }
    : defaultForm
  )
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isRevenu  = form.type === 'revenu'
  const typeColor = isRevenu ? '#34d399' : '#fb7185'
  const typeGrad  = isRevenu
    ? 'linear-gradient(135deg, #059669 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)'
  const categoriesFiltrees = isRevenu ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES

  function validate() {
    const e = {}
    if (!form.montant || isNaN(parseFloat(form.montant)) || parseFloat(form.montant) <= 0)
      e.montant = 'Le montant doit être supérieur à 0'
    if (!form.categorie)          e.categorie   = 'Sélectionnez une catégorie'
    if (!form.description.trim()) e.description = 'Ajoutez une description'
    if (!form.date)               e.date        = 'Choisissez une date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Type toggle ── */}
      <div
        className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {[
          {
            key: 'depense', label: 'Dépense',
            grad: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
            glow: 'rgba(251,113,133,0.35)',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>,
          },
          {
            key: 'revenu', label: 'Revenu',
            grad: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
            glow: 'rgba(52,211,153,0.35)',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>,
          },
        ].map(t => {
          const active = form.type === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { set('type', t.key); set('categorie', '') }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold transition-all duration-200"
              style={active ? {
                background: t.grad, color: '#fff',
                boxShadow: `0 4px 16px ${t.glow}`,
              } : {
                color: 'rgba(100,116,139,0.7)',
                background: 'transparent',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Montant ── */}
      <div>
        <FieldLabel>Montant</FieldLabel>

        {/* Amount input: € and input share a flex row — no absolute positioning overlap */}
        <div
          className="flex items-center rounded-2xl transition-all duration-200"
          style={{
            background: `${typeColor}0a`,
            border: `2px solid ${errors.montant ? '#fb7185' : typeColor + '30'}`,
            boxShadow: errors.montant ? `0 0 0 3px rgba(251,113,133,0.12)` : 'none',
          }}
          onClick={e => e.currentTarget.querySelector('input')?.focus()}
        >
          <span
            className="pl-5 font-display font-black leading-none select-none flex-shrink-0"
            style={{ color: typeColor, fontSize: '1.1rem' }}
            aria-hidden="true"
          >F CFA</span>
          <input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={form.montant}
            onChange={e => set('montant', e.target.value)}
            aria-label="Montant"
            aria-invalid={errors.montant ? 'true' : undefined}
            className="flex-1 bg-transparent pl-2 pr-5 py-4 font-display font-black focus:outline-none min-w-0"
            style={{
              color: typeColor,
              caretColor: typeColor,
              fontSize: '2.25rem',
              letterSpacing: '-0.01em',
            }}
            onFocus={e => {
              const wrap = e.currentTarget.parentElement
              if (!errors.montant) wrap.style.borderColor = typeColor + '70'
              wrap.style.boxShadow = `0 0 0 3px ${typeColor}18`
            }}
            onBlur={e => {
              const wrap = e.currentTarget.parentElement
              wrap.style.borderColor = errors.montant ? '#fb7185' : typeColor + '30'
              wrap.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Error OR quick amounts */}
        {errors.montant ? (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-2" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {errors.montant}
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-1.5 mt-2.5">
            {QUICK_AMOUNTS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => set('montant', String(v))}
                className="py-2.5 text-xs font-bold rounded-xl transition-all duration-150 focus:outline-none"
                style={{
                  background: String(form.montant) === String(v) ? `${typeColor}22` : `${typeColor}0e`,
                  color: typeColor,
                  border: `1px solid ${String(form.montant) === String(v) ? typeColor + '55' : typeColor + '22'}`,
                  boxShadow: String(form.montant) === String(v) ? `0 2px 8px ${typeColor}22` : 'none',
                }}
                onMouseEnter={e => { if (String(form.montant) !== String(v)) e.currentTarget.style.background = `${typeColor}18` }}
                onMouseLeave={e => { if (String(form.montant) !== String(v)) e.currentTarget.style.background = `${typeColor}0e` }}
              >
                {v.toLocaleString('fr-FR')}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* ── Catégorie ── */}
      <div>
        <FieldLabel>Catégorie</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {categoriesFiltrees.map(k => {
            const cat      = CATEGORIES[k]
            const selected = form.categorie === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => set('categorie', k)}
                aria-pressed={selected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 focus:outline-none"
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
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = `${cat.couleur}20`; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = `${cat.couleur}45` } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = `${cat.couleur}0d`; e.currentTarget.style.color = 'rgba(148,163,184,0.85)'; e.currentTarget.style.borderColor = `${cat.couleur}25` } }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: selected ? 'rgba(255,255,255,0.85)' : cat.couleur }}
                  aria-hidden="true"
                />
                {cat.label}
                {selected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {errors.categorie && (
          <p className="text-xs font-medium flex items-center gap-1.5 mt-2" style={{ color: '#fb7185' }} role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {errors.categorie}
          </p>
        )}
      </div>

      <Divider />

      {/* ── Description + Date ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Description */}
        <div>
          <FieldLabel>Description</FieldLabel>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: errors.description ? '#fb7185' : 'rgba(100,116,139,0.5)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <input
              type="text"
              placeholder="ex : Courses Carrefour"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              aria-label="Description"
              aria-invalid={errors.description ? 'true' : undefined}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200"
              style={{
                background: errors.description ? 'rgba(251,113,133,0.06)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.description ? 'rgba(251,113,133,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: 'rgba(226,232,240,0.9)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = errors.description ? 'rgba(251,113,133,0.6)' : 'rgba(129,140,248,0.45)'
                e.currentTarget.style.boxShadow = errors.description ? '0 0 0 3px rgba(251,113,133,0.1)' : '0 0 0 3px rgba(129,140,248,0.1)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.description ? 'rgba(251,113,133,0.45)' : 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          {errors.description && (
            <p className="text-xs font-medium flex items-center gap-1.5 mt-1.5" style={{ color: '#fb7185' }} role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {errors.description}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <FieldLabel>Date</FieldLabel>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'rgba(100,116,139,0.5)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              aria-label="Date"
              aria-invalid={errors.date ? 'true' : undefined}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.date ? 'rgba(251,113,133,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: 'rgba(226,232,240,0.9)',
                colorScheme: 'dark',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          {errors.date && (
            <p className="text-xs font-medium flex items-center gap-1.5 mt-1.5" style={{ color: '#fb7185' }} role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <Divider />

      {/* ── Note ── */}
      <div>
        <FieldLabel>Note <span style={{ color: 'rgba(100,116,139,0.5)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optionnel)</span></FieldLabel>
        <div className="relative">
          <textarea
            placeholder="Ajouter un commentaire, référence, contexte…"
            value={form.note}
            onChange={e => set('note', e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all duration-200 resize-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(226,232,240,0.9)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />
          <span
            className="absolute bottom-2 right-3 text-[10px] select-none"
            style={{ color: 'rgba(100,116,139,0.5)' }}
          >
            {form.note.length} / 500
          </span>
        </div>
      </div>

      {/* ── Récurrence ── */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.recurrente}
          onChange={e => set('recurrente', e.target.checked)}
          className="sr-only"
        />
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150"
          style={form.recurrente ? {
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            border: '1px solid #818cf8',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          aria-hidden="true"
        >
          {form.recurrente && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="text-sm" style={{ color: form.recurrente ? 'rgba(226,232,240,0.9)' : 'rgba(148,163,184,0.7)' }}>
          Transaction récurrente
          <span className="ml-1.5 text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>(loyer, salaire, abonnement…)</span>
        </span>
      </label>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-semibold rounded-2xl transition-all focus:outline-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.8)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-3 font-display text-sm font-bold rounded-2xl text-white transition-all duration-200 focus:outline-none flex items-center justify-center gap-2"
          style={{
            background: typeGrad,
            boxShadow: `0 6px 20px ${typeColor}44`,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {isRevenu ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
          )}
          {initial ? 'Enregistrer' : isRevenu ? 'Ajouter le revenu' : 'Ajouter la dépense'}
        </button>
      </div>
    </form>
  )
}
