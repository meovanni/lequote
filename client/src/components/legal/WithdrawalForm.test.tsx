import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { submitWithdrawal } from '@/lib/medusa/withdrawal'
import { WithdrawalForm } from './WithdrawalForm'

vi.mock('@/lib/medusa/withdrawal', () => ({ submitWithdrawal: vi.fn() }))
const submit = vi.mocked(submitWithdrawal)

function renderForm(path = '/recesso') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <WithdrawalForm />
    </MemoryRouter>,
  )
}

describe('WithdrawalForm (art. 54-bis)', () => {
  beforeEach(() => {
    submit.mockReset()
  })

  it('si apre con il pulsante “Recedere dal contratto qui” e invia con “Conferma recesso”', async () => {
    submit.mockResolvedValue({ submittedAt: new Date('2026-10-21T09:05:00Z') })
    renderForm()
    expect(screen.queryByRole('button', { name: 'Conferma recesso' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Recedere dal contratto qui' }))
    await userEvent.type(screen.getByLabelText('Nome e cognome'), 'Anna Di Marco')
    await userEvent.type(screen.getByLabelText('Email'), 'anna@example.com')
    await userEvent.type(screen.getByLabelText('Numero dell’ordine'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Conferma recesso' }))

    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Anna Di Marco', email: 'anna@example.com', orderReference: '12', locale: 'it', website: '' }),
    )
    expect(await screen.findByRole('heading', { name: 'Recesso inviato' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('anna@example.com')
  })

  it('non invia senza i dati obbligatori e segnala l’email sbagliata', async () => {
    renderForm('/recesso?apri=1')
    await userEvent.type(screen.getByLabelText('Email'), 'anna')
    await userEvent.click(screen.getByRole('button', { name: 'Conferma recesso' }))
    expect(submit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Nome e cognome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Indirizzo email non valido.')).toBeInTheDocument()
  })

  it('arriva già aperto e compilato dal link dell’ordine', () => {
    renderForm('/recesso?ordine=12')
    expect(screen.getByLabelText('Numero dell’ordine')).toHaveValue('12')
  })

  it('se l’invio fallisce indica come recedere comunque', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    submit.mockRejectedValue(new Error('rete'))
    renderForm('/recesso?ordine=12')
    await userEvent.type(screen.getByLabelText('Nome e cognome'), 'Anna')
    await userEvent.type(screen.getByLabelText('Email'), 'anna@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Conferma recesso' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('info@lequote.it')
  })
})
