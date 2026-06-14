import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTop5Categories, getBudgetAlerts, getKpiTendance,
  getProjectionsMensuelles, getEvolutionCategorie, getKpiCategorie,
} from './calculations.js'

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

// ── getKpiTendance ──────────────────────────────────────────────────────────

const txnsKpi = [
  // Mois courant : 2026-06
  { id: 'k1', type: 'revenu',  montant: 200000, categorie: 'salaire',        date: '2026-06-01' },
  { id: 'k2', type: 'depense', montant:  80000, categorie: 'alimentation',   date: '2026-06-05' },
  // Mois précédent : 2026-05
  { id: 'k3', type: 'revenu',  montant: 160000, categorie: 'salaire',        date: '2026-05-01' },
  { id: 'k4', type: 'depense', montant: 100000, categorie: 'alimentation',   date: '2026-05-05' },
]

describe('getKpiTendance', () => {
  it('retourne les 4 clés attendues', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r).toHaveProperty('revenus')
    expect(r).toHaveProperty('depenses')
    expect(r).toHaveProperty('solde')
    expect(r).toHaveProperty('epargne')
  })

  it('calcule la tendance revenus correctement (+25%)', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    // (200000 - 160000) / 160000 * 100 = 25
    expect(r.revenus.tendance).toBeCloseTo(25)
  })

  it('calcule la tendance dépenses correctement (-20%)', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    // (80000 - 100000) / 100000 * 100 = -20
    expect(r.depenses.tendance).toBeCloseTo(-20)
  })

  it('retourne tendance null si mois précédent = 0', () => {
    const r = getKpiTendance([txnsKpi[0]], '2026-06')  // seul revenu juin, rien en mai
    expect(r.depenses.tendance).toBeNull()
  })

  it('fournit 6 valeurs spark pour chaque KPI', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r.revenus.spark).toHaveLength(6)
    expect(r.depenses.spark).toHaveLength(6)
    expect(r.solde.spark).toHaveLength(6)
    expect(r.epargne.spark).toHaveLength(6)
  })

  it('spark revenus contient des nombres', () => {
    const r = getKpiTendance(txnsKpi, '2026-06')
    expect(r.revenus.spark.every(v => typeof v === 'number')).toBe(true)
  })
})

// ── getProjectionsMensuelles ─────────────────────────────────────────────────
// System time frozen at 2026-06-15 for all tests in this suite.

describe('getProjectionsMensuelles', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // Fixtures: 3 completed months (mars, avril, mai) + current month (juin)
  const txns3Mois = [
    { id: 'm1', type: 'revenu',  montant: 300000, date: '2026-03-01' },
    { id: 'm2', type: 'depense', montant: 200000, date: '2026-03-10' },
    { id: 'a1', type: 'revenu',  montant: 320000, date: '2026-04-01' },
    { id: 'a2', type: 'depense', montant: 220000, date: '2026-04-10' },
    { id: 'b1', type: 'revenu',  montant: 340000, date: '2026-05-01' },
    { id: 'b2', type: 'depense', montant: 240000, date: '2026-05-10' },
    { id: 'c1', type: 'revenu',  montant: 250000, date: '2026-06-01' },
    { id: 'c2', type: 'depense', montant: 150000, date: '2026-06-05' },
  ]
  // moyenneRevenus  = (340000 + 320000 + 300000) / 3 = 320000
  // moyenneDepenses = (240000 + 220000 + 200000) / 3 = 220000

  it('retourne exactement horizonMois entrées (max(horizon, 4))', () => {
    expect(getProjectionsMensuelles(txns3Mois, 6)).toHaveLength(6)
    expect(getProjectionsMensuelles(txns3Mois, 12)).toHaveLength(12)
    // horizon=3 is clamped to 4 minimum
    expect(getProjectionsMensuelles(txns3Mois, 3)).toHaveLength(4)
  })

  it('les 3 premières entrées ont estProjection: false (passé + courant)', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[0].estProjection).toBe(false)
    expect(result[1].estProjection).toBe(false)
    expect(result[2].estProjection).toBe(false)
  })

  it('les 3 dernières entrées pour horizon=6 ont estProjection: true', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[3].estProjection).toBe(true)
    expect(result[4].estProjection).toBe(true)
    expect(result[5].estProjection).toBe(true)
  })

  it('les mois sont dans l\'ordre chronologique correct', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[0].mois).toBe('2026-04')  // 2 mois passés
    expect(result[1].mois).toBe('2026-05')
    expect(result[2].mois).toBe('2026-06')  // courant
    expect(result[3].mois).toBe('2026-07')  // futurs
    expect(result[4].mois).toBe('2026-08')
    expect(result[5].mois).toBe('2026-09')
  })

  it('les données réelles sont utilisées pour les mois passés', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    // Mai 2026 → index 1 (1 mois avant courant)
    expect(result[1].revenus).toBe(340000)
    expect(result[1].depenses).toBe(240000)
    // Juin courant → index 2
    expect(result[2].revenus).toBe(250000)
    expect(result[2].depenses).toBe(150000)
  })

  it('les mois futurs utilisent la moyenne des 3 derniers mois complets', () => {
    const result = getProjectionsMensuelles(txns3Mois, 6)
    expect(result[3].revenus).toBe(320000)
    expect(result[3].depenses).toBe(220000)
    expect(result[5].revenus).toBe(320000)  // même moyenne pour tous les futurs
  })

  it('retourne [] si aucun mois complété (array vide)', () => {
    expect(getProjectionsMensuelles([], 6)).toHaveLength(0)
  })

  it('retourne [] si transactions uniquement dans le mois courant', () => {
    const juneSeulement = [
      { id: 'x', type: 'revenu', montant: 100000, date: '2026-06-01' },
    ]
    expect(getProjectionsMensuelles(juneSeulement, 6)).toHaveLength(0)
  })

  it('fonctionne avec 1 seul mois de données disponible', () => {
    const txns1Mois = [
      { id: 'b1', type: 'revenu',  montant: 300000, date: '2026-05-01' },
      { id: 'b2', type: 'depense', montant: 200000, date: '2026-05-10' },
    ]
    const result = getProjectionsMensuelles(txns1Mois, 6)
    expect(result).toHaveLength(6)
    // Moyenne basée sur 1 mois
    expect(result[3].revenus).toBe(300000)
    expect(result[3].depenses).toBe(200000)
  })

  it('fonctionne avec 2 mois de données disponibles', () => {
    const txns2Mois = [
      { id: 'a1', type: 'revenu',  montant: 300000, date: '2026-04-01' },
      { id: 'a2', type: 'depense', montant: 200000, date: '2026-04-10' },
      { id: 'b1', type: 'revenu',  montant: 400000, date: '2026-05-01' },
      { id: 'b2', type: 'depense', montant: 250000, date: '2026-05-10' },
    ]
    const result = getProjectionsMensuelles(txns2Mois, 6)
    expect(result).toHaveLength(6)
    // Moyenne = (300000 + 400000) / 2 = 350000
    expect(result[3].revenus).toBe(350000)
    // Moyenne = (200000 + 250000) / 2 = 225000
    expect(result[3].depenses).toBe(225000)
  })
})

// ── getEvolutionCategorie ────────────────────────────────────────────────────

describe('getEvolutionCategorie', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-14'))
  })
  afterEach(() => vi.useRealTimers())

  const txns = [
    { id: '1', type: 'depense', montant: 45000, categorie: 'alimentation', date: '2026-06-05' },
    { id: '2', type: 'depense', montant: 40000, categorie: 'alimentation', date: '2026-05-10' },
    { id: '3', type: 'depense', montant: 38000, categorie: 'alimentation', date: '2026-04-08' },
    { id: '4', type: 'depense', montant: 12000, categorie: 'transport',    date: '2026-06-03' },
    { id: '5', type: 'revenu',  montant: 200000, categorie: 'salaire',     date: '2026-06-01' },
  ]

  it('retourne exactement N entrées pour un horizon de N mois', () => {
    expect(getEvolutionCategorie(txns, 'alimentation', 6)).toHaveLength(6)
    expect(getEvolutionCategorie(txns, 'alimentation', 3)).toHaveLength(3)
    expect(getEvolutionCategorie(txns, 'alimentation', 12)).toHaveLength(12)
  })

  it('le dernier élément correspond au mois courant', () => {
    const result = getEvolutionCategorie(txns, 'alimentation', 6)
    expect(result[result.length - 1].mois).toBe('2026-06')
  })

  it('les mois sont triés chronologiquement', () => {
    const result = getEvolutionCategorie(txns, 'alimentation', 3)
    expect(result[0].mois).toBe('2026-04')
    expect(result[1].mois).toBe('2026-05')
    expect(result[2].mois).toBe('2026-06')
  })

  it('les montants correspondent aux transactions filtrées par catégorie', () => {
    const result = getEvolutionCategorie(txns, 'alimentation', 3)
    expect(result[0].montant).toBe(38000) // avril
    expect(result[1].montant).toBe(40000) // mai
    expect(result[2].montant).toBe(45000) // juin
  })

  it('les mois sans transaction ont montant: 0', () => {
    const result = getEvolutionCategorie(txns, 'alimentation', 6)
    // janvier, février, mars n'ont pas de transactions alimentation
    expect(result[0].montant).toBe(0) // janvier
    expect(result[1].montant).toBe(0) // février
    expect(result[2].montant).toBe(0) // mars
  })

  it('filtre uniquement la catégorie demandée — transport reste séparé', () => {
    const result = getEvolutionCategorie(txns, 'transport', 1)
    expect(result[0].montant).toBe(12000)
  })

  it('retourne des montants à 0 pour une catégorie sans aucune transaction', () => {
    const result = getEvolutionCategorie(txns, 'loisirs', 3)
    expect(result.every(d => d.montant === 0)).toBe(true)
  })

  it('gère un tableau de transactions vide', () => {
    const result = getEvolutionCategorie([], 'alimentation', 6)
    expect(result).toHaveLength(6)
    expect(result.every(d => d.montant === 0)).toBe(true)
  })
})

// ── getKpiCategorie ──────────────────────────────────────────────────────────

describe('getKpiCategorie', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-14'))
  })
  afterEach(() => vi.useRealTimers())

  const txns = [
    { id: '1', type: 'depense', montant: 45000, categorie: 'alimentation', date: '2026-06-05' },
    { id: '2', type: 'depense', montant: 40000, categorie: 'alimentation', date: '2026-05-10' },
    { id: '3', type: 'depense', montant: 38000, categorie: 'alimentation', date: '2026-04-08' },
  ]

  it('total = somme de toutes les transactions sur la période', () => {
    // horizon=3 → avril+mai+juin = 38000+40000+45000 = 123000
    const result = getKpiCategorie(txns, 'alimentation', 3)
    expect(result.total).toBe(123000)
  })

  it('moyenne = total / horizonMois', () => {
    const result = getKpiCategorie(txns, 'alimentation', 3)
    expect(result.moyenne).toBeCloseTo(41000)
  })

  it('montantMoisCourant = somme du mois en cours', () => {
    const result = getKpiCategorie(txns, 'alimentation', 6)
    expect(result.montantMoisCourant).toBe(45000)
  })

  it('montantMoisPrecedent = somme du mois précédent', () => {
    const result = getKpiCategorie(txns, 'alimentation', 6)
    expect(result.montantMoisPrecedent).toBe(40000)
  })

  it('variationPct correct avec données réelles', () => {
    // (45000 - 40000) / 40000 * 100 = 12.5
    const result = getKpiCategorie(txns, 'alimentation', 6)
    expect(result.variationPct).toBeCloseTo(12.5)
  })

  it('variationPct = null si mois précédent = 0 (évite division par zéro)', () => {
    const txnsNoMay = [
      { id: '1', type: 'depense', montant: 45000, categorie: 'alimentation', date: '2026-06-05' },
    ]
    const result = getKpiCategorie(txnsNoMay, 'alimentation', 6)
    expect(result.variationPct).toBeNull()
  })

  it('catégorie inexistante → tout à 0 et variationPct null', () => {
    const result = getKpiCategorie(txns, 'voyages', 6)
    expect(result.total).toBe(0)
    expect(result.moyenne).toBe(0)
    expect(result.montantMoisCourant).toBe(0)
    expect(result.montantMoisPrecedent).toBe(0)
    expect(result.variationPct).toBeNull()
  })

  it('gère un tableau de transactions vide', () => {
    const result = getKpiCategorie([], 'alimentation', 6)
    expect(result.total).toBe(0)
    expect(result.variationPct).toBeNull()
  })
})
