// Porta in vista un elemento scorrendo solo il contenitore che scorre davvero (il <main> del back
// office). scrollIntoView sposta anche i contenitori con overflow nascosto della cornice di
// Medusa: il menu saliva e metà schermo restava vuota.
export function scrollIntoMain(element: HTMLElement | null, offset = 16) {
  if (!element) return
  let parent = element.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) break
    parent = parent.parentElement
  }
  const target = parent ?? document.scrollingElement
  if (!target) return
  const top = element.getBoundingClientRect().top - target.getBoundingClientRect().top + target.scrollTop - offset
  target.scrollTo({ top, behavior: 'smooth' })
}
