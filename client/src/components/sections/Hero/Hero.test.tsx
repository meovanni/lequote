import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero', () => {
  it('mostra la foto del viale degli ulivi, a misura per telefono e computer', () => {
    const { container } = render(<Hero />)
    const photo = screen.getByRole('img', { name: /viale degli ulivi/i })
    expect(photo).toHaveAttribute('src', '/images/oliveto.jpg')
    expect(photo.getAttribute('srcset')).toBe('/images/oliveto-1080.jpg 1080w, /images/oliveto.jpg 1920w')
    expect(photo).toHaveAttribute('fetchpriority', 'high')
    expect(container.querySelector('video')).toBeNull()
  })
})
