import { useLayoutEffect, useRef, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import type { ElevationMarker } from '@/types'
import { topoRidgeD, topoSilhouetteD, topoViewBox } from './topoPath'
import styles from './TopoLine.module.css'

interface TopoLineProps {
  markers: ElevationMarker[]
  className?: string
}

export function TopoLine({ markers, className }: TopoLineProps) {
  const ridgeRef = useRef<SVGPathElement | null>(null)
  const [ridgeLength, setRidgeLength] = useState(0)
  const [revealRef, isVisible] = useScrollReveal<HTMLDivElement>(0.3)

  useLayoutEffect(() => {
    if (ridgeRef.current) {
      setRidgeLength(ridgeRef.current.getTotalLength())
    }
  }, [])

  return (
    <div
      className={[styles.wrapper, isVisible ? styles.drawn : '', className].filter(Boolean).join(' ')}
      ref={revealRef}
    >
      <svg viewBox={topoViewBox} className={styles.svg} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="topo-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-oliva)" />
            <stop offset="100%" stopColor="var(--color-miele)" />
          </linearGradient>
        </defs>
        <path d={topoSilhouetteD} className={styles.silhouette} fill="url(#topo-gradient)" />
        <path
          ref={ridgeRef}
          d={topoRidgeD}
          className={styles.ridge}
          stroke="url(#topo-gradient)"
          style={{
            strokeDasharray: ridgeLength,
            strokeDashoffset: isVisible ? 0 : ridgeLength,
          }}
        />
      </svg>

      {markers.map((marker, index) => {
        const delay = isVisible ? `${0.9 + index * 0.25}s` : '0s'
        return (
          <div
            key={marker.id}
            className={[styles.marker, isVisible ? styles.markerVisible : ''].filter(Boolean).join(' ')}
            style={{
              left: `${marker.xPercent}%`,
              top: `${marker.yPercent}%`,
              transitionDelay: delay,
            }}
          >
            <span className={styles.markerDot} />
            <span className={styles.markerText} style={{ transitionDelay: delay }}>
              <span className={`${styles.markerQuota} mono-figure`}>{marker.quotaLabel}</span>
              <span className={`${styles.markerLabel} body-sm`}>{marker.label}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
