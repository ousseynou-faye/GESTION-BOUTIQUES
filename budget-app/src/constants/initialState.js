import { format, subDays, subMonths } from 'date-fns'

const today = new Date()
const moisCourant = format(today, 'yyyy-MM')

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function txn(type, montant, categorie, description, joursAvant) {
  const date = format(subDays(today, joursAvant), 'yyyy-MM-dd')
  return { id: makeId('txn'), type, montant, categorie, description, date, createdAt: Date.now() - joursAvant * 86400000 }
}

export const SEED_TRANSACTIONS = [
  txn('revenu',  2800, 'salaire',      'Salaire juin',              0),
  txn('revenu',   450, 'freelance',    'Mission web client',        5),
  txn('depense',  850, 'loyer',        'Loyer juin',                1),
  txn('depense',  120, 'electricite',  'Facture EDF',               2),
  txn('depense',   45, 'internet',     'Abonnement fibre',          3),
  txn('depense',  180, 'alimentation', 'Courses semaine',           1),
  txn('depense',   65, 'alimentation', 'Courses bio',               4),
  txn('depense',   32, 'restaurant',   'Déjeuner avec collègues',   2),
  txn('depense',   85, 'transport',    'Carburant',                 5),
  txn('depense',   28, 'transport',    'Ticket de train',           8),
  txn('depense',   15, 'abonnements',  'Netflix',                   3),
  txn('depense',   10, 'abonnements',  'Spotify',                   3),
  txn('depense',   55, 'loisirs',      'Sortie cinéma + resto',    10),
  txn('depense',  200, 'epargne',      'Virement épargne',          1),
  txn('revenu',   200, 'autres_revenus','Remboursement ami',        7),
  // Mois précédent
  txn('revenu',  2800, 'salaire',      'Salaire mai',              32),
  txn('depense',  850, 'loyer',        'Loyer mai',                33),
  txn('depense',  210, 'alimentation', 'Courses mai',              28),
  txn('depense',   90, 'transport',    'Carburant mai',            29),
  txn('depense',  150, 'vetements',    'Achat chaussures',         25),
  txn('depense',  320, 'voyages',      'Week-end Lyon',            20),
  txn('depense',   12, 'abonnements',  'Amazon Prime',             35),
  txn('depense',  200, 'epargne',      'Virement épargne',         33),
]

export const SEED_BUDGETS = [
  { id: makeId('bud'), categorie: 'alimentation', montantMensuel: 400, mois: moisCourant },
  { id: makeId('bud'), categorie: 'transport',    montantMensuel: 150, mois: moisCourant },
  { id: makeId('bud'), categorie: 'loisirs',      montantMensuel: 150, mois: moisCourant },
  { id: makeId('bud'), categorie: 'restaurant',   montantMensuel: 100, mois: moisCourant },
  { id: makeId('bud'), categorie: 'abonnements',  montantMensuel: 50,  mois: moisCourant },
]

export const SEED_GOALS = [
  {
    id: makeId('goal'),
    nom: 'Vacances été 2027',
    description: 'Road trip dans le sud de la France',
    montantCible: 3000,
    montantActuel: 750,
    dateEcheance: '2027-07-01',
    couleur: '#6366f1',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: makeId('goal'),
    nom: 'Fond d\'urgence',
    description: '3 mois de salaire de côté',
    montantCible: 8400,
    montantActuel: 3200,
    dateEcheance: '2026-12-31',
    couleur: '#10b981',
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: makeId('goal'),
    nom: 'Nouvel ordinateur',
    description: 'MacBook Pro pour le travail',
    montantCible: 2500,
    montantActuel: 900,
    dateEcheance: '2026-09-01',
    couleur: '#f59e0b',
    createdAt: Date.now() - 45 * 86400000,
  },
]

export const initialState = {
  transactions: [],
  budgets: [],
  goals: [],
  settings: {
    theme: 'light',
    devise: 'EUR',
    moisCourant,
  },
  seeded: false,
}
