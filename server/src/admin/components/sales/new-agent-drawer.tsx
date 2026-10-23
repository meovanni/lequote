import { Button, Drawer, Input, Text, Textarea } from '@medusajs/ui'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { useGuardedOpen } from '../use-guarded-open'
import { useSalesAction } from '../../lib/sales-api'

const EMPTY = { name: '', phone: '', email: '', notes: '' }

/** Nuovo agente: basta il nome. L'account per l'area vendita si crea poi dalla sua scheda. */
export function NewAgentDrawer() {
  const [values, setValues] = useState(EMPTY)
  const { open, onOpenChange, close, contentProps } = useGuardedOpen({
    dirty: Object.values(values).some((value) => value.trim() !== ''),
    onDiscard: () => setValues(EMPTY),
  })
  const action = useSalesAction()
  const set = (key: keyof typeof EMPTY) => (value: string) => setValues((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    action.mutate(
      {
        path: '/admin/agents',
        body: { name: values.name.trim(), phone: orNull(values.phone), email: orNull(values.email), notes: orNull(values.notes) },
        success: 'Agente aggiunto.',
      },
      {
        onSuccess: close,
      },
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <Button size="small">Nuovo agente</Button>
      </Drawer.Trigger>
      <Drawer.Content {...contentProps}>
        <form onSubmit={submit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>Nuovo agente</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4">
            <FormField id="new-agent-name" label="Nome">
              <Input id="new-agent-name" value={values.name} onChange={(event) => set('name')(event.target.value)} />
            </FormField>
            <FormField id="new-agent-phone" label="Telefono">
              <Input id="new-agent-phone" value={values.phone} onChange={(event) => set('phone')(event.target.value)} />
            </FormField>
            <FormField id="new-agent-email" label="Email" hint="Serve per creare il suo account dalla scheda.">
              <Input id="new-agent-email" type="email" value={values.email} onChange={(event) => set('email')(event.target.value)} />
            </FormField>
            <FormField id="new-agent-notes" label="Note">
              <Textarea id="new-agent-notes" value={values.notes} onChange={(event) => set('notes')(event.target.value)} />
            </FormField>
          </Drawer.Body>
          <Drawer.Footer>
            <Text size="xsmall" className="mr-auto text-ui-fg-muted">
              Basta il nome.
            </Text>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Annulla
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={action.isPending} disabled={!values.name.trim()}>
              Aggiungi
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
