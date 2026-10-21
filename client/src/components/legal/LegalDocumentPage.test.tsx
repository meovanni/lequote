import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { LocaleContext } from '@/i18n/LocaleContext'
import { Footer } from '@/components/layout/Footer/Footer'
import { LegalDocumentPage } from './LegalDocumentPage'

describe('LegalDocumentPage', () => {
  it('mostra titolo, avviso di bozza, indice e fonti di ogni sezione', () => {
    render(<LegalDocumentPage page="recesso" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Diritto di recesso' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/bozza/i)
    expect(screen.getByText('Ultimo aggiornamento: 21 ottobre 2026')).toBeInTheDocument()

    const toc = screen.getByRole('navigation', { name: 'In questa pagina' })
    const link = within(toc).getByRole('link', { name: 'Modulo tipo di recesso' })
    expect(link).toHaveAttribute('href', '#modulo')
    expect(document.getElementById('modulo')).not.toBeNull()

    expect(screen.getByText(/Riferimenti: Codice del Consumo, art\. 59 c\.1 lett\. e/)).toBeInTheDocument()
  })

  it('nelle traduzioni dice che prevale il testo italiano', () => {
    render(
      <LocaleContext.Provider value="en">
        <LegalDocumentPage page="privacy" />
      </LocaleContext.Provider>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy notice' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/Italian text prevails/)
  })
})

describe('Footer, link legali', () => {
  it('porta alle quattro pagine legali nella lingua corrente', () => {
    render(
      <LocaleContext.Provider value="de">
        <Footer />
      </LocaleContext.Provider>,
    )
    const nav = screen.getByRole('navigation', { name: 'Rechtliche Informationen' })
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['/de/condizioni-di-vendita', '/de/recesso', '/de/privacy', '/de/cookie'])
  })
})
