import { defineRouteConfig } from '@medusajs/admin-sdk'
import { Badge, Container, Heading, Table, Tabs, Text } from '@medusajs/ui'
import { useState } from 'react'
import { RegistryDrawer, RegistryPanel } from '../../../components/filiera/registry-panel'
import { LINE_LABEL, useStageTemplates } from '../../../lib/filiera-api'

// Frantoi e stabilimenti sono fornitori: hanno la loro voce di menu (routes/fornitori).
const TABS: { kind: 'groves' | 'apiaries'; label: string }[] = [
  { kind: 'groves', label: 'Oliveti' },
  { kind: 'apiaries', label: 'Apiari' },
]

// Sola lettura per ora: i modelli si modificano via API; l'editor arriva quando i titolari
// avranno deciso quali dati raccogliere per ogni fase.
function StageTemplatesTab() {
  const { data } = useStageTemplates()
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Linea</Table.HeaderCell>
          <Table.HeaderCell>Fase</Table.HeaderCell>
          <Table.HeaderCell>Campi</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {(data?.templates ?? []).map((template) => (
          <Table.Row key={template.id}>
            <Table.Cell>{LINE_LABEL[template.product_line]}</Table.Cell>
            <Table.Cell>
              {template.position}. {template.name}
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-wrap gap-1">
                {template.fields.length === 0 && <Text size="small" className="text-ui-fg-subtle">Solo data e luogo</Text>}
                {template.fields.map((field) => (
                  <Badge key={field.key} size="2xsmall">
                    {field.label}
                  </Badge>
                ))}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

/** Oliveti, apiari e modelli di fase; il pulsante in alto crea una voce della scheda aperta. */
const RegistriesPage = () => {
  const [tab, setTab] = useState('groves')
  const place = TABS.find((item) => item.kind === tab)

  return (
    <Container className="p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="max-w-[65ch]">
          <Heading level="h1">Anagrafiche</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Oliveti e apiari si inseriscono una volta e si riusano in ogni campagna. Frantoi e stabilimenti sono nella voce Fornitori.
          </Text>
        </div>
        {place && <RegistryDrawer key={place.kind} kind={place.kind} />}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <Tabs.List className="px-6">
          {TABS.map((item) => (
            <Tabs.Trigger key={item.kind} value={item.kind}>
              {item.label}
            </Tabs.Trigger>
          ))}
          <Tabs.Trigger value="templates">Modelli di fase</Tabs.Trigger>
        </Tabs.List>
        {TABS.map((item) => (
          <Tabs.Content key={item.kind} value={item.kind} className="data-[state=inactive]:hidden mt-3 border-t border-ui-border-base">
            <RegistryPanel kind={item.kind} />
          </Tabs.Content>
        ))}
        <Tabs.Content value="templates" className="data-[state=inactive]:hidden mt-3 border-t border-ui-border-base">
          <StageTemplatesTab />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export const config = defineRouteConfig({ label: 'Anagrafiche' })

export default RegistriesPage
