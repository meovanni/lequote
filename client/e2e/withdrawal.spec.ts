import { expect, test } from '@playwright/test'
import { open, orderOilForPickup, uniqueEmail, waitForEmail } from './support.ts'

// Funzione di recesso (art. 54-bis Cod. Consumo): "Recedere dal contratto qui", poi "Conferma
// recesso", ricevuta immediata per email con data e ora.

test('recesso dalla conferma d’ordine: numero già compilato e ricevuta per email', async ({ page }) => {
  const email = uniqueEmail('recesso')
  const number = await orderOilForPickup(page, { firstName: 'Lucia', lastName: 'Verdi', email, phone: '3332223333' }, 'Bonifico bancario')

  await page.getByRole('main').getByRole('link', { name: 'Recedere dal contratto qui' }).click()
  await expect(page).toHaveURL(new RegExp(`/recesso\\?ordine=${number}$`))
  await expect(page.getByLabel('Numero dell’ordine')).toHaveValue(String(number))
  // Il link ricarica la pagina: in sviluppo arriva già disegnata dal server, e quanto si scrive
  // prima che React la agganci andrebbe perso. Si aspetta che abbia finito di caricare.
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Nome e cognome').fill('Lucia Verdi')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByRole('button', { name: 'Conferma recesso' }).click()

  const done = page.getByRole('status').filter({ hasText: 'Recesso inviato' })
  await expect(done).toBeVisible()
  await expect(done).toContainText(email)
  // Data e ora di invio, come chiede l'art. 54-bis.
  await expect(done).toContainText(/\d{1,2}:\d{2}/)

  const receipt = await waitForEmail('withdrawal-receipt', email)
  expect(receipt).toContain(String(number))
  await waitForEmail('withdrawal-alert', 'titolari@e2e.test')
})

test('dal footer il modulo di recesso si apre subito e controlla i campi', async ({ page }) => {
  await open(page, '/')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Recedere dal contratto qui' }).click()
  await expect(page).toHaveURL(/\/recesso\?apri=1$/)
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Conferma recesso' }).click()
  await expect(page.getByText('Campo obbligatorio.').first()).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Recesso inviato' })).toHaveCount(0)
})
