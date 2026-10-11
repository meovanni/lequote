import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Build con assi wght + opsz: senza opsz i titoli grandi usano la taglia ottica da testo, più pesante.
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'

import '@/styles/tokens.css'
import '@/styles/typography.css'
import '@/styles/global.css'

import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
