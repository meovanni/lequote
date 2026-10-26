import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Stagioni } from './Stagioni'

describe('Stagioni', () => {
  it('evidenzia il mese corrente e lo annuncia a parole', () => {
    const { container } = render(<Stagioni now={new Date(2026, 9, 11)} />)
    expect(screen.getByText('Ott').closest('[data-current]')).toHaveAttribute('data-current', 'true')
    expect(screen.getByText('Gen').closest('[data-current]')).toBeNull()
    expect(screen.getByText('Mese corrente: ottobre')).toBeInTheDocument()
    expect(container.querySelector('[data-month-row]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('elenca le attività di entrambe le quote', () => {
    render(<Stagioni now={new Date(2026, 0, 1)} />)
    const olio = screen.getByRole('list', { name: /olio/i })
    const miele = screen.getByRole('list', { name: /miele/i })
    expect(within(olio).getByText('Raccolta e molitura')).toBeInTheDocument()
    expect(within(miele).getByText('Fioriture del millefiori')).toBeInTheDocument()
  })

  it('descrive a parole il periodo, anche a cavallo d’anno, una sola volta per attività', () => {
    render(<Stagioni now={new Date(2026, 0, 1)} />)
    expect(screen.getAllByText('Invernamento')).toHaveLength(1)
    expect(screen.getByText('da novembre a febbraio')).toBeInTheDocument()
    expect(screen.getByText('ottobre')).toBeInTheDocument()
  })

  it('segna come in corso le attività del mese corrente', () => {
    render(<Stagioni now={new Date(2026, 9, 11)} />)
    const raccolta = screen.getByText('Raccolta e molitura').closest('li')
    expect(raccolta).toHaveAttribute('data-active', 'true')
    const potatura = screen.getByText('Potatura').closest('li')
    expect(potatura).toHaveAttribute('data-active', 'false')
  })
})
