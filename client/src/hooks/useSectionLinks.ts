import { useEffect } from 'react'

// Link alle sezioni della pagina aperta (menu, footer, pulsanti dell'hero: "/#olio"). Lasciati al
// browser, cambiare àncora genera un popstate: React Router lo tratta come un "indietro" e la
// ScrollRestoration riporta la pagina alla posizione salvata, annullando lo scorrimento (serviva un
// secondo clic). Qui lo scorrimento si fa a mano e l'indirizzo si aggiorna senza popstate,
// conservando lo stato di cronologia di React Router.

/** L'id della sezione se il link porta a un'àncora di questa stessa pagina, altrimenti null. */
export function samePageHash(href: string, current: { origin: string; pathname: string }): string | null {
  let url: URL
  try {
    url = new URL(href, current.origin + current.pathname)
  } catch {
    return null
  }
  if (url.origin !== current.origin || url.pathname !== current.pathname || url.hash.length < 2) return null
  return decodeURIComponent(url.hash.slice(1))
}

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const anchor = (event.target as Element | null)?.closest?.('a[href]')
  if (!(anchor instanceof HTMLAnchorElement) || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return

  const id = samePageHash(anchor.href, window.location)
  const section = id ? document.getElementById(id) : null
  if (!id || !section) return

  event.preventDefault()
  // Al fotogramma dopo: il menu del telefono, chiuso dallo stesso clic, ha già sbloccato lo
  // scorrimento. Senza opzioni vale scroll-behavior del CSS: liscio, o immediato con movimento ridotto.
  requestAnimationFrame(() => {
    section.scrollIntoView()
    if (section.hasAttribute('tabindex')) section.focus({ preventScroll: true })
  })
  if (window.location.hash !== `#${id}`) window.history.replaceState(window.history.state, '', `#${id}`)
}

export function useSectionLinks() {
  useEffect(() => {
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
