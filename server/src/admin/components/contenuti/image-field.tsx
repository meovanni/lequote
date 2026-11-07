import { Photo } from '@medusajs/icons'
import { Badge, Button, Text } from '@medusajs/ui'
import { useRef } from 'react'
import { imagePreview, useSaveDraft, useUploadImage, type ContentField } from '../../lib/contenuti-api'

type ImageFieldProps = {
  field: ContentField
  state: { value: string; modified: boolean; pending: boolean }
  storefront: string | null
}

/** Foto del sito, uguale in ogni lingua: anteprima, "Carica foto", ritorno alla foto di partenza. */
export function ImageField({ field, state, storefront }: ImageFieldProps) {
  const input = useRef<HTMLInputElement>(null)
  const upload = useUploadImage()
  const save = useSaveDraft()
  const preview = imagePreview(state.value, storefront)

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex h-28 w-40 items-center justify-center overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
        {preview ? (
          <img src={preview} alt={field.label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-ui-fg-muted">
            <Photo />
            <Text size="xsmall">{state.value ? 'Anteprima non disponibile' : 'Nessuna foto'}</Text>
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          {state.pending && (
            <Badge size="2xsmall" color="orange">
              da pubblicare
            </Badge>
          )}
          {!state.value && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              Senza foto il sito mostra “Immagine in arrivo”.
            </Text>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) upload.mutate({ key: field.key, file })
          }}
        />
        <Button size="small" variant="secondary" isLoading={upload.isPending} onClick={() => input.current?.click()}>
          {state.value ? 'Sostituisci foto' : 'Carica foto'}
        </Button>
        {state.modified && (
          <button
            type="button"
            className="txt-compact-xsmall text-ui-fg-interactive hover:underline"
            onClick={() => save.mutate({ key: field.key, scope: 'shared', value: null })}
          >
            Torna alla foto di partenza
          </button>
        )}
        <Text size="xsmall" className="text-ui-fg-muted">
          JPEG, PNG o WebP, fino a 10 MB, almeno 1600 px sul lato lungo.
        </Text>
      </div>
    </div>
  )
}
