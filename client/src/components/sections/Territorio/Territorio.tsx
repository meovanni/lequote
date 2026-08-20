import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { territorio } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Territorio.module.css'

// Deve combaciare con .section { height } in Territorio.module.css: la sezione è alta PIN_VH
// e resta "pinnata" (position: sticky) per PIN_VH - STICKY_VH, cioè la porzione di scroll
// dedicata all'intera sequenza (ingrandimento del clip + i due segnaposto in successione).
// scroll-snap-type:y mandatory (impostato globalmente) forzerebbe un solo salto tra l'inizio
// di questa sezione e l'inizio della prossima se non ci fossero altri punti di snap nel mezzo:
// questi marcatori invisibili suddividono la sequenza in passi che ogni gesto di scroll può
// raggiungere, mantenendo "uno scroll = un movimento" coerente col resto del sito.
const PIN_VH = 580
const STICKY_VH = 100
const SNAP_STEPS = 26
const containFraction = (PIN_VH - STICKY_VH) / PIN_VH

// Fasi della sequenza, come frazione (0-1) della porzione "contain" (cioè dell'intero tratto
// pinnato). Devono combaciare con gli animation-range dei keyframe in Territorio.module.css:
// qui la stessa scala viene riletta a mano, in JS, per i browser (Firefox) privi di
// scroll-driven animations native. Tra la scomparsa di Roseto (0.52) e la comparsa di Cerchio
// (0.66) c'è una pausa deliberata (14% del percorso, ~81vh) prima che il secondo segnaposto si
// attivi.
const MASK_PHASE_END = 0.2
const HEADING_FADE_END = 0.08

const ROSETO_ENTER_START = 0.2
const ROSETO_ENTER_END = 0.28
const ROSETO_EXIT_START = 0.46
const ROSETO_EXIT_END = 0.52

const CERCHIO_ENTER_START = 0.66
const CERCHIO_ENTER_END = 0.74

// Devono combaciare con i keyframe territorio-mask-grow / territorio-photo-parallax in
// Territorio.module.css.
const MASK_FROM_W_VH = 0.6
const MASK_FROM_H_VH = 0.6
const MASK_TO_W_VMAX = 0.4
const MASK_TO_H_VMAX = 0.4
const PHOTO_PARALLAX_SCALE = 1.18
const PHOTO_PARALLAX_TRAVEL = 6 // % di translateY, da +6% a -6%

// Coordinate (nello spazio del viewBox di abruzzo.svg, "325 90 270 244") dei due <ellipse>
// inkscape:label="segno-roseto" / "segno-cerchio" aggiunti all'SVG. Ricavate applicando il loro
// transform="scale(1,-1)" a cx/cy: posizione resa = (cx, -cy).
const VIEWBOX = { x: 325, y: 90, w: 270, h: 244 }
const MARKER_COORDS = {
  roseto: { x: 469.95334, y: 141.03619 },
  cerchio: { x: 410.95575, y: 250.4272 },
}
// mask-position: center 60% in CSS: l'ancoraggio del riquadro della maschera nel contenitore.
const MASK_ANCHOR_X_PCT = 0.5
const MASK_ANCHOR_Y_PCT = 0.6

/** Posizione (px, relativa al contenitore a piena pagina) di un punto del viewBox della
 * maschera, una volta che questa ha raggiunto la sua dimensione finale (dopo MASK_PHASE_END) e
 * tenendo conto del letterboxing di preserveAspectRatio (default "meet") quando mask-size non
 * rispetta esattamente il rapporto larghezza/altezza del viewBox. */
function markerScreenPosition(vbX: number, vbY: number, containerW: number, containerH: number) {
  const vmax = Math.max(containerW, containerH)
  const maskW = MASK_TO_W_VMAX * vmax
  const maskH = MASK_TO_H_VMAX * vmax
  const scale = Math.min(maskW / VIEWBOX.w, maskH / VIEWBOX.h)
  const renderedW = VIEWBOX.w * scale
  const renderedH = VIEWBOX.h * scale
  const maskBoxX = (containerW - maskW) * MASK_ANCHOR_X_PCT
  const maskBoxY = (containerH - maskH) * MASK_ANCHOR_Y_PCT
  const shapeOriginX = maskBoxX + (maskW - renderedW) / 2
  const shapeOriginY = maskBoxY + (maskH - renderedH) / 2
  return {
    x: shapeOriginX + (vbX - VIEWBOX.x) * scale,
    y: shapeOriginY + (vbY - VIEWBOX.y) * scale,
  }
}

/** Rampa lineare 0→1 tra due frazioni di progress; costante fuori dall'intervallo. */
function rampIn(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return Math.min(1, Math.max(0, (progress - start) / (end - start)))
}

export function Territorio() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const headingRef = useRef<HTMLDivElement | null>(null)
  const maskedRef = useRef<HTMLDivElement | null>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)
  const apiaryPhotoRef = useRef<HTMLImageElement | null>(null)
  const rosetoRef = useRef<HTMLDivElement | null>(null)
  const cerchioRef = useRef<HTMLDivElement | null>(null)
  const [jsFallback, setJsFallback] = useState(false)
  const [markerPositions, setMarkerPositions] = useState<{
    roseto: { x: number; y: number }
    cerchio: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    const supportsScrollDriven = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'view()')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!supportsScrollDriven && !prefersReducedMotion) setJsFallback(true)
  }, [])

  // La posizione dei segnaposto dipende solo dalla dimensione finale della maschera (costante
  // dopo MASK_PHASE_END) e dal viewport: si ricalcola al resize, non ad ogni frame di scroll.
  useLayoutEffect(() => {
    const measure = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setMarkerPositions({
        roseto: markerScreenPosition(MARKER_COORDS.roseto.x, MARKER_COORDS.roseto.y, w, h),
        cerchio: markerScreenPosition(MARKER_COORDS.cerchio.x, MARKER_COORDS.cerchio.y, w, h),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (!jsFallback) return
    const section = sectionRef.current
    const heading = headingRef.current
    const masked = maskedRef.current
    const photo = photoRef.current
    const apiaryPhoto = apiaryPhotoRef.current
    const roseto = rosetoRef.current
    const cerchio = cerchioRef.current
    if (!section || !heading || !masked || !photo || !apiaryPhoto || !roseto || !cerchio) return

    let raf = 0

    const setMarkerState = (el: HTMLDivElement, visibility: number) => {
      el.style.opacity = String(visibility)
      el.style.transform = `translate(-50%, -50%) scale(${0.85 + visibility * 0.15})`
    }

    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const vmax = Math.max(window.innerWidth, vh)
      const pinRange = rect.height - vh
      const progress = pinRange > 0 ? Math.min(1, Math.max(0, -rect.top / pinRange)) : 0

      const maskProgress = rampIn(progress, 0, MASK_PHASE_END)
      const fromW = MASK_FROM_W_VH * vh
      const fromH = MASK_FROM_H_VH * vh
      const toW = MASK_TO_W_VMAX * vmax
      const toH = MASK_TO_H_VMAX * vmax
      const w = fromW + maskProgress * (toW - fromW)
      const h = fromH + maskProgress * (toH - fromH)
      masked.style.setProperty('mask-size', `${w}px ${h}px`)
      masked.style.setProperty('-webkit-mask-size', `${w}px ${h}px`)

      const headingProgress = rampIn(progress, 0, HEADING_FADE_END)
      heading.style.opacity = String(1 - headingProgress)
      heading.style.transform = `translate(-50%, ${-18 * headingProgress}px)`

      const travel = PHOTO_PARALLAX_TRAVEL - progress * (PHOTO_PARALLAX_TRAVEL * 2)
      const photoTransform = `scale(${PHOTO_PARALLAX_SCALE}) translateY(${travel}%)`
      photo.style.transform = photoTransform
      apiaryPhoto.style.transform = photoTransform

      const rosetoIn = rampIn(progress, ROSETO_ENTER_START, ROSETO_ENTER_END)
      const rosetoOut = 1 - rampIn(progress, ROSETO_EXIT_START, ROSETO_EXIT_END)
      setMarkerState(roseto, Math.min(rosetoIn, rosetoOut))

      const cerchioIn = rampIn(progress, CERCHIO_ENTER_START, CERCHIO_ENTER_END)
      setMarkerState(cerchio, cerchioIn)
      // La foto dell'apiario compare in dissolvenza in sincronia con l'attivazione del
      // segnaposto Cerchio, sopra la foto dell'oliveto (stesso parallasse dei due).
      apiaryPhoto.style.opacity = String(cerchioIn)
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

  const [rosetoContent, cerchioContent] = territorio.markers

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
            className={styles.photo}
            src={territorio.imageOliveto}
            alt={territorio.imageOlivetoLabel}
            loading="lazy"
          />
          <img
            ref={apiaryPhotoRef}
            className={`${styles.photo} ${styles.photoApiary}`}
            src={territorio.imageApiario}
            alt={territorio.imageApiarioLabel}
            loading="lazy"
          />
        </div>

        {markerPositions && (
          <>
            <div
              className={`${styles.marker} ${styles.markerRoseto}`}
              style={{ left: markerPositions.roseto.x, top: markerPositions.roseto.y }}
              ref={rosetoRef}
            >
              <span className={styles.markerDot} aria-hidden="true" />
              <div className={styles.markerCard}>
                <span className={styles.markerPlace}>{rosetoContent.place}</span>
                <p className={`${styles.markerNote} body-sm`}>{rosetoContent.note}</p>
              </div>
            </div>

            <div
              className={`${styles.marker} ${styles.markerCerchio}`}
              style={{ left: markerPositions.cerchio.x, top: markerPositions.cerchio.y }}
              ref={cerchioRef}
            >
              <span className={styles.markerDot} aria-hidden="true" />
              <div className={styles.markerCard}>
                <span className={styles.markerPlace}>{cerchioContent.place}</span>
                <p className={`${styles.markerNote} body-sm`}>{cerchioContent.note}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
