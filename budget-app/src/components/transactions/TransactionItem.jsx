import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import { formatMontant, formatDate } from '@/utils/formatters'

export function TransactionItem({ transaction, onEdit, onDelete }) {
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isRevenu    = transaction.type === 'revenu'
  const amountColor = isRevenu ? '#34d399' : '#fb7185'

  return (
    <>
      <div
        className="flex items-center gap-3 px-5 py-3.5 group cursor-default transition-colors duration-150"
        style={{ background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.background = isRevenu ? 'rgba(52,211,153,0.04)' : 'rgba(251,113,133,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        {/* ── Type icon ── */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{
            background: isRevenu
              ? 'linear-gradient(135deg, rgba(5,150,105,0.18) 0%, rgba(52,211,153,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(225,29,72,0.18) 0%, rgba(251,113,133,0.1) 100%)',
            border: `1px solid ${isRevenu ? 'rgba(52,211,153,0.22)' : 'rgba(251,113,133,0.22)'}`,
            boxShadow: `0 2px 8px ${isRevenu ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)'}`,
          }}
        >
          {isRevenu ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="#34d399" strokeWidth={2.5} aria-label="Revenu">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="#fb7185" strokeWidth={2.5} aria-label="Dépense">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[13px] font-semibold truncate leading-snug"
            style={{ color: 'rgba(226,232,240,0.92)' }}>
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge categorie={transaction.categorie} />
            {transaction.recurrente && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Récurrente
              </span>
            )}
            <span className="text-[10px] font-medium" style={{ color: 'rgba(100,116,139,0.65)' }}>
              {formatDate(transaction.date, 'd MMM yyyy')}
            </span>
          </div>
          {transaction.note && (
            <p
              className="mt-1 text-[11px] leading-snug line-clamp-2"
              style={{ color: 'rgba(100,116,139,0.7)' }}
            >
              ✎ {transaction.note}
            </p>
          )}
        </div>

        {/* ── Amount ── */}
        <span
          className="font-display text-[14px] font-extrabold flex-shrink-0 tabular-nums"
          style={{ color: amountColor, textShadow: `0 0 12px ${amountColor}44` }}
        >
          {isRevenu ? '+' : '−'}{formatMontant(transaction.montant)}
        </span>

        {/* ── Actions (visible on hover) ── */}
        <div className="flex gap-0.5 opacity-50 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 ml-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label={`Modifier "${transaction.description}"`}
            className="w-7 h-7 rounded-lg flex items-center justify-center focus:outline-none transition-all"
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
            onClick={() => setDeleteOpen(true)}
            aria-label={`Supprimer "${transaction.description}"`}
            className="w-7 h-7 rounded-lg flex items-center justify-center focus:outline-none transition-all"
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

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} aria-hidden="true" />

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} titre="Modifier la transaction">
        <TransactionForm
          initial={transaction}
          onSubmit={data => { onEdit(data); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => onDelete(transaction.id)}
        titre="Supprimer la transaction"
        message={`Supprimer "${transaction.description}" de ${formatMontant(transaction.montant)} ?`}
      />
    </>
  )
}
