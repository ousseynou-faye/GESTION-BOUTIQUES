import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ isOpen, onClose, titre, children, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[size] ?? 'max-w-lg'

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(2,6,23,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={[
          'w-full',
          sizeClass,
          'bg-white dark:bg-slate-900',
          'rounded-3xl shadow-2xl overflow-hidden',
          'border border-slate-100 dark:border-slate-800/80',
          'animate-modal-in',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #818cf8, #4f46e5)' }}
              aria-hidden="true"
            />
            <h2
              id="modal-title"
              className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug"
            >
              {titre}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className={[
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
              'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
              'transition-all',
            ].join(' ')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  titre = 'Confirmer la suppression',
  message,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} titre={titre} size="sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1.5">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={[
              'flex-1 py-2.5 text-sm font-semibold rounded-xl',
              'border border-slate-200 dark:border-slate-700',
              'text-slate-600 dark:text-slate-400',
              'hover:bg-slate-50 dark:hover:bg-slate-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
              'transition-colors',
            ].join(' ')}
          >
            Annuler
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={[
              'flex-1 py-2.5 text-sm font-semibold rounded-xl',
              'bg-rose-600 hover:bg-rose-500 text-white',
              'shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-500/25',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
              'transition-all',
            ].join(' ')}
          >
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  )
}
