import { ALL_CATEGORIES } from '@/constants/categories'

const ENTETES = 'id,type,montant,description,categorie,date,note,recurrente'

function csvChamp(val) {
  const str = val == null ? '' : String(val)
  return `"${str.replace(/"/g, '""')}"`
}

export function transactionsVersCSV(transactions) {
  const lignes = [ENTETES]
  for (const t of transactions) {
    lignes.push([
      t.id,
      t.type,
      t.montant,
      csvChamp(t.description),
      t.categorie,
      t.date,
      csvChamp(t.note ?? ''),
      t.recurrente ?? false,
    ].join(','))
  }
  return lignes.join('\n')
}

export function parseLigneCSV(ligne) {
  const champs = []
  let i = 0
  while (i <= ligne.length) {
    if (ligne[i] === '"') {
      i++
      let champ = ''
      while (i < ligne.length) {
        if (ligne[i] === '"' && ligne[i + 1] === '"') {
          champ += '"'
          i += 2
        } else if (ligne[i] === '"') {
          i++
          break
        } else {
          champ += ligne[i++]
        }
      }
      champs.push(champ)
      if (ligne[i] === ',') i++
    } else {
      const fin = ligne.indexOf(',', i)
      if (fin === -1) {
        champs.push(ligne.slice(i))
        break
      } else {
        champs.push(ligne.slice(i, fin))
        i = fin + 1
      }
    }
  }
  return champs
}

export function validerLigneCSV(cols, numLigne) {
  const erreur = (msg) => ({ erreur: `Ligne ${numLigne} : ${msg}`, transaction: null })

  if (cols.length < 6) return erreur('colonnes insuffisantes')

  const [, type, montantStr, description, categorie, date] = cols
  const note = cols[6] ?? ''
  const recurrenteStr = cols[7] ?? 'false'

  if (type !== 'revenu' && type !== 'depense') return erreur('type invalide')

  const montant = parseFloat(montantStr)
  if (isNaN(montant) || montant <= 0) return erreur('montant invalide')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return erreur('date invalide')

  if (!ALL_CATEGORIES.includes(categorie)) return erreur('catégorie inconnue')

  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    montant,
    description,
    categorie,
    date,
    note: note.trim() === '' ? null : note,
    recurrente: recurrenteStr === 'true',
  }

  return { erreur: null, transaction }
}

export function exporterCSV(transactions) {
  const bom = '﻿'
  const contenu = bom + transactionsVersCSV(transactions)
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `transactions_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importerCSV(file) {
  const texte = await file.text()
  const lignes = texte.replace(/^﻿/, '').split('\n').filter(l => l.trim())
  const valides = []
  const erreurs = []

  for (let i = 1; i < lignes.length; i++) {
    const cols = parseLigneCSV(lignes[i])
    const { erreur, transaction } = validerLigneCSV(cols, i + 1)
    if (erreur) erreurs.push(erreur)
    else valides.push(transaction)
  }

  return { valides, erreurs }
}
