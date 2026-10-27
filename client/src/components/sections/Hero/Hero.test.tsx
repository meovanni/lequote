import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero', () => {
  it('dichiara i codec delle sorgenti, così il browser scarta quelle che non sa decodificare', () => {
    const { container } = render(<Hero />)
    const types = [...container.querySelectorAll('source')].map((s) => s.getAttribute('type'))
    expect(types).toEqual(['video/mp4; codecs="avc1.640028"', 'video/mp4; codecs="avc1.640028"'])
  })

  it('sul telefono propone prima la versione leggera del video', () => {
    const { container } = render(<Hero />)
    const sources = [...container.querySelectorAll('source')]
    expect(sources.map((s) => [s.getAttribute('src'), s.getAttribute('media')])).toEqual([
      ['/videos/intro-mobile.mp4', '(max-width: 768px)'],
      ['/videos/intro.mp4', null],
    ])
    const video = container.querySelector('video')!
    expect(video).toHaveAttribute('preload', 'auto')
    // Nell'HTML vero, non solo come proprietà: senza, l'avvio automatico aspetta il JavaScript.
    expect(video).toHaveAttribute('muted')
    expect(video).toHaveAttribute('playsinline')
  })

  it('mostra la foto poster se l’ultima sorgente video fallisce', () => {
    const { container } = render(<Hero />)
    const sources = container.querySelectorAll('source')
    fireEvent.error(sources[sources.length - 1])
    expect(screen.getByRole('img', { name: /viale degli ulivi/i })).toBeInTheDocument()
    expect(container.querySelector('video')).toBeNull()
  })
})
