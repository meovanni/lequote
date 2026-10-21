import { data } from 'react-router'

// Qualsiasi indirizzo sconosciuto finisce nell'ErrorBoundary di root con un 404.
export function clientLoader() {
  throw data(null, { status: 404 })
}

export default function NotFound() {
  return null
}
