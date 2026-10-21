import { cutoffDate, retentionDays, unpaidTransfersToCancel, type OrderForPaymentCheck } from '../housekeeping'

describe('retentionDays', () => {
  it('legge un numero intero positivo dalla configurazione', () => {
    expect(retentionDays('5', 7)).toBe(5)
  })

  it('ricade sul valore predefinito se manca o non è valido', () => {
    expect(retentionDays(undefined, 7)).toBe(7)
    expect(retentionDays('', 7)).toBe(7)
    expect(retentionDays('zero', 7)).toBe(7)
    expect(retentionDays('0', 7)).toBe(7)
    expect(retentionDays('-3', 7)).toBe(7)
    expect(retentionDays('2.5', 7)).toBe(7)
  })
})

describe('cutoffDate', () => {
  it('toglie i giorni indicati', () => {
    expect(cutoffDate(new Date('2026-10-21T03:00:00Z'), 5).toISOString()).toBe('2026-10-16T03:00:00.000Z')
  })
})

describe('unpaidTransfersToCancel', () => {
  const cutoff = new Date('2026-10-14T00:00:00Z')
  const base: OrderForPaymentCheck = {
    id: 'order_1',
    status: 'pending',
    created_at: '2026-10-10T09:00:00Z',
    metadata: null,
    payment_collections: [{ status: 'authorized', payments: [{ provider_id: 'pp_bonifico_lequote', captured_at: null }] }],
  }

  it('annulla un ordine dal sito pagato con bonifico, non incassato e oltre il termine', () => {
    expect(unpaidTransfersToCancel([base], cutoff)).toEqual(['order_1'])
  })

  it('lascia stare gli ordini ancora nei termini', () => {
    expect(unpaidTransfersToCancel([{ ...base, created_at: '2026-10-15T09:00:00Z' }], cutoff)).toEqual([])
  })

  it('lascia stare i bonifici già incassati', () => {
    const paid = {
      ...base,
      payment_collections: [{ status: 'completed', payments: [{ provider_id: 'pp_bonifico_lequote', captured_at: '2026-10-12T10:00:00Z' }] }],
    }
    expect(unpaidTransfersToCancel([paid], cutoff)).toEqual([])
  })

  it('lascia stare il pagamento al ritiro e gli ordini già annullati', () => {
    const pickup = {
      ...base,
      payment_collections: [{ status: 'authorized', payments: [{ provider_id: 'pp_ritiro_lequote', captured_at: null }] }],
    }
    expect(unpaidTransfersToCancel([pickup, { ...base, id: 'order_2', status: 'canceled' }], cutoff)).toEqual([])
  })

  it('lascia stare le prenotazioni inserite da agenti o dal back office, che hanno acconti', () => {
    const agent = { ...base, metadata: { inserted_by: { type: 'agente', id: 'agent_1', name: 'Bruno' } } }
    const admin = { ...base, id: 'order_3', metadata: { inserted_by: { type: 'admin', id: 'user_1', name: 'Anna' } } }
    const site = { ...base, id: 'order_4', metadata: { inserted_by: { type: 'sito' } } }
    expect(unpaidTransfersToCancel([agent, admin, site], cutoff)).toEqual(['order_4'])
  })
})
