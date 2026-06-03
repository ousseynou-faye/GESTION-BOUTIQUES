export const CATEGORIES = {
  // Revenus
  salaire:         { label: 'Salaire',             type: 'revenu',  couleur: '#10b981' },
  freelance:       { label: 'Freelance',            type: 'revenu',  couleur: '#06b6d4' },
  investissements: { label: 'Investissements',      type: 'revenu',  couleur: '#8b5cf6' },
  autres_revenus:  { label: 'Autres revenus',       type: 'revenu',  couleur: '#f59e0b' },

  // Logement
  loyer:           { label: 'Loyer',                type: 'depense', couleur: '#ef4444' },
  electricite:     { label: 'Électricité / Gaz',    type: 'depense', couleur: '#f97316' },
  internet:        { label: 'Internet / Téléphone', type: 'depense', couleur: '#eab308' },

  // Vie quotidienne
  alimentation:    { label: 'Alimentation',         type: 'depense', couleur: '#22c55e' },
  restaurant:      { label: 'Restaurants',          type: 'depense', couleur: '#84cc16' },
  transport:       { label: 'Transport',            type: 'depense', couleur: '#3b82f6' },
  sante:           { label: 'Santé',                type: 'depense', couleur: '#ec4899' },

  // Loisirs & achats
  loisirs:         { label: 'Loisirs',              type: 'depense', couleur: '#a855f7' },
  voyages:         { label: 'Voyages',              type: 'depense', couleur: '#0ea5e9' },
  vetements:       { label: 'Vêtements',            type: 'depense', couleur: '#f43f5e' },
  abonnements:     { label: 'Abonnements',          type: 'depense', couleur: '#64748b' },

  // Finances
  epargne:         { label: 'Épargne',              type: 'depense', couleur: '#2563eb' },
  education:       { label: 'Formation',            type: 'depense', couleur: '#7c3aed' },
  autres:          { label: 'Autres dépenses',      type: 'depense', couleur: '#6b7280' },
}

export const CATEGORIES_REVENUS = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'revenu')
  .map(([k]) => k)

export const CATEGORIES_DEPENSES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'depense')
  .map(([k]) => k)

export const ALL_CATEGORIES = Object.keys(CATEGORIES)
