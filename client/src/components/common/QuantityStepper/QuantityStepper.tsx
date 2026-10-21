import { useEffect, useRef, useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/common/icons/Icons'
import styles from './QuantityStepper.module.css'

// Le quantità contano da un valore all'altro invece di sostituire il testo di scatto: un clic
// rapido e ripetuto si vede scorrere invece di saltare.
function useTweenedNumber(target: number, duration = 220) {
  const [display, setDisplay] = useState(target)
  // Ultimo valore mostrato, anche a metà di un tween interrotto: la prossima animazione riparte
  // da lì, mai da un punto ormai superato.
  const displayRef = useRef(target)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(target)
      return
    }
    const from = displayRef.current
    if (from === target) return
    const start = performance.now()
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
    let raf = 0

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const next = Math.round(from + (target - from) * easeOutCubic(t))
      displayRef.current = next
      setDisplay(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

interface QuantityStepperProps {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  decrementLabel: string
  incrementLabel: string
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  min = 0,
  max = 20,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const displayValue = useTweenedNumber(value)
  return (
    <div className={[styles.stepper, className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.button}
        onClick={onDecrement}
        disabled={disabled || value <= min}
        aria-label={decrementLabel}
      >
        <MinusIcon className={styles.icon} />
      </button>
      <span className={`${styles.value} mono-figure`} aria-live="polite">
        {displayValue}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={onIncrement}
        disabled={disabled || value >= max}
        aria-label={incrementLabel}
      >
        <PlusIcon className={styles.icon} />
      </button>
    </div>
  )
}
