import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Domande } from './Domande'
import { domande } from '@/data/content'

describe('Domande', () => {
  it('mostra tutte le domande e le risposte senza doverle aprire', async () => {
    render(<Domande />)
    for (const topic of domande.topics) {
      expect(screen.getByRole('heading', { name: topic.label })).toBeInTheDocument()
      for (const item of topic.items) {
        expect(screen.getByRole('heading', { name: item.question })).toBeInTheDocument()
        // Le risposte entrano con un'animazione: si aspetta il primo fotogramma di Motion.
        await waitFor(() => expect(screen.getByText(item.answer)).toBeVisible())
      }
    }
  })

  it('espone la sezione con l’ancora usata dal footer', () => {
    const { container } = render(<Domande />)
    expect(container.querySelector('section#domande')).not.toBeNull()
  })
})

describe('Domande, struttura', () => {
  it('non annida titoli dentro elementi dt', () => {
    const { container } = render(<Domande />)
    expect(container.querySelector('dt h1, dt h2, dt h3, dt h4, dt h5, dt h6')).toBeNull()
  })
})
