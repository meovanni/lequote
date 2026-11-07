// Dati dell'azienda usati dal checkout e dalle pagine legali. I valori tra parentesi quadre non
// sono ancora stati forniti dai titolari (docs/plan.md, "Dati mancanti dai titolari"): restano
// visibili come tali.
// Coordinate vuote finché i titolari non le inseriscono (Contenuti › Dati aziendali): intanto la
// conferma d'ordine dice che gli estremi arrivano dopo la conferma.
export const BANK_TRANSFER = {
  holder: '',
  iban: '',
}

/** Identità del venditore (Cod. Consumo art. 49 c.1 lett. b-c; D.Lgs. 70/2003 art. 7). */
export const SELLER = {
  name: 'Le Quote, Azienda Agricola [ragione sociale da fornire]',
  address: '[sede legale da fornire]',
  vat: '[P.IVA da fornire]',
  email: 'info@le-quote.it',
  pec: '[PEC da fornire]',
  phone: '[telefono da fornire]',
}

/** Termine per il bonifico, oltre il quale l'ordine si annulla (BANK_TRANSFER_DAYS sul server). */
export const BANK_TRANSFER_DAYS = '7'
