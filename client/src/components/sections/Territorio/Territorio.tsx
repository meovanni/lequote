import { Component, Suspense, lazy, useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useContent } from '@/i18n/LocaleContext'
import type { PlaceId } from './TerrainScene'
import { useFlightProgress } from './useFlightProgress'
import styles from './Territorio.module.css'

// three e la scena arrivano in un pezzo a parte, solo nel browser e solo vicino alla sezione.
const TerrainScene = lazy(() => import('./TerrainScene').then((module) => ({ default: module.TerrainScene })))

// Punti di snap invisibili lungo il tratto pinnato (desktop): con lo snap obbligatorio della home,
// senza questi un gesto salterebbe l'intera sezione. Devono stare dentro .section { height }.
const SNAP_STEPS = 16

/** Se WebGL manca o la scena si rompe, resta la pagina con i testi. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Territorio() {
  const { territorio } = useContent()
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const labels = useRef<Record<PlaceId, HTMLElement | null>>({ roseto: null, cerchio: null })
  const { progress, mode, setMode, near, onScreen } = useFlightProgress(sectionRef, stageRef)
  const [ready, setReady] = useState(false)
  const fail = useCallback(() => setMode('static'), [setMode])
  const markReady = useCallback(() => setReady(true), [])
  const isPhone = mode === 'autoplay'

  return (
    <section
      id="territorio"
      data-surface="light"
      data-mode={mode}
      data-ready={ready}
      className={styles.section}
      ref={sectionRef}
    >
      {mode === 'scroll' &&
        Array.from({ length: SNAP_STEPS }, (_, index) => (
          <div key={index} className={styles.snapStep} style={{ top: `${(index / SNAP_STEPS) * 100}%` }} aria-hidden="true" />
        ))}

      <div className={styles.stage} ref={stageRef} style={{ '--p': 0 } as CSSProperties}>
        <div className={styles.canvas}>
          {near && mode !== 'pending' && (
            <SceneBoundary onError={fail}>
              <Suspense fallback={null}>
                <TerrainScene
                  progress={progress}
                  labels={labels}
                  active={onScreen}
                  segments={isPhone ? 220 : 420}
                  onReady={markReady}
                  onError={fail}
                />
              </Suspense>
            </SceneBoundary>
          )}
        </div>

        {territorio.places.map((place) => (
          <span
            key={place.id}
            className={`${styles.pin} mono-label`}
            data-place={place.id}
            ref={(element) => {
              labels.current[place.id as PlaceId] = element
            }}
            aria-hidden="true"
          >
            {place.place}
          </span>
        ))}

        <div className={styles.copy}>
          <div className={`${styles.beat} ${styles.intro}`}>
            <h2 className={`${styles.title} display-1`}>{territorio.title}</h2>
            <p className="body-lead">{territorio.intro}</p>
          </div>
          {territorio.places.map((place) => (
            <div key={place.id} className={`${styles.beat} ${styles.place}`} data-place={place.id}>
              <span className="specimen-tag specimen">{place.elevation}</span>
              <h3 className={`${styles.placeName} display-2`}>{place.place}</h3>
              <p className="body">{place.note}</p>
            </div>
          ))}
          <p className={`${styles.beat} ${styles.closing} display-3`}>{territorio.closing}</p>
        </div>

        <p className={styles.credit}>{territorio.credit}</p>
      </div>
    </section>
  )
}
