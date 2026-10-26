import { Button, FocusModal, Heading, IconButton, Input, Select, Text, Textarea, usePrompt } from '@medusajs/ui'
import { Trash } from '@medusajs/icons'
import { useState } from 'react'
import {
  KNOWN_VALUES,
  VALUE_GROUPS,
  analysisResultsFrom,
  parseAnalysisValues,
  type AnalysisValue,
  type NutritionBasis,
  type ValueGroup,
} from '../../../modules/filiera/lib/analysis-values'
import { FormField, orNull } from '../form-field'
import { toDateInput, useFilieraAction, type Analysis } from '../../lib/filiera-api'
import { useGuardedOpen } from '../use-guarded-open'

const GROUP_LABEL: Record<ValueGroup, string> = {
  chimica: 'Parametri chimici',
  nutrizionale: 'Dichiarazione nutrizionale',
  organolettica: 'Profilo organolettico',
  altro: 'Altro',
}

const CUSTOM = '__custom'

type Form = {
  title: string
  lab: string
  date: string
  visibility: 'public' | 'internal'
  markdown: string
  nutrition_basis: NutritionBasis
  values: AnalysisValue[]
}

function formOf(analysis: Analysis): Form {
  const results = analysis.results ?? analysisResultsFrom('')
  return {
    title: analysis.title,
    lab: analysis.lab ?? '',
    date: toDateInput(analysis.date),
    visibility: analysis.visibility,
    markdown: results.markdown,
    nutrition_basis: results.nutrition_basis,
    values: results.values,
  }
}

/** Chiave per un parametro aggiunto a mano: dal nome, unica tra quelle già presenti. */
function customKey(label: string, taken: Set<string>): string {
  const base = `x_${label.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30) || 'valore'}`
  let key = base
  for (let n = 2; taken.has(key); n++) key = `${base}_${n}`
  return key
}

/**
 * Correzione di un referto: a destra il testo estratto dal PDF (modificabile), a sinistra i valori
 * letti, da controllare uno per uno. «Rileggi dal testo» rifà la lettura sul testo corretto.
 */
export function AnalysisEditor({ campaignId, analysis }: { campaignId: string; analysis: Analysis }) {
  const action = useFilieraAction()
  const prompt = usePrompt()
  const [form, setForm] = useState<Form>(() => formOf(analysis))
  const [adding, setAdding] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const dirty = JSON.stringify(form) !== JSON.stringify(formOf(analysis))
  const { open, onOpenChange, close, contentProps } = useGuardedOpen({ dirty, onDiscard: () => setForm(formOf(analysis)) })

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }))
  const setValue = (key: string, patch: Partial<AnalysisValue>) =>
    set('values', form.values.map((value) => (value.key === key ? { ...value, ...patch } : value)))
  const removeValue = (key: string) => set('values', form.values.filter((value) => value.key !== key))

  const missing = KNOWN_VALUES.filter((known) => !form.values.some((value) => value.key === known.key))

  const add = () => {
    const taken = new Set(form.values.map((value) => value.key))
    if (adding === CUSTOM) {
      if (!customLabel.trim()) return
      set('values', [...form.values, { key: customKey(customLabel, taken), label: customLabel.trim(), group: 'altro', value: '', unit: null }])
      setCustomLabel('')
    } else {
      const known = KNOWN_VALUES.find((entry) => entry.key === adding)
      if (!known) return
      set('values', [...form.values, { key: known.key, label: known.label, group: known.group, value: '', unit: known.unit }])
    }
    setAdding('')
  }

  const reread = async () => {
    const confirmed = await prompt({
      title: 'Rileggere i valori dal testo?',
      description: 'I valori riconosciuti nel testo sostituiscono quelli in elenco con lo stesso parametro; gli altri restano.',
      confirmText: 'Rileggi',
      cancelText: 'Annulla',
    })
    if (!confirmed) return
    const parsed = parseAnalysisValues(form.markdown)
    const kept = form.values.filter((value) => !parsed.some((entry) => entry.key === value.key))
    set('values', [...parsed, ...kept])
  }

  const save = () => {
    action.mutate(
      {
        path: `/admin/filiera/campaigns/${campaignId}/analyses/${analysis.id}`,
        success: 'Analisi aggiornata.',
        body: {
          title: form.title.trim(),
          lab: orNull(form.lab),
          date: orNull(form.date),
          visibility: form.visibility,
          markdown: form.markdown,
          nutrition_basis: form.nutrition_basis,
          values: form.values.filter((value) => value.value.trim() !== '').map((value) => ({ ...value, unit: orNull(value.unit ?? '') })),
        },
      },
      { onSuccess: close },
    )
  }

  const count = analysis.results?.values.length ?? 0

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          {count > 0 ? `Valori (${count})` : 'Inserisci i valori'}
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content {...contentProps}>
        <FocusModal.Header>
          <div className="flex w-full items-center justify-end gap-2">
            <FocusModal.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Annulla
              </Button>
            </FocusModal.Close>
            <Button size="small" onClick={save} isLoading={action.isPending} disabled={!form.title.trim()}>
              Salva
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="overflow-y-auto px-6 py-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              <div>
                <Heading level="h1">{analysis.title}</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Controlla ogni valore con il referto: sul sito escono solo i valori in elenco, con il punto o la virgola come decimali.
                </Text>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField id="edit-analysis-title" label="Titolo">
                  <Input id="edit-analysis-title" value={form.title} onChange={(e) => set('title', e.target.value)} />
                </FormField>
                <FormField id="edit-analysis-lab" label="Laboratorio">
                  <Input id="edit-analysis-lab" value={form.lab} onChange={(e) => set('lab', e.target.value)} />
                </FormField>
                <FormField id="edit-analysis-date" label="Data del referto">
                  <Input id="edit-analysis-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </FormField>
                <FormField id="edit-analysis-visibility" label="Visibilità">
                  <Select value={form.visibility} onValueChange={(value) => set('visibility', value as Form['visibility'])}>
                    <Select.Trigger id="edit-analysis-visibility">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="internal">Interna</Select.Item>
                      <Select.Item value="public">Pubblica</Select.Item>
                    </Select.Content>
                  </Select>
                </FormField>
              </div>

              {VALUE_GROUPS.map((group) => {
                const values = form.values.filter((value) => value.group === group)
                if (values.length === 0) return null
                return (
                  <fieldset key={group} className="flex flex-col gap-2">
                    <legend className="txt-compact-small-plus mb-2 flex w-full items-center justify-between">
                      {GROUP_LABEL[group]}
                    </legend>
                    {group === 'nutrizionale' && (
                      <div className="flex items-center gap-2">
                        <Text size="small" className="text-ui-fg-subtle">
                          Valori per
                        </Text>
                        <Select size="small" value={form.nutrition_basis} onValueChange={(value) => set('nutrition_basis', value as NutritionBasis)}>
                          <Select.Trigger aria-label="Base della dichiarazione nutrizionale" className="w-28">
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="100 g">100 g</Select.Item>
                            <Select.Item value="100 ml">100 ml</Select.Item>
                          </Select.Content>
                        </Select>
                      </div>
                    )}
                    {values.map((value) => (
                      <div key={value.key} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] items-center gap-2">
                        <Input size="small" aria-label="Parametro" value={value.label} onChange={(e) => setValue(value.key, { label: e.target.value })} />
                        <Input size="small" aria-label={`Valore: ${value.label}`} value={value.value} onChange={(e) => setValue(value.key, { value: e.target.value })} />
                        <Input size="small" aria-label={`Unità: ${value.label}`} placeholder="unità" value={value.unit ?? ''} onChange={(e) => setValue(value.key, { unit: e.target.value })} />
                        <IconButton size="small" variant="transparent" aria-label={`Togli ${value.label}`} onClick={() => removeValue(value.key)}>
                          <Trash />
                        </IconButton>
                      </div>
                    ))}
                  </fieldset>
                )
              })}

              {form.values.length === 0 && (
                <Text size="small" className="text-ui-fg-subtle">
                  Nessun valore letto: il referto potrebbe essere una scansione. Aggiungili qui sotto.
                </Text>
              )}

              <div className="flex flex-wrap items-end gap-2 border-t border-ui-border-base pt-4">
                <FormField id="add-analysis-value" label="Aggiungi un parametro">
                  <Select size="small" value={adding} onValueChange={setAdding}>
                    <Select.Trigger id="add-analysis-value" className="w-72">
                      <Select.Value placeholder="Scegli…" />
                    </Select.Trigger>
                    <Select.Content>
                      {missing.map((known) => (
                        <Select.Item key={known.key} value={known.key}>
                          {known.label} ({GROUP_LABEL[known.group].toLowerCase()})
                        </Select.Item>
                      ))}
                      <Select.Item value={CUSTOM}>Altro parametro…</Select.Item>
                    </Select.Content>
                  </Select>
                </FormField>
                {adding === CUSTOM && (
                  <Input size="small" aria-label="Nome del parametro" placeholder="Nome del parametro" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
                )}
                <Button size="small" variant="secondary" type="button" onClick={add} disabled={!adding || (adding === CUSTOM && !customLabel.trim())}>
                  Aggiungi
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Heading level="h2">Testo del referto</Heading>
                  <Text size="small" className="text-ui-fg-subtle">
                    Estratto dal PDF in markdown. Resta nel back office: non viene pubblicato.
                  </Text>
                </div>
                <Button size="small" variant="secondary" type="button" onClick={() => void reread()} disabled={!form.markdown.trim()}>
                  Rileggi dal testo
                </Button>
              </div>
              <Textarea
                aria-label="Testo del referto"
                value={form.markdown}
                onChange={(e) => set('markdown', e.target.value)}
                placeholder="Nessun testo estratto. Puoi incollare qui il testo del referto e poi usare «Rileggi dal testo»."
                className="min-h-[32rem] font-mono text-xs"
              />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
