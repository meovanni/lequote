import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { retrievePublicLot, type PublicLot } from '@/lib/medusa/lot'
import { LotPage } from './LotPage'

vi.mock('@/lib/medusa/lot', () => ({ retrievePublicLot: vi.fn() }))
const retrieve = vi.mocked(retrievePublicLot)

const lot: PublicLot = {
  code: 'L2026-07',
  productLine: 'olio',
  productName: 'Olio extravergine di oliva',
  campaign: '2025/26',
  stages: [
    { name: 'Raccolta', date: '2025-10-20', place: 'Roseto degli Abruzzi', fields: [{ label: 'Varietà', value: 'Leccino' }] },
    { name: 'Molitura', date: null, place: null, fields: [] },
  ],
  legal: [
    { label: 'Lotto', value: 'L2026-07' },
    { label: 'Da consumarsi preferibilmente entro', value: '2027-12-31' },
  ],
  analyses: [
    {
      title: 'Analisi chimica',
      lab: 'Lab Teramo',
      date: '2025-11-02',
      nutritionBasis: '100 ml',
      values: [{ key: 'acidita', label: 'Acidità libera', group: 'chimica', value: '0.21', unit: '% acido oleico' }],
    },
  ],
}

describe('LotPage', () => {
  beforeEach(() => {
    retrieve.mockReset()
  })

  it('mostra campagna, fasi in ordine con le date per esteso, analisi e informazioni di legge', async () => {
    retrieve.mockResolvedValue(lot)
    render(<LotPage rawCode="l2026-07" />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Olio extravergine di oliva' })).toBeInTheDocument()
    expect(retrieve).toHaveBeenCalledWith('L2026-07')
    expect(screen.getByText('Campagna 2025/26')).toBeInTheDocument()

    const stages = within(screen.getByRole('region', { name: 'Il percorso' })).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(stages).toEqual(['Raccolta', 'Molitura'])
    expect(screen.getByText('20 ottobre 2025 · Roseto degli Abruzzi')).toBeInTheDocument()
    expect(screen.getByText('Leccino')).toBeInTheDocument()

    // Il referto non si apre dal sito: c'è l'analisi, non un link al PDF.
    expect(screen.getByText('Analisi chimica')).toBeInTheDocument()
    // Analisi già espanse: i valori si leggono senza aprire nulla.
    expect(screen.getByRole('rowheader', { name: 'Acidità libera' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Apri il referto' })).not.toBeInTheDocument()

    const legal = screen.getByText('Informazioni di legge').closest('details')!
    expect(within(legal).getByText('31 dicembre 2027')).toBeInTheDocument()
  })

  it('dice che il lotto non esiste, senza distinguere le bozze', async () => {
    retrieve.mockResolvedValue(null)
    render(<LotPage rawCode="L2026-99" />)
    expect(await screen.findByRole('heading', { name: 'Lotto non trovato' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('L2026-99')
  })

  it('con un codice malformato non interroga il back end', () => {
    render(<LotPage rawCode="L20/26" />)
    expect(screen.getByRole('status')).toHaveTextContent(/non contiene un codice lotto valido/)
    expect(retrieve).not.toHaveBeenCalled()
  })

  it('se il back end non risponde lo dice e offre una via d’uscita', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    retrieve.mockRejectedValue(new Error('rete'))
    render(<LotPage rawCode="L2026-07" />)
    expect(await screen.findByText(/non riusciamo a mostrare il lotto/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cerca un altro lotto' })).toHaveAttribute('href', '/#filiera')
  })
})
