import { describe, it, expect } from 'vitest'
import { dateToMois, moisEntre, ajusterJour, calculerTransactionsAGenerer } from './recurrence.js'

// ── dateToMois ───────────────────────────────────────────────────────────────
describe('dateToMois', () => {
  it('extrait YYYY-MM depuis une date ISO', () => {
    expect(dateToMois('2026-06-05')).toBe('2026-06')
    expect(dateToMois('2026-12-31')).toBe('2026-12')
  })
})

// ── moisEntre ────────────────────────────────────────────────────────────────
describe('moisEntre', () => {
  it('retourne les mois entre debut (exclu) et fin (inclus)', () => {
    expect(moisEntre('2026-03', '2026-06')).toEqual(['2026-04', '2026-05', '2026-06'])
  })

  it('retourne un tableau vide si debut === fin', () => {
    expect(moisEntre('2026-06', '2026-06')).toEqual([])
  })

  it('gère le passage d\'année', () => {
    expect(moisEntre('2025-11', '2026-02')).toEqual(['2025-12', '2026-01', '2026-02'])
  })
})

// ── ajusterJour ──────────────────────────────────────────────────────────────
describe('ajusterJour', () => {
  it('retourne la date exacte si le jour existe dans le mois', () => {
    expect(ajusterJour('2026-06', 15)).toBe('2026-06-15')
  })

  it('ajuste au dernier jour si le mois est trop court (31 → 28 en février)', () => {
    expect(ajusterJour('2026-02', 31)).toBe('2026-02-28')
  })

  it('gère le 29 février en année bissextile', () => {
    expect(ajusterJour('2028-02', 29)).toBe('2028-02-29')
  })
})

// ── calculerTransactionsAGenerer ─────────────────────────────────────────────
describe('calculerTransactionsAGenerer', () => {
  const txnBase = {
    id: 'txn_1',
    type: 'depense',
    montant: 50000,
    categorie: 'loyer',
    description: 'Loyer mensuel',
    note: null,
    date: '2026-03-05',
    recurrente: true,
    derniereGeneration: '2026-03',
  }

  it('ne génère rien si derniereGeneration === moisCourant', () => {
    const { nouvelles, majOriginales } = calculerTransactionsAGenerer([txnBase], '2026-03')
    expect(nouvelles).toHaveLength(0)
    expect(majOriginales).toHaveLength(0)
  })

  it('génère 3 copies pour 3 mois de retard avec les bonnes dates', () => {
    const { nouvelles, majOriginales } = calculerTransactionsAGenerer([txnBase], '2026-06')
    expect(nouvelles).toHaveLength(3)
    expect(nouvelles[0].date).toBe('2026-04-05')
    expect(nouvelles[1].date).toBe('2026-05-05')
    expect(nouvelles[2].date).toBe('2026-06-05')
    expect(majOriginales).toEqual([{ id: 'txn_1', derniereGeneration: '2026-06' }])
  })

  it('les copies ont recurrente: false', () => {
    const { nouvelles } = calculerTransactionsAGenerer([txnBase], '2026-04')
    expect(nouvelles[0].recurrente).toBe(false)
  })

  it('utilise le mois de date si derniereGeneration est absent', () => {
    const { id: _, derniereGeneration: __, ...txnSansGen } = txnBase
    const txn = { ...txnSansGen, id: 'txn_2' }
    const { nouvelles } = calculerTransactionsAGenerer([txn], '2026-04')
    expect(nouvelles).toHaveLength(1)
    expect(nouvelles[0].date).toBe('2026-04-05')
  })

  it('ignore les transactions non récurrentes', () => {
    const txnNonRec = { ...txnBase, recurrente: false }
    const { nouvelles } = calculerTransactionsAGenerer([txnNonRec], '2026-06')
    expect(nouvelles).toHaveLength(0)
  })

  it('ajuste le jour si le mois est trop court (loyer le 31)', () => {
    const txnJour31 = { ...txnBase, date: '2026-01-31', derniereGeneration: '2026-01' }
    const { nouvelles } = calculerTransactionsAGenerer([txnJour31], '2026-02')
    expect(nouvelles[0].date).toBe('2026-02-28')
  })
})
