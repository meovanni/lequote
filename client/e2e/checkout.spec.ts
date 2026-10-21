import { expect, test } from '@playwright/test'
import { open, orderOilForPickup, uniqueEmail, waitForEmail } from './support.ts'

// Checkout ospite dal sito: carrello, dati, consegna, pagamento, conferma ed email.

test('ordine con bonifico: coordinate in conferma ed email al cliente e ai titolari', async ({ page }) => {
  const email = uniqueEmail('bonifico')
  const number = await orderOilForPickup(page, { firstName: 'Anna', lastName: 'Di Marco', email, phone: '3330000000' }, 'Bonifico bancario')

  await expect(page.getByRole('heading', { name: 'Coordinate per il bonifico' })).toBeVisible()
  await expect(page.getByText(`Ordine ${number} Le Quote`)).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()

  const confirmation = await waitForEmail('order-confirmation', email)
  expect(confirmation).toMatch(new RegExp(`Subject: .*${number}`))
  await waitForEmail('order-alert', 'titolari@e2e.test')
})

test('ordine con pagamento al ritiro: istruzioni per il ritiro, niente bonifico', async ({ page }) => {
  const email = uniqueEmail('ritiro')
  await orderOilForPickup(page, { firstName: 'Marco', lastName: 'Ferri', email, phone: '3331112222' }, 'Al ritiro')

  await expect(page.getByRole('heading', { name: 'Pagamento al ritiro' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Coordinate per il bonifico' })).toHaveCount(0)
})

test('senza dati il checkout segnala i campi e non ordina', async ({ page }) => {
  await open(page, '/prodotti/miele')
  await page.getByRole('button', { name: 'Aggiungi al carrello' }).click()
  await page.getByRole('link', { name: 'Vai al carrello' }).click()

  await page.getByRole('button', { name: 'Ordina con obbligo di pagamento' }).click()
  await expect(page.getByText('Controlla i campi segnalati.')).toBeVisible()
  await expect(page.getByText('Per ordinare accetta le condizioni di vendita.')).toBeVisible()
  await expect(page).toHaveURL(/\/carrello$/)
})
