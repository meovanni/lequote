// Handle dei prodotti nel catalogo Medusa (server/src/scripts/seed.ts) che hanno una scheda.
// Elenco senza dipendenze: lo legge anche la configurazione del build per il prerender.
export const PRODUCT_HANDLES = ['olio-extravergine', 'miele'] as const
export type ProductHandle = (typeof PRODUCT_HANDLES)[number]
