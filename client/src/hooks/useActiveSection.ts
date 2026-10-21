import { useEffect, useState } from 'react'

// Nessuna voce attiva finché una sezione non entra nella fascia centrale dello schermo: in cima
// alla home (hero) e sulle altre pagine la barra non evidenzia nulla.
export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}
