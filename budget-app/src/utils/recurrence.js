function makeId() {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function dateToMois(dateStr) {
  return dateStr.slice(0, 7)
}

export function moisEntre(debut, fin) {
  const mois = []
  let [y, m] = debut.split('-').map(Number)
  const [fy, fm] = fin.split('-').map(Number)

  m += 1
  if (m > 12) { m = 1; y += 1 }

  while (y < fy || (y === fy && m <= fm)) {
    mois.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }

  return mois
}

export function ajusterJour(moisStr, jour) {
  const [y, m] = moisStr.split('-').map(Number)
  const dernierJour = new Date(y, m, 0).getDate()
  const j = Math.min(jour, dernierJour)
  return `${moisStr}-${String(j).padStart(2, '0')}`
}

export function calculerTransactionsAGenerer(transactions, moisCourant) {
  const nouvelles = []
  const majOriginales = []

  for (const t of transactions) {
    if (!t.recurrente) continue

    const lastGen = t.derniereGeneration ?? dateToMois(t.date)
    if (lastGen === moisCourant) continue

    const mois = moisEntre(lastGen, moisCourant)
    if (mois.length === 0) continue

    const jourOriginal = parseInt(t.date.slice(8, 10), 10)

    for (const moisCible of mois) {
      nouvelles.push({
        id: makeId(),
        type: t.type,
        montant: t.montant,
        categorie: t.categorie,
        description: t.description,
        note: t.note ?? null,
        recurrente: false,
        date: ajusterJour(moisCible, jourOriginal),
        createdAt: Date.now(),
      })
    }

    majOriginales.push({ id: t.id, derniereGeneration: moisCourant })
  }

  return { nouvelles, majOriginales }
}
