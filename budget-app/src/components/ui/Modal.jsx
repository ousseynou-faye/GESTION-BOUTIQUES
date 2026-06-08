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

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }[size] ?? 'max-w-lg'

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={['w-full', sizeClass, 'rounded-3xl shadow-2xl overflow-hidden animate-modal-in'].join(' ')}
        style={{
          background: 'var(--bg-modal)',
          border: '1px solid var(--border-modal)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Prismatic top line */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.5) 30%, rgba(196,181,253,0.8) 50%, rgba(129,140,248,0.5) 70%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 90% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, #a5b4fc, #6366f1)' }}
              aria-hidden="true"
            />
            <h2
              id="modal-title"
              className="font-display text-[15px] font-bold tracking-tight leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {titre}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 focus:outline-none"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative px-6 py-5 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, titre = 'Confirmer la suppression', message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} titre={titre} size="sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.2)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="#fb7185" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm leading-relaxed pt-1.5" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all focus:outline-none"
            style={{ border: '1px solid var(--border-input)', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
          >
            Annuler
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-all focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, #e11d48, #fb7185)',
              boxShadow: '0 4px 16px rgba(251,113,133,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  )
}
