import { createElement } from 'react'
import { pdf } from '@react-pdf/renderer'
import { RapportMensuel } from './RapportMensuel'

export async function downloadPdf({ mois, transactions, budgets, goals }) {
  const element = createElement(RapportMensuel, { mois, transactions, budgets, goals })
  const blob    = await pdf(element).toBlob()
  const url     = URL.createObjectURL(blob)
  const link    = document.createElement('a')
  link.href     = url
  link.download = `budget-pro-${mois}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
