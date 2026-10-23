import { useEffect, useRef, useState, type RefObject } from 'react'
import { FLIGHT_END } from '@/lib/terrain/flight'
import { NATIVE_SCROLL_QUERY } from '@/lib/nativeScroll'

/**
 * Come avanza il volo:
 * - scroll: desktop, la sezione è pinnata e lo scroll sposta la camera da Roseto a Cerchio;
 * - autoplay: telefono, scroll nativo (memoria del progetto): lo spostamento parte da solo
 *   quando la sezione è a metà schermo, una volta;
 * - static: movimento ridotto o niente WebGL, la vista a metà percorso con tutti i testi.
 */
export type FlightMode = 'pending' | 'scroll' | 'autoplay' | 'static'

const AUTOPLAY_MS = 8000
const STATIC_PROGRESS = FLIGHT_END / 2

/** Progress 0-1 in un ref (letto dalla scena a ogni frame) e in --p sullo stage (letto dalla CSS). */
export function useFlightProgress(section: RefObject<HTMLElement | null>, stage: RefObject<HTMLElement | null>) {
  const progress = useRef(0)
  const [mode, setMode] = useState<FlightMode>('pending')
  // La scena (three, ~150 KB gzip) si carica solo quando la sezione si avvicina.
  const [near, setNear] = useState(false)
  const [onScreen, setOnScreen] = useState(false)

  const publish = (value: number) => {
    progress.current = value
    stage.current?.style.setProperty('--p', value.toFixed(4))
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const native = window.matchMedia(NATIVE_SCROLL_QUERY).matches
    setMode(reduced ? 'static' : native ? 'autoplay' : 'scroll')
  }, [])

  useEffect(() => {
    const element = section.current
    if (!element) return
    const nearObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '100% 0px' })
    const screenObserver = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    nearObserver.observe(element)
    screenObserver.observe(element)
    return () => {
      nearObserver.disconnect()
      screenObserver.disconnect()
    }
  }, [section])

  useEffect(() => {
    // Fermo: a metà del percorso si vedono insieme Roseto e Cerchio.
    if (mode === 'static') publish(STATIC_PROGRESS)
    if (mode !== 'scroll') return
    let frame = 0
    const update = () => {
      frame = 0
      const element = section.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      publish(range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [mode, section])

  useEffect(() => {
    if (mode !== 'autoplay') return
    const element = section.current
    if (!element) return
    // Il tempo del volo scorre solo mentre la sezione è almeno a metà sullo schermo: se si
    // scorre via a metà, riprende da lì quando si torna.
    let frame = 0
    let visible = false
    let elapsed = 0
    let last = 0
    const tick = (now: number) => {
      frame = 0
      if (!visible) return
      elapsed += last ? now - last : 0
      last = now
      const value = Math.min(1, elapsed / AUTOPLAY_MS)
      // Sul telefono la pagina scorre già da sé: niente uscita verso l'alto, ci si ferma su Cerchio.
      publish(value * FLIGHT_END)
      if (value < 1) frame = window.requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        last = 0
        if (visible && !frame && elapsed < AUTOPLAY_MS) frame = window.requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [mode, section])

  return { progress, mode, setMode, near, onScreen }
}
