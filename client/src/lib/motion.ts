import type { Variants } from 'motion/react'

// Linguaggio di movimento condiviso. Tutto a tempo e una volta sola: niente animazioni agganciate
// allo scroll fuori dal desktop (vedi lib/nativeScroll.ts e DESIGN.md).

/** Stessa curva di --ease-out in tokens.css: parte decisa, arriva morbida. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** Un blocco parte quando ne è visibile un quinto, un po' prima del bordo basso dello schermo. */
export const REVEAL_VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const

/** Contenitore che fa partire i figli in cascata. */
export const staggerParent = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Figlio della cascata: sale e compare. */
export const riseChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
}

/** Figlio della cascata: una linea o una barra che cresce da sinistra. */
export const growChild: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE_OUT } },
}
