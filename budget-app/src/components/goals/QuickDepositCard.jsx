import { useFormatMontant } from '@/utils/useFormatMontant'
import { ProgressBar } from '@/components/ui/ProgressBar'

const AMOUNTS = [1000, 5000, 10000]

export function QuickDepositCard({ goal, onDeposit }) {
  const fmt = useFormatMontant()
  const pct = goal.montantCible > 0
    ? Math.round((goal.montantActuel / goal.montantCible) * 100)
    : 0

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: '#0b0e1c',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Nom + montant actuel/cible */}
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'rgba(226,232,240,0.92)' }}
        >
          {goal.nom}
        </p>
        <span
          className="text-xs flex-shrink-0 tabular-nums"
          style={{ color: 'rgba(100,116,139,0.7)' }}
        >
          {fmt(goal.montantActuel)} / {fmt(goal.montantCible)}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <ProgressBar valeur={pct} couleur="#6366f1" taille="sm" className="flex-1" />
        <span
          className="text-xs font-bold w-10 text-right tabular-nums"
          style={{ color: '#6366f1' }}
        >
          {pct}%
        </span>
      </div>

      {/* Boutons de dépôt rapide */}
      <div className="flex items-center gap-2 justify-end">
        {AMOUNTS.map(amount => (
          <button
            key={amount}
            onClick={() => onDeposit(goal.id, amount)}
            className="btn-secondary text-xs px-3 py-1"
          >
            +{fmt(amount)}
          </button>
        ))}
      </div>
    </div>
  )
}
