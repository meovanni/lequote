import type { ElevationMarker } from '@/types'

// Percentuali relative al viewBox del path in components/common/TopoLine/topoPath.ts
export const elevationMarkers: ElevationMarker[] = [
  {
    id: 'borsacchio',
    label: 'Riserva del Borsacchio',
    place: 'Roseto degli Abruzzi (TE)',
    quotaLabel: '0–100 m s.l.m.',
    xPercent: 5
    ,
    yPercent: 95,
  },
  {
    id: 'cerchio',
    label: 'Cerchio',
    place: "Piana del Fucino, L'Aquila (AQ)",
    quotaLabel: '700–900 m s.l.m.',
    xPercent: 98,
    yPercent: 10,
  },
]
