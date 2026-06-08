import { useState } from 'react'
import { useBudget } from '@/context/BudgetContext'

const DEVISES = [
  { value: 'fcfa', label: 'FCFA' },
  { value: 'eur',  label: 'EUR'  },
  { value: 'usd',  label: 'USD'  },
]

function SettingsCard({ titre, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      <div
        className="px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h2 className="font-display text-[13px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {titre}
        </h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}

export default function Settings() {
  const { state, dispatch } = useBudget()
  const { nom, theme, devise } = state.settings
  const isDark = theme === 'dark'

  const [nomInput, setNomInput] = useState(nom)

  function handleSaveNom(e) {
    e.preventDefault()
    dispatch({ type: 'SET_NOM', payload: { nom: nomInput.trim() } })
  }

  return (
    <div className="flex flex-col gap-7 animate-fade-slide-up">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
          Paramètres
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Personnalisez votre expérience Budget Pro
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-lg">

        {/* ── Profil ── */}
        <SettingsCard titre="Profil">
          <form onSubmit={handleSaveNom} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                Prénom
              </label>
              <input
                type="text"
                value={nomInput}
                onChange={e => setNomInput(e.target.value)}
                placeholder="Votre prénom"
                maxLength={32}
                className="input-dark"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary text-sm px-4 py-1.5">
                Enregistrer
              </button>
            </div>
          </form>
        </SettingsCard>

        {/* ── Apparence ── */}
        <SettingsCard titre="Apparence">
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: 'dark' } })}
              className={isDark ? 'btn-primary text-sm px-4 py-1.5' : 'btn-secondary text-sm px-4 py-1.5'}
            >
              Sombre
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_THEME', payload: { theme: 'light' } })}
              className={!isDark ? 'btn-primary text-sm px-4 py-1.5' : 'btn-secondary text-sm px-4 py-1.5'}
            >
              Clair
            </button>
          </div>
        </SettingsCard>

        {/* ── Devise ── */}
        <SettingsCard titre="Devise d'affichage">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {DEVISES.map(d => (
                <button
                  key={d.value}
                  onClick={() => dispatch({ type: 'SET_DEVISE', payload: { devise: d.value } })}
                  className={devise === d.value ? 'btn-primary text-sm px-4 py-1.5' : 'btn-secondary text-sm px-4 py-1.5'}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-dimmed)' }}>
              Les montants restent stockés en FCFA. Seul le symbole change.
            </p>
          </div>
        </SettingsCard>

      </div>
    </div>
  )
}
