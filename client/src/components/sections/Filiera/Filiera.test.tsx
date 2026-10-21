import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useParams } from 'react-router'
import { Filiera } from './Filiera'

function LotStub() {
  return <p>Pagina del lotto {useParams().codice}</p>
}

// La ricerca per lotto naviga: la sezione si monta dentro un router, con la pagina del lotto finta.
function renderFiliera() {
  const router = createMemoryRouter([
    { path: '/', element: <Filiera /> },
    { path: '/lotto/:codice', element: <LotStub /> },
  ])
  return render(<RouterProvider router={router} />)
}

describe('Filiera', () => {
  it('mostra di default la filiera dell’olio, con i suoi passaggi in ordine', () => {
    renderFiliera()
    expect(screen.getByRole('tab', { name: /olio/i })).toHaveAttribute('aria-selected', 'true')
    const steps = screen.getAllByRole('listitem').map((li) => li.querySelector('h4')?.textContent)
    expect(steps.filter(Boolean)).toEqual(['Oliveto', 'Raccolta', 'Molitura', 'Analisi', 'Imbottigliamento'])
  })

  it('passa alla filiera del miele', async () => {
    renderFiliera()
    await userEvent.click(screen.getByRole('tab', { name: /miele/i }))
    expect(screen.getByRole('tab', { name: /miele/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Smielatura' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Molitura' })).not.toBeInTheDocument()
  })

  it('tiene le informazioni di legge chiuse finché non vengono aperte', async () => {
    renderFiliera()
    const panel = screen.getByRole('tabpanel')
    const details = panel.querySelector('details')
    expect(details).not.toHaveAttribute('open')
    await userEvent.click(within(panel).getByText('Informazioni di legge'))
    expect(details).toHaveAttribute('open')
    expect(screen.getByText('Al riparo dalla luce e dal calore')).toBeVisible()
  })

  it('segnala un codice lotto vuoto senza inviare nulla', async () => {
    renderFiliera()
    await userEvent.click(screen.getByRole('button', { name: /cerca il lotto/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/inserisci il codice lotto/i)
    expect(screen.getByLabelText(/codice lotto/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('segnala un codice lotto non valido', async () => {
    renderFiliera()
    await userEvent.type(screen.getByLabelText(/codice lotto/i), 'L2026/01')
    await userEvent.click(screen.getByRole('button', { name: /cerca il lotto/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/non sembra corretto/i)
  })

  it('con un codice valido apre la pagina del lotto, con il codice normalizzato', async () => {
    renderFiliera()
    await userEvent.type(screen.getByLabelText(/codice lotto/i), ' l2026-01 ')
    await userEvent.click(screen.getByRole('button', { name: /cerca il lotto/i }))
    expect(await screen.findByText('Pagina del lotto L2026-01')).toBeInTheDocument()
  })
})

describe('Filiera, accessibilità', () => {
  it('ogni tab punta a un pannello esistente; quello inattivo è nascosto', () => {
    const { container } = renderFiliera()
    for (const tab of screen.getAllByRole('tab')) {
      const panel = container.querySelector(`#${tab.getAttribute('aria-controls')}`)
      expect(panel).not.toBeNull()
      expect(panel?.hasAttribute('hidden')).toBe(tab.getAttribute('aria-selected') !== 'true')
    }
  })

  it('le frecce e Home/Fine spostano selezione e focus', async () => {
    renderFiliera()
    const olio = screen.getByRole('tab', { name: /olio/i })
    const miele = screen.getByRole('tab', { name: /miele/i })
    olio.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(miele).toHaveFocus()
    expect(miele).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Home}')
    expect(olio).toHaveFocus()
    await userEvent.keyboard('{End}')
    expect(miele).toHaveFocus()
  })
})

describe('LotLookup', () => {
  it('porta il focus sul campo in caso di errore', async () => {
    renderFiliera()
    await userEvent.click(screen.getByRole('button', { name: /cerca il lotto/i }))
    expect(screen.getByLabelText(/codice lotto/i)).toHaveFocus()
  })

  it('toglie l’errore quando il codice viene modificato', async () => {
    renderFiliera()
    const input = screen.getByLabelText(/codice lotto/i)
    await userEvent.click(screen.getByRole('button', { name: /cerca il lotto/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.type(input, 'L')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })
})
