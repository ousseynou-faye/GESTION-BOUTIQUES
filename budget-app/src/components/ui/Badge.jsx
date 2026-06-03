import { CATEGORIES } from '@/constants/categories'

export function Badge({ categorie, className = '' }) {
  const cat = CATEGORIES[categorie]
  if (!cat) return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {categorie}
    </span>
  )

  const hex = cat.couleur
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${className}`}
      style={{
        backgroundColor: hex + '1a',
        color: hex,
        border: `1px solid ${hex}33`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
      {cat.label}
    </span>
  )
}
