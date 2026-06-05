import { useState, useMemo } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { KPICard } from '@/components/ui/KPICard'
import { Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import CSVActions from '@/components/transactions/CSVActions'
import { CATEGORIES } from '@/constants/categories'
import { formatDate } from '@/utils/formatters'
import { useFormatMontant } from '@/utils/useFormatMontant'

const PAGE_SIZE = 25

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
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

export default function Transactions() {
  const { state, dispatch } = useBudget()
  const fmt = useFormatMontant()
  const [addOpen, setAddOpen]         = useState(false)
  const [filtreType, setFiltreType]   = useState('tous')
  const [filtreCateg, setFiltreCateg] = useState('toutes')
  const [filtreMois, setFiltreMois]   = useState('')
  const [recherche, setRecherche]     = useState('')
  const [page, setPage]               = useState(0)

  const filtered = useMemo(() => {
    let list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date))
    if (filtreType !== 'tous')    list = list.filter(t => t.type === filtreType)
    if (filtreCateg !== 'toutes') list = list.filter(t => t.categorie === filtreCateg)
    if (filtreMois)               list = list.filter(t => t.date.startsWith(filtreMois))
    if (recherche.trim()) {
      const q = recherche.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      )
    }
    return list
  }, [state.transactions, filtreType, filtreCateg, filtreMois, recherche])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const grouped = useMemo(() => {
    const groups = {}
    paginated.forEach(t => {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date].push(t)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [paginated])

  const totalRevenus  = filtered.filter(t => t.type === 'revenu').reduce((s, t) => s + t.montant, 0)
  const totalDepenses = filtered.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0)
  const solde         = totalRevenus - totalDepenses
  const hasFiltre     = filtreType !== 'tous' || filtreCateg !== 'toutes' || filtreMois || recherche.trim()

  const activeFilters = [
    filtreType !== 'tous' && {
      key:   'type',
      label: filtreType === 'revenu' ? 'Revenus' : 'Dépenses',
      clear: () => { setFiltreType('tous'); setPage(0) },
    },
    filtreCateg !== 'toutes' && {
      key:   'categ',
      label: CATEGORIES[filtreCateg]?.label || filtreCateg,
      clear: () => { setFiltreCateg('toutes'); setPage(0) },
    },
    filtreMois && {
      key:   'mois',
      label: filtreMois,
      clear: () => { setFiltreMois(''); setPage(0) },
    },
    recherche.trim() && {
      key:   'recherche',
      label: `"${recherche.trim()}"`,
      clear: () => { setRecherche(''); setPage(0) },
    },
  ].filter(Boolean)

  function handleAdd(data)  { dispatch({ type: 'ADD_TRANSACTION',    payload: data }); setAddOpen(false) }
  function handleEdit(data) { dispatch({ type: 'UPDATE_TRANSACTION', payload: data }) }
  function handleDelete(id) { dispatch({ type: 'DELETE_TRANSACTION', payload: { id } }) }

  return (
    <div className="flex flex-col gap-6 animate-fade-slide-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold" style={{ color: 'rgba(226,232,240,0.95)' }}>
            Transactions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
            {state.transactions.length} transaction{state.transactions.length > 1 ? 's' : ''} au total
            {hasFiltre && (
              <span className="font-semibold" style={{ color: '#818cf8' }}>
                {' · '}{filtered.length} après filtrage
              </span>
            )}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <CSVActions transactionsFiltrees={filtered} />
          <Button onClick={() => setAddOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle transaction
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          titre="Total revenus"
          valeur={fmt(totalRevenus)}
          sousTitre={`${filtered.filter(t => t.type === 'revenu').length} entrée(s)`}
          gradient={['#059669', '#10b981']}
          icon={<IconRevenu />}
        />
        <KPICard
          titre="Total dépenses"
          valeur={fmt(totalDepenses)}
          sousTitre={`${filtered.filter(t => t.type === 'depense').length} sortie(s)`}
          gradient={['#e11d48', '#f43f5e']}
          icon={<IconDepense />}
        />
        <KPICard
          titre={solde >= 0 ? 'Solde net' : 'Déficit'}
          valeur={fmt(Math.abs(solde))}
          sousTitre={solde >= 0 ? 'Revenus > Dépenses' : 'Dépenses > Revenus'}
          gradient={solde >= 0 ? ['#4f46e5', '#6366f1'] : ['#ea580c', '#f97316']}
          icon={<IconSolde />}
        />
      </div>

      {/* ── Filtres ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#0b0e1c',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Prismatic top line */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.4), rgba(196,181,253,0.6), rgba(129,140,248,0.4), transparent)' }}
            aria-hidden="true"
          />
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.14)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: '#818cf8' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em]"
            style={{ color: 'rgba(165,180,252,0.9)' }}>
            Filtres
          </span>
          {activeFilters.length > 0 && (
            <span
              className="ml-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
            >
              {activeFilters.length}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 flex flex-wrap gap-3 items-center">
          {/* Type toggle */}
          <div
            className="flex gap-1 rounded-xl p-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            role="group"
            aria-label="Filtrer par type"
          >
            {[
              { v: 'tous',    l: 'Tous' },
              { v: 'revenu',  l: 'Revenus' },
              { v: 'depense', l: 'Dépenses' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => { setFiltreType(v); setPage(0) }}
                aria-pressed={filtreType === v}
                className="px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all duration-200 focus:outline-none"
                style={filtreType === v ? {
                  background: v === 'revenu'
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : v === 'depense'
                    ? 'linear-gradient(135deg, #e11d48, #f43f5e)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(129,140,248,0.4))',
                  color: '#fff',
                  boxShadow: v === 'revenu'
                    ? '0 2px 8px rgba(16,185,129,0.35)'
                    : v === 'depense'
                    ? '0 2px 8px rgba(244,63,94,0.35)'
                    : '0 2px 8px rgba(99,102,241,0.3)',
                } : { color: 'rgba(100,116,139,0.7)' }}
              >
                {l}
              </button>
            ))}
          </div>

          <Select
            value={filtreCateg}
            onChange={e => { setFiltreCateg(e.target.value); setPage(0) }}
            className="w-48 !py-2 !text-xs"
            aria-label="Filtrer par catégorie"
          >
            <option value="toutes">Toutes catégories</option>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>

          <input
            type="month"
            value={filtreMois}
            onChange={e => { setFiltreMois(e.target.value); setPage(0) }}
            aria-label="Filtrer par mois"
            className="rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(226,232,240,0.9)',
              colorScheme: 'dark',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
          />

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: 'rgba(100,116,139,0.5)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={recherche}
              onChange={e => { setRecherche(e.target.value); setPage(0) }}
              placeholder="Rechercher une transaction…"
              aria-label="Rechercher par description"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(226,232,240,0.9)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.1)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {hasFiltre && (
            <button
              onClick={() => { setFiltreType('tous'); setFiltreCateg('toutes'); setFiltreMois(''); setRecherche(''); setPage(0) }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ml-auto focus:outline-none"
              style={{ color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)', background: 'rgba(251,113,133,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.06)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="px-5 pb-4 flex gap-2 flex-wrap">
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full"
                style={{
                  background: 'rgba(129,140,248,0.1)',
                  border: '1px solid rgba(129,140,248,0.25)',
                  color: '#a5b4fc',
                }}
              >
                {f.label}
                <button
                  onClick={f.clear}
                  aria-label={`Supprimer le filtre ${f.label}`}
                  className="ml-0.5 transition-opacity hover:opacity-70 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Liste groupée par date ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#0b0e1c',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        }}
      >
        {grouped.length === 0 ? (
          <EmptyState
            titre="Aucune transaction trouvée"
            message="Modifiez vos filtres ou ajoutez votre première transaction."
            action={<Button onClick={() => setAddOpen(true)}>Ajouter une transaction</Button>}
          />
        ) : (
          <div>
            {grouped.map(([date, transactions], groupIdx) => (
              <div key={date}>
                {/* Date separator */}
                <div
                  className="flex items-center gap-3 px-5 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderTop: groupIdx > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#818cf8', boxShadow: '0 0 6px rgba(129,140,248,0.8)' }}
                    aria-hidden="true"
                  />
                  <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.12em]"
                    style={{ color: 'rgba(148,163,184,0.7)' }}>
                    {formatDate(date)}
                  </span>
                  <div className="flex-1 h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(129,140,248,0.18), transparent)' }}
                    aria-hidden="true" />
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums"
                    style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}
                  >
                    {transactions.length} op.
                  </span>
                </div>
                <div>
                  {transactions.map(t => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <span className="text-[11px] font-medium" style={{ color: 'rgba(100,116,139,0.7)' }}>
              Page{' '}
              <span className="font-display font-bold" style={{ color: 'rgba(226,232,240,0.9)' }}>{page + 1}</span>
              {' '}sur {totalPages} · {filtered.length} transactions
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(148,163,184,0.8)',
                }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(148,163,184,0.8)',
                }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FAB mobile ── */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Nouvelle transaction"
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

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} titre="Nouvelle transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>
    </div>
  )
}
