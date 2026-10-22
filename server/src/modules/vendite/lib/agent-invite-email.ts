import { escapeHtml, toHtml, toText, type Block } from '../../../lib/order-emails'

export type AgentInviteData = { agentName: string; inviteUrl: string; expiresAt: Date }

const SUBJECT = 'Le Quote: il tuo accesso all’area vendita'

/** "23 ottobre 2026, 10:30", in ora italiana. */
function formatExpiry(date: Date): string {
  const day = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' })
  const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
  return `${day}, ${time}`
}

/** Invito per l'agente: il link porta alla scelta della password, poi all'area vendita. */
export function renderAgentInvite(data: AgentInviteData): { subject: string; text: string; html: string } {
  const intro: Block = {
    rows: [
      `Ciao ${data.agentName},`,
      'ti abbiamo creato un account per l’area vendita di Le Quote: da lì inserisci le prenotazioni dei tuoi clienti, registri gli incassi e vedi la classifica.',
    ],
  }
  const after: Block = {
    rows: [
      `Il link vale fino al ${formatExpiry(data.expiresAt)}. Se scade, chiedici un nuovo invito.`,
      'Poi per entrare userai questa email e la password che hai scelto.',
      'A presto, Le Quote',
    ],
  }
  const text = toText([intro, { rows: ['Scegli la tua password da qui:', data.inviteUrl] }, after])
  const link = `<p style="margin:0 0 20px"><a href="${escapeHtml(data.inviteUrl)}" style="color:#8f5a28;font-weight:bold">Scegli la tua password</a></p>`
  // Nell'HTML il link diventa un pulsante testuale, subito dopo il saluto.
  const html = toHtml([intro, after]).replace('</div>', `</div>${link}`)
  return { subject: SUBJECT, text, html }
}
