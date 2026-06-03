import { CATEGORIES } from '@/constants/categories'

export function Badge({ categorie, className = '' }) {
  const cat = CATEGORIES[categorie]
  if (!cat) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{categorie}</span>

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
