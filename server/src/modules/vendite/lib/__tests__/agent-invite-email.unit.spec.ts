import { renderAgentInvite } from '../agent-invite-email'

describe('renderAgentInvite', () => {
  const email = renderAgentInvite({
    agentName: 'Luciana',
    inviteUrl: 'https://lequote.test/app/invite?token=abc&x=<1>',
    expiresAt: new Date('2026-10-23T08:30:00Z'),
  })

  it('saluta l’agente e porta il link d’invito, nel testo e nell’HTML', () => {
    expect(email.subject).toBe('Le Quote: il tuo accesso all’area vendita')
    expect(email.text).toContain('Ciao Luciana,')
    expect(email.text).toContain('https://lequote.test/app/invite?token=abc&x=<1>')
    expect(email.html).toContain('href="https://lequote.test/app/invite?token=abc&amp;x=&lt;1&gt;"')
  })

  it('dice fino a quando vale il link, in ora italiana', () => {
    expect(email.text).toContain('23 ottobre 2026, 10:30')
  })
})
