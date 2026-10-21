import crypto from 'crypto'

// Carrelli costruiti dal server per gli ordini del gestionale (prenotazioni degli agenti, nuovi
// ordini dal back office): una firma HMAC sull'id del carrello, con un segreto che il browser non
// conosce, distingue questi carrelli da quelli della vetrina, i cui metadati il cliente può
// scrivere a piacere.

export function signBackofficeCart(cartId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`backoffice:${cartId}`).digest('hex')
}

export function verifyBackofficeCart(cartId: string, signature: unknown, secret: string): boolean {
  if (typeof signature !== 'string' || !/^[0-9a-f]{64}$/.test(signature)) return false
  const expected = Buffer.from(signBackofficeCart(cartId, secret), 'hex')
  return crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}

/** Segreto della firma: lo stesso dei cookie di sessione, già obbligatorio in configurazione. */
export function backofficeSecret(): string {
  const secret = process.env.COOKIE_SECRET
  if (!secret) throw new Error('COOKIE_SECRET non configurata.')
  return secret
}
