import { expect, test } from '@playwright/test'
import { open } from './support.ts'

// Il QR in etichetta porta a /lotto/:codice; il lotto di prova L2025-01 lo crea il back end dei test.

test('la pagina del lotto mostra prodotto, codice e campagna', async ({ page }) => {
  await open(page, '/lotto/L2025-01')
  await expect(page.getByRole('heading', { level: 1, name: 'Olio extravergine di oliva' })).toBeVisible()
  await expect(page.getByText('L2025-01', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Campagna 2025/26')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Il percorso' })).toBeVisible()
})

test('un codice inesistente dice che il lotto non c’è', async ({ page }) => {
  await open(page, '/lotto/L1999-99')
  await expect(page.getByRole('heading', { level: 1, name: 'Lotto non trovato' })).toBeVisible()
  await expect(page.getByText(/nessun lotto pubblicato con codice L1999-99/)).toBeVisible()
})

test('la ricerca nella sezione Filiera porta alla pagina del lotto', async ({ page }) => {
  await open(page, '/')
  await page.getByLabel(/Inserisci il codice lotto/).fill('l2025-01')
  await page.getByRole('button', { name: 'Cerca il lotto' }).click()
  await expect(page).toHaveURL(/\/lotto\/L2025-01$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Olio extravergine di oliva' })).toBeVisible()
})
