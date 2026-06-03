import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import { formatMontant, formatDate } from '@/utils/formatters'

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export function TransactionItem({ transaction, onEdit, onDelete }) {
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isRevenu = transaction.type === 'revenu'

  const iconBg     = isRevenu ? 'rgba(209,250,229,0.22)' : 'rgba(255,228,230,0.22)'
  const iconBorder = isRevenu ? 'rgba(16,185,129,0.22)'  : 'rgba(244,63,94,0.22)'

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/25 transition-colors group cursor-default">

        {/* ── Transaction type icon ─────────────────────── */}
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: iconBg, border: `1.5px solid ${iconBorder}` }}
        >
          {isRevenu ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-label="Revenu"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-label="Dépense"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge categorie={transaction.categorie} />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {formatDate(transaction.date, 'd MMM yyyy')}
            </span>
          </div>
        </div>

        {/* ── Amount ───────────────────────────────────── */}
        <span className={[
          'text-sm font-bold flex-shrink-0 tabular-nums',
          isRevenu
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400',
        ].join(' ')}>
          {isRevenu ? '+' : '−'}{formatMontant(transaction.montant)}
        </span>

        {/* ── Actions (visible on hover) ────────────────── */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0 ml-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label={`Modifier "${transaction.description}"`}
            className={[
              'w-7 h-7 rounded-lg flex items-center justify-center',
              'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400',
              'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              'transition-all',
            ].join(' ')}
          >
            <EditIcon />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label={`Supprimer "${transaction.description}"`}
            className={[
              'w-7 h-7 rounded-lg flex items-center justify-center',
              'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400',
              'hover:bg-rose-50 dark:hover:bg-rose-900/30',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
              'transition-all',
            ].join(' ')}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        titre="Modifier la transaction"
      >
        <TransactionForm
          initial={transaction}
          onSubmit={(data) => { onEdit(data); setEditOpen(false) }}
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
