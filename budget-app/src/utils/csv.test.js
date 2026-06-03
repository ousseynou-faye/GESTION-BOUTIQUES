import { describe, it, expect } from 'vitest'
import { transactionsVersCSV, parseLigneCSV, validerLigneCSV } from './csv.js'

const txnFixture = {
  id: 'txn_1',
  type: 'depense',
  montant: 5000,
  description: 'Courses du marché',
  categorie: 'alimentation',
  date: '2026-06-01',
  note: null,
  recurrente: false,
}

// ── transactionsVersCSV ──────────────────────────────────────────────────────
describe('transactionsVersCSV', () => {
  it('génère une ligne header + une ligne de données', () => {
    const csv = transactionsVersCSV([txnFixture])
    const lignes = csv.split('\n')
    expect(lignes[0]).toBe('id,type,montant,description,categorie,date,note,recurrente')
    expect(lignes[1]).toBe('txn_1,depense,5000,"Courses du marché",alimentation,2026-06-01,"",false')
  })

  it('échappe les guillemets doubles dans la description', () => {
    const txn = { ...txnFixture, description: 'Achat "urgent"' }
    const csv = transactionsVersCSV([txn])
    expect(csv).toContain('"Achat ""urgent"""')
  })

  it('inclut la note et recurrente=true si présents', () => {
    const txn = { ...txnFixture, note: 'Paiement Wave', recurrente: true }
    const csv = transactionsVersCSV([txn])
    expect(csv).toContain('"Paiement Wave",true')
  })

  it('retourne uniquement le header pour un tableau vide', () => {
    const csv = transactionsVersCSV([])
    expect(csv.trim()).toBe('id,type,montant,description,categorie,date,note,recurrente')
  })
})

// ── parseLigneCSV ────────────────────────────────────────────────────────────
describe('parseLigneCSV', () => {
  it('parse une ligne CSV simple', () => {
    expect(parseLigneCSV('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('parse un champ entre guillemets contenant une virgule', () => {
    expect(parseLigneCSV('a,"b,c",d')).toEqual(['a', 'b,c', 'd'])
  })

  it('gère les guillemets doublés ("")', () => {
    expect(parseLigneCSV('"a ""b""",c')).toEqual(['a "b"', 'c'])
  })

  it('retourne un champ vide pour une valeur vide entre virgules', () => {
    expect(parseLigneCSV('a,,c')).toEqual(['a', '', 'c'])
  })
})

// ── validerLigneCSV ──────────────────────────────────────────────────────────
describe('validerLigneCSV', () => {
  const colsValides = ['txn_1', 'depense', '5000', 'Courses', 'alimentation', '2026-06-01', '', 'false']

  it('accepte une ligne valide', () => {
    const { erreur, transaction } = validerLigneCSV(colsValides, 2)
    expect(erreur).toBeNull()
    expect(transaction.montant).toBe(5000)
    expect(transaction.note).toBeNull()
    expect(transaction.recurrente).toBe(false)
  })

  it('génère un nouvel ID (ignore celui du CSV)', () => {
    const { transaction } = validerLigneCSV(colsValides, 2)
    expect(transaction.id).not.toBe('txn_1')
    expect(transaction.id).toMatch(/^txn_/)
  })

  it('accepte recurrente=true', () => {
    const cols = [...colsValides]; cols[7] = 'true'
    const { transaction } = validerLigneCSV(cols, 2)
    expect(transaction.recurrente).toBe(true)
  })

  it('rejette un type invalide', () => {
    const cols = [...colsValides]; cols[1] = 'foo'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('Ligne 2')
    expect(erreur).toContain('type invalide')
  })

  it('rejette un montant nul ou négatif', () => {
    const cols = [...colsValides]; cols[2] = '-100'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('montant invalide')
  })

  it('rejette une date mal formatée', () => {
    const cols = [...colsValides]; cols[5] = '01/06/2026'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('date invalide')
  })

  it('rejette une catégorie inconnue', () => {
    const cols = [...colsValides]; cols[4] = 'pizza'
    const { erreur } = validerLigneCSV(cols, 2)
    expect(erreur).toContain('catégorie inconnue')
  })

  it('rejette si moins de 6 colonnes', () => {
    const { erreur } = validerLigneCSV(['a', 'b', 'c'], 5)
    expect(erreur).toContain('Ligne 5')
    expect(erreur).toContain('colonnes insuffisantes')
  })
})
