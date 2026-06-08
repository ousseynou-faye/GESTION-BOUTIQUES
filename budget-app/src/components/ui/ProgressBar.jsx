import { useEffect, useState } from 'react'

function getAutoColor(pct) {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 90)  return '#f97316'
  if (pct >= 75)  return '#eab308'
  return '#10b981'
}

/**
 * ProgressBar — animated horizontal progress bar.
 *
 * Props:
 *   valeur   — percentage (0–100+)
 *   couleur  — hex color override (auto-selected by threshold if omitted)
 *   taille   — 'sm' | 'md' | 'lg'
 *   className — extra wrapper classes
 */
export function ProgressBar({ valeur = 0, couleur, taille = 'md', className = '' }) {
  const [width, setWidth] = useState(0)
  const pct   = Math.min(100, Math.max(0, valeur))
  const color = couleur || getAutoColor(pct)

  const heightClass = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  }[taille] ?? 'h-1.5'

  useEffect(() => {
    const id = setTimeout(() => setWidth(pct), 80)
    return () => clearTimeout(id)
  }, [pct])

  return (
    <div
      className={`w-full ${heightClass} rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--border-card)' }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}bb, ${color})`,
          transition: 'width 850ms cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}55`,
        }}
      />
    </div>
  )
}
