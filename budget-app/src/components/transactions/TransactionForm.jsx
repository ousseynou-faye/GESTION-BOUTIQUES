import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CATEGORIES, CATEGORIES_REVENUS, CATEGORIES_DEPENSES } from '@/constants/categories'
import { format } from 'date-fns'

const defaultForm = {
  type: 'depense',
  montant: '',
  categorie: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
}

export function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    montant: String(initial.montant),
  } : defaultForm)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const categoriesFiltrees = form.type === 'revenu' ? CATEGORIES_REVENUS : CATEGORIES_DEPENSES

  function validate() {
    const e = {}
    if (!form.montant || isNaN(parseFloat(form.montant)) || parseFloat(form.montant) <= 0)
      e.montant = 'Le montant doit être supérieur à 0'
    if (!form.categorie) e.categorie = 'Sélectionnez une catégorie'
    if (!form.description.trim()) e.description = 'Ajoutez une description'
    if (!form.date) e.date = 'Choisissez une date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...(initial ? { id: initial.id, createdAt: initial.createdAt } : {}),
      type: form.type,
      montant: parseFloat(form.montant),
      categorie: form.categorie,
      description: form.description.trim(),
      date: form.date,
    })
  }

  const isRevenu = form.type === 'revenu'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {[
          { key: 'depense', label: 'Dépense', icon: '↓', active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' },
          { key: 'revenu',  label: 'Revenu',  icon: '↑', active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' },
        ].map(t => (
          <button key={t.key} type="button"
            onClick={() => { set('type', t.key); set('categorie', '') }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              form.type === t.key ? t.active : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Montant — large et proéminent */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Montant (€)</label>
        <div className="relative">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${
            isRevenu ? 'text-emerald-500' : 'text-rose-500'
          }`}>€</span>
          <input
            type="number" step="0.01" min="0" placeholder="0,00"
            value={form.montant}
            onChange={e => set('montant', e.target.value)}
            className={`w-full pl-10 pr-4 py-4 text-3xl font-bold rounded-2xl border-2 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
              errors.montant
                ? 'border-rose-400 text-rose-600'
                : isRevenu
                ? 'border-slate-200 dark:border-slate-700 focus:border-emerald-400 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 focus:border-rose-400 text-rose-600 dark:text-rose-400'
            }`}
          />
        </div>
        {errors.montant && <p className="text-xs text-rose-500 font-medium">{errors.montant}</p>}
      </div>

      {/* Catégorie — grille de chips */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {categoriesFiltrees.map(k => {
            const cat = CATEGORIES[k]
            const selected = form.categorie === k
            return (
              <button key={k} type="button"
                onClick={() => set('categorie', k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  selected ? 'text-white border-transparent shadow-md' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
                style={selected ? { backgroundColor: cat.couleur, boxShadow: `0 4px 12px ${cat.couleur}40` } : {}}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected ? 'rgba(255,255,255,0.7)' : cat.couleur }} />
                {cat.label}
                {selected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {errors.categorie && <p className="text-xs text-rose-500 font-medium">{errors.categorie}</p>}
      </div>

      {/* Description + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Description" type="text" placeholder="ex : Courses Carrefour"
          value={form.description} onChange={e => set('description', e.target.value)} error={errors.description} />
        <Input label="Date" type="date" value={form.date}
          onChange={e => set('date', e.target.value)} error={errors.date} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button
          type="submit"
          className={`flex-1 ${isRevenu ? '!bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-600/30' : '!bg-indigo-600 hover:!bg-indigo-700'}`}
        >
          {initial ? 'Enregistrer' : isRevenu ? '+ Ajouter le revenu' : '+ Ajouter la dépense'}
        </Button>
      </div>
    </form>
  )
}
