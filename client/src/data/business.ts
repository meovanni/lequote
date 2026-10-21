// Dati dell'azienda usati dal checkout e dalle pagine legali. I valori tra parentesi quadre non
// sono ancora stati forniti dai titolari (docs/plan.md, "Dati mancanti dai titolari"): restano
// visibili come tali.
export const BANK_TRANSFER = {
  holder: '[Intestatario del conto da fornire]',
  iban: '[IBAN da fornire]',
}

/** Identità del venditore (Cod. Consumo art. 49 c.1 lett. b-c; D.Lgs. 70/2003 art. 7). */
export const SELLER = {
  name: 'Le Quote, Azienda Agricola [ragione sociale da fornire]',
  address: '[sede legale da fornire]',
  vat: '[P.IVA da fornire]',
  email: 'info@lequote.it',
  pec: '[PEC da fornire]',
  phone: '[telefono da fornire]',
}

/** Termine per il bonifico, oltre il quale l'ordine si annulla. Da confermare con i titolari. */
export const BANK_TRANSFER_DAYS = '[7, da confermare]'
