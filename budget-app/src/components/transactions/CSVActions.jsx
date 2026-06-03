import { useRef, useState } from 'react'
import { useBudget } from '@/context/BudgetContext'
import { exporterCSV, importerCSV } from '@/utils/csv'

export default function CSVActions({ transactionsFiltrees }) {
  const { state, dispatch } = useBudget()
  const inputRef = useRef(null)
  const [modal, setModal] = useState(null) // { valides, erreurs }
  const [importing, setImporting] = useState(false)

  async function handleFichier(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const resultat = await importerCSV(file)
      setModal(resultat)
    } finally {
      setImporting(false)
    }
  }

  function confirmerImport() {
    for (const t of modal.valides) {
      dispatch({ type: 'ADD_TRANSACTION', payload: t })
    }
    setModal(null)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => exporterCSV(transactionsFiltrees)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10
            transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10
            transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {importing ? 'Lecture…' : 'Import CSV'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFichier}
        />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Importer des transactions</h3>

            <div className="mb-4 space-y-2">
              <p className="text-slate-300 text-sm">
                <span className="text-emerald-400 font-semibold">{modal.valides.length}</span>{' '}
                transaction{modal.valides.length !== 1 ? 's' : ''} valide{modal.valides.length !== 1 ? 's' : ''} trouvée{modal.valides.length !== 1 ? 's' : ''}
              </p>
              {modal.erreurs.length > 0 && (
                <div>
                  <p className="text-amber-400 text-sm font-medium mb-1">
                    {modal.erreurs.length} ligne{modal.erreurs.length !== 1 ? 's' : ''} ignorée{modal.erreurs.length !== 1 ? 's' : ''}
                  </p>
                  <ul className="max-h-32 overflow-y-auto space-y-0.5">
                    {modal.erreurs.map((e, i) => (
                      <li key={i} className="text-xs text-slate-400 bg-white/5 rounded px-2 py-1">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white
                  bg-white/5 hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmerImport}
                disabled={modal.valides.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium
                  bg-emerald-600 hover:bg-emerald-500 text-white transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importer {modal.valides.length} transaction{modal.valides.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
