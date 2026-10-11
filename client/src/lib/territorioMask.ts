// Dimensioni (px, lato del quadrato) della maschera di Territorio. Devono combaciare con
// --mask-from / --mask-to in Territorio.module.css.

/** --mask-from: min(60vh, 60vw). */
export function maskFromPx(viewportW: number, viewportH: number) {
  return 0.6 * Math.min(viewportW, viewportH)
}

/** --mask-to: max(40vmax, min(66vh, 92vw)). Sempre più grande di maskFromPx; in verticale arriva quasi alla larghezza dello schermo. */
export function maskToPx(viewportW: number, viewportH: number) {
  return Math.max(0.4 * Math.max(viewportW, viewportH), Math.min(0.66 * viewportH, 0.92 * viewportW))
}
