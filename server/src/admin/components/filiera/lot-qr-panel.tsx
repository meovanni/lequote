import { Alert, Button, Container, Heading, Text } from '@medusajs/ui'
import type { Lot } from '../../lib/filiera-api'

// Le immagini e i download passano dalla sessione del back office, come le richieste dell'SDK.
const BACKEND = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')

function qrPath(lot: Lot, format: 'svg' | 'png', download: boolean): string {
  // Il codice nella query rinnova l'anteprima se il codice di una bozza cambia.
  const query = new URLSearchParams({ format, code: lot.code, ...(download ? { download: '1' } : {}) })
  return `${BACKEND}/admin/filiera/lots/${lot.id}/qr?${query}`
}

/** QR da stampare in etichetta: apre la pagina pubblica del lotto. */
export function LotQrPanel({ lot, qrUrl }: { lot: Lot; qrUrl: string }) {
  const published = lot.status === 'published'

  return (
    <Container className="flex flex-col gap-4 px-6 py-5">
      <div>
        <Heading level="h2">QR per l’etichetta</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Inquadrato con il telefono apre la pagina del lotto: campagna, fasi, analisi e informazioni di legge.
        </Text>
      </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <img
              src={qrPath(lot, 'svg', false)}
              alt={`QR del lotto ${lot.code}`}
              width={120}
              height={120}
              className="shrink-0 rounded border border-ui-border-base bg-white p-1"
            />
            <Text size="small" className="text-ui-fg-subtle">
              In stampa almeno 15 mm di lato (meglio 20 mm), compreso il bordo bianco: non tagliarlo. Nero su fondo chiaro.
            </Text>
          </div>
          <Text size="xsmall" className="font-mono break-all text-ui-fg-subtle">
            {qrUrl}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="small">
              <a href={qrPath(lot, 'svg', true)} download>
                Scarica SVG
              </a>
            </Button>
            <Button asChild size="small" variant="secondary">
              <a href={qrPath(lot, 'png', true)} download>
                Scarica PNG
              </a>
            </Button>
          </div>
          <Text size="xsmall" className="text-ui-fg-muted">
            L’SVG è per la tipografia: resta nitido a ogni misura.
          </Text>
        </div>
      {!published && (
        <Alert variant="info">
          Il lotto è in bozza: la pagina si apre solo dopo la pubblicazione e con il sito online. Se cambi il codice
          del lotto, scarica di nuovo il QR.
        </Alert>
      )}
    </Container>
  )
}
