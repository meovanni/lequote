import { Button, Container, Heading, IconButton, Input, Select, Table, Text, toast } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState, type FormEvent } from 'react'
import { FormField, orNull } from '../form-field'
import { formatDate, useFilieraAction, type Campaign } from '../../lib/filiera-api'
import { useUnsavedChanges } from '../../lib/unsaved-changes'

const MAX_FILE_MB = 15

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('Lettura del file non riuscita.'))
    reader.readAsDataURL(file)
  })
}

/** Analisi annuali della campagna: si caricano una volta e valgono per tutti i suoi lotti. */
export function AnalysesPanel({ campaign }: { campaign: Campaign }) {
  const action = useFilieraAction()
  const [title, setTitle] = useState('')
  const [lab, setLab] = useState('')
  const [date, setDate] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'internal'>('internal')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  useUnsavedChanges(title.trim() !== '' || lab.trim() !== '' || date !== '' || file !== null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Il file supera ${MAX_FILE_MB} MB.`)
      return
    }
    setUploading(true)
    try {
      const file_base64 = await toBase64(file)
      action.mutate(
        {
          path: `/admin/filiera/campaigns/${campaign.id}/analyses`,
          success: 'Analisi aggiunta.',
          body: { title: title.trim(), lab: orNull(lab), date: orNull(date), visibility, file_base64 },
        },
        { onSuccess: () => { setTitle(''); setLab(''); setDate(''); setFile(null) } },
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Caricamento del file non riuscito.')
    } finally {
      setUploading(false)
    }
  }

  const analyses = campaign.analyses ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Analisi della campagna</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Le analisi «Pubbliche» si possono scaricare dalla pagina di ogni lotto della campagna.
        </Text>
      </div>

      {analyses.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Titolo</Table.HeaderCell>
              <Table.HeaderCell>Laboratorio</Table.HeaderCell>
              <Table.HeaderCell>Data</Table.HeaderCell>
              <Table.HeaderCell>Visibilità</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {analyses.map((analysis) => (
              <Table.Row key={analysis.id}>
                <Table.Cell>
                  <a
                    href={`/admin/filiera/campaigns/${campaign.id}/analyses/${analysis.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui-fg-interactive"
                  >
                    {analysis.title}
                  </a>
                </Table.Cell>
                <Table.Cell>{analysis.lab ?? ''}</Table.Cell>
                <Table.Cell>{formatDate(analysis.date)}</Table.Cell>
                <Table.Cell>{analysis.visibility === 'public' ? 'Pubblica' : 'Interna'}</Table.Cell>
                <Table.Cell className="text-right">
                  <IconButton
                    size="small"
                    variant="transparent"
                    aria-label={`Elimina ${analysis.title}`}
                    onClick={() =>
                      action.mutate({
                        path: `/admin/filiera/campaigns/${campaign.id}/analyses/${analysis.id}`,
                        method: 'DELETE',
                        success: 'Analisi eliminata.',
                      })
                    }
                  >
                    <Trash />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-cols-2">
        <FormField id="analysis-title" label="Titolo">
          <Input id="analysis-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Analisi chimico-fisica" />
        </FormField>
        <FormField id="analysis-lab" label="Laboratorio">
          <Input id="analysis-lab" value={lab} onChange={(e) => setLab(e.target.value)} />
        </FormField>
        <FormField id="analysis-date" label="Data del referto">
          <Input id="analysis-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <FormField id="analysis-visibility" label="Visibilità">
          <Select value={visibility} onValueChange={(value) => setVisibility(value as 'public' | 'internal')}>
            <Select.Trigger id="analysis-visibility">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="internal">Interna</Select.Item>
              <Select.Item value="public">Pubblica</Select.Item>
            </Select.Content>
          </Select>
        </FormField>
        <FormField id="analysis-file" label="Referto (PDF)" hint={`Massimo ${MAX_FILE_MB} MB.`}>
          <input
            id="analysis-file"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="txt-compact-small"
            required
          />
        </FormField>
        <div className="flex items-end justify-end">
          <Button size="small" type="submit" isLoading={uploading || action.isPending} disabled={!file || !title.trim()}>
            Aggiungi l'analisi
          </Button>
        </div>
      </form>
    </Container>
  )
}
