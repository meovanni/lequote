import { useEffect, useRef, useState } from 'react'
import { territorio } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Territorio.module.css'

// Deve combaciare con .section { height } in Territorio.module.css: la sezione è alta PIN_VH
// e resta "pinnata" (position: sticky) per PIN_VH - STICKY_VH, cioè la porzione di scroll
// dedicata all'ingrandimento del clip. scroll-snap-type:y mandatory (impostato globalmente)
// forzerebbe un solo salto tra l'inizio di questa sezione e l'inizio della prossima se non ci
// fossero altri punti di snap nel mezzo: questi marcatori invisibili suddividono l'ingrandimento
// in passi che ogni gesto di scroll può raggiungere, mantenendo "uno scroll = un movimento"
// coerente col resto del sito.
const PIN_VH = 200
const STICKY_VH = 100
const SNAP_STEPS = 9
const containFraction = (PIN_VH - STICKY_VH) / PIN_VH

// Devono combaciare con i keyframe territorio-mask-grow / territorio-heading-fade /
// territorio-photo-parallax in Territorio.module.css: qui vengono rieseguiti a mano, in JS,
// per i browser (Firefox) privi di scroll-driven animations native.
const MASK_FROM_W_VH = 0.24
const MASK_FROM_H_VH = 0.217
const MASK_TO_W_VMAX = 2.6
const MASK_TO_H_VMAX = 2.35
const HEADING_FADE_FRACTION = 0.32
const PHOTO_PARALLAX_SCALE = 1.18
const PHOTO_PARALLAX_TRAVEL = 6 // % di translateY, da +6% a -6%

export function Territorio() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const headingRef = useRef<HTMLDivElement | null>(null)
  const maskedRef = useRef<HTMLDivElement | null>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)
  const [jsFallback, setJsFallback] = useState(false)

  useEffect(() => {
    const supportsScrollDriven = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!supportsScrollDriven && !prefersReducedMotion) setJsFallback(true)
  }, [])

  useEffect(() => {
    if (!jsFallback) return
    const section = sectionRef.current
    const heading = headingRef.current
    const masked = maskedRef.current
    const photo = photoRef.current
    if (!section || !heading || !masked || !photo) return

    let raf = 0

    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const vmax = Math.max(window.innerWidth, vh)
      const pinRange = rect.height - vh
      const progress = pinRange > 0 ? Math.min(1, Math.max(0, -rect.top / pinRange)) : 0

      const fromW = MASK_FROM_W_VH * vh
      const fromH = MASK_FROM_H_VH * vh
      const toW = MASK_TO_W_VMAX * vmax
      const toH = MASK_TO_H_VMAX * vmax
      const w = fromW + progress * (toW - fromW)
      const h = fromH + progress * (toH - fromH)
      masked.style.setProperty('mask-size', `${w}px ${h}px`)
      masked.style.setProperty('-webkit-mask-size', `${w}px ${h}px`)

      const headingProgress = Math.min(progress / HEADING_FADE_FRACTION, 1)
      heading.style.opacity = String(1 - headingProgress)
      heading.style.transform = `translate(-50%, ${-18 * headingProgress}px)`

      const travel = PHOTO_PARALLAX_TRAVEL - progress * (PHOTO_PARALLAX_TRAVEL * 2)
      photo.style.transform = `scale(${PHOTO_PARALLAX_SCALE}) translateY(${travel}%)`
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [jsFallback])

  return (
    <section
      id="territorio"
      data-surface="light"
      className={[styles.section, jsFallback ? styles.jsFallback : ''].filter(Boolean).join(' ')}
      ref={sectionRef}
    >
      {Array.from({ length: SNAP_STEPS }, (_, index) => index / (SNAP_STEPS - 1)).map((step) => (
        <div
          key={step}
          className={styles.snapStep}
          style={{ top: `${step * containFraction * 100}%` }}
          aria-hidden="true"
        />
      ))}

      <div className={styles.pinStage}>
        <Reveal className={styles.heading} ref={headingRef}>
          <SectionHeading title={territorio.title} subtitle={territorio.intro} align="center" />
        </Reveal>

        <div className={styles.maskedPhoto} ref={maskedRef}>
          <img
            ref={photoRef}
            src={territorio.imageOliveto}
            alt={territorio.imageOlivetoLabel}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
