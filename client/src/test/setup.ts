import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion'

afterEach(() => {
  cleanup()
})

// jsdom non implementa matchMedia: i componenti lo usano per prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom non implementa IntersectionObserver: Motion lo usa per le entrate (whileInView). Qui ogni
// elemento osservato risulta subito visibile e le animazioni saltano allo stato finale: i test
// verificano il contenuto a riposo, non i fotogrammi intermedi.
MotionGlobalConfig.skipAnimations = true

class VisibleIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    const entry = { isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry
    this.callback([entry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', { value: VisibleIntersectionObserver, writable: true })
