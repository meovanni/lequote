export type SurfaceTheme = 'dark' | 'light'

export interface NavItem {
  id: string
  label: string
}

export interface ElevationMarker {
  id: 'borsacchio' | 'cerchio'
  label: string
  place: string
  quotaLabel: string
  xPercent: number
  yPercent: number
}

export interface ProductTag {
  label: string
}

export interface TerritoryContent {
  id: 'borsacchio' | 'cerchio'
  quotaLabel: string
  title: string
  place: string
  body: string
  imageLabel: string
}
