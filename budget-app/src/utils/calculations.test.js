import { describe, it, expect } from 'vitest'
import { getTop5Categories, getBudgetAlerts } from './calculations.js'

const txns = [
  { id: '1', type: 'depense', montant: 50000, categorie: 'loyer',        date: '2026-06-01' },
  { id: '2', type: 'depense', montant: 45000, categorie: 'alimentation', date: '2026-06-05' },
  { id: '3', type: 'depense', montant: 12000, categorie: 'transport',    date: '2026-06-10' },
  { id: '4', type: 'depense', montant:  8000, categorie: 'loisirs',      date: '2026-06-12' },
  { id: '5', type: 'depense', montant:  5000, categorie: 'abonnements',  date: '2026-06-15' },
  { id: '6', type: 'depense', montant:  3000, categorie: 'restaurant',   date: '2026-06-20' },
  { id: '7', type: 'revenu',  montant: 200000, categorie: 'salaire',     date: '2026-06-01' },
  // Mois précédent
  { id: '8', type: 'depense', montant: 40000, categorie: 'alimentation', date: '2026-05-05' },
  { id: '9', type: 'depense', montant: 50000, categorie: 'loyer',        date: '2026-05-01' },
]

describe('getTop5Categories', () => {
  it('retourne max 5 catégories triées par montant décroissant', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result).toHaveLength(5)
    expect(result[0].categorie).toBe('loyer')
    expect(result[1].categorie).toBe('alimentation')
  })

  it('ignore les revenus — seules les dépenses comptent', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result.every(r => r.categorie !== 'salaire')).toBe(true)
  })

  it('calcule l\'évolution correctement (hausse)', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const alim = result.find(r => r.categorie === 'alimentation')
    // (45000 - 40000) / 40000 * 100 = 12.5
    expect(alim.evolution).toBeCloseTo(12.5)
  })

  it('retourne evolution null si aucune dépense le mois précédent dans cette catégorie', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const loisirs = result.find(r => r.categorie === 'loisirs')
    expect(loisirs.evolution).toBeNull()
  })

  it('calcule le pourcentage du total des dépenses du mois', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    const loyer = result.find(r => r.categorie === 'loyer')
    // total = 50000+45000+12000+8000+5000+3000 = 123000
    // loyer = 50000/123000*100 ≈ 40.65
    expect(loyer.pourcentage).toBeCloseTo(40.65, 1)
  })

  it('retourne un tableau vide si aucune dépense ce mois', () => {
    const result = getTop5Categories([], '2026-06', '2026-05')
    expect(result).toHaveLength(0)
  })

  it('retourne les champs label et couleur depuis CATEGORIES', () => {
    const result = getTop5Categories(txns, '2026-06', '2026-05')
    expect(result[0].label).toBeTruthy()
    expect(result[0].couleur).toMatch(/^#/)
  })

  it('retourne moins de 5 entrées si moins de 5 catégories existent', () => {
    const fewTxns = [
      { id: 'a', type: 'depense', montant: 10000, categorie: 'loyer',  date: '2026-06-01' },
      { id: 'b', type: 'depense', montant:  5000, categorie: 'transport', date: '2026-06-10' },
    ]
    const result = getTop5Categories(fewTxns, '2026-06', '2026-05')
    expect(result).toHaveLength(2)
  })
})

// ── getBudgetAlerts ──────────────────────────────────────────────────────────

const txnsAlerts = [
  { id: 'a1', type: 'depense', montant: 58000, categorie: 'alimentation', date: '2026-06-01' },
  { id: 'a2', type: 'depense', montant: 42500, categorie: 'transport',    date: '2026-06-05' },
  { id: 'a3', type: 'depense', montant:  8000, categorie: 'loisirs',      date: '2026-06-10' },
  { id: 'a4', type: 'depense', montant:  5000, categorie: 'restaurant',   date: '2026-06-15' },
]

const budgetsAlerts = [
  { id: 'b1', categorie: 'alimentation', montantMensuel: 50000, mois: '2026-06' },
  { id: 'b2', categorie: 'transport',    montantMensuel: 50000, mois: '2026-06' },
  { id: 'b3', categorie: 'loisirs',      montantMensuel: 50000, mois: '2026-06' },
  { id: 'b4', categorie: 'restaurant',   montantMensuel: 50000, mois: '2026-06' },
]

describe('getBudgetAlerts', () => {
  it('inclut les budgets dépassés avec statut "depasse"', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const alim = result.find(r => r.categorie === 'alimentation')
    expect(alim).toBeDefined()
    expect(alim.statut).toBe('depasse')
  })

  it('inclut les budgets en danger (≥ 80%) avec statut "danger"', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const transport = result.find(r => r.categorie === 'transport')
    expect(transport).toBeDefined()
    expect(transport.statut).toBe('danger')
  })

  it('exclut les budgets sous contrôle (< 80%)', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    expect(result.every(r => r.categorie !== 'loisirs')).toBe(true)
    expect(result.every(r => r.categorie !== 'restaurant')).toBe(true)
  })

  it('trie les dépassés avant les en-danger', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    expect(result[0].statut).toBe('depasse')
    expect(result[1].statut).toBe('danger')
  })

  it('retourne [] si aucun budget en alerte', () => {
    const result = getBudgetAlerts([], budgetsAlerts, '2026-06')
    expect(result).toHaveLength(0)
  })

  it('expose pourcentageReel non plafonné et depassement', () => {
    const result = getBudgetAlerts(txnsAlerts, budgetsAlerts, '2026-06')
    const alim = result.find(r => r.categorie === 'alimentation')
    expect(alim.pourcentageReel).toBeCloseTo(116)
    expect(alim.depassement).toBe(8000)
  })
})
