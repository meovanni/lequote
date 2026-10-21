import { expect, type Page } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Funzioni comuni ai test end-to-end: un cliente che ordina dal sito, le email salvate su file.

/** Indirizzo diverso a ogni test, così email e ordini non si confondono tra un giro e l'altro. */
export function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.test`
}

export interface Customer {
  firstName: string
  lastName: string
  email: string
  phone: string
}

/**
 * Apre una pagina e aspetta che React l'abbia agganciata. In sviluppo le pagine arrivano già
 * disegnate dal server: quanto si scrive o si preme prima dell'aggancio andrebbe perso.
 */
export async function open(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

/** Dalla scheda dell'olio fino alla pagina di conferma, con ritiro a Cerchio. Restituisce il numero d'ordine. */
export async function orderOilForPickup(page: Page, customer: Customer, payment: 'Bonifico bancario' | 'Al ritiro'): Promise<number> {
  await open(page, '/prodotti/olio-extravergine')
  await page.getByRole('radio', { name: 'Bottiglia 750 ml' }).check()
  await page.getByRole('button', { name: 'Aggiungi al carrello' }).click()
  await page.getByRole('link', { name: 'Vai al carrello' }).click()
  await expect(page).toHaveURL(/\/carrello$/)

  await page.getByLabel('Nome', { exact: true }).fill(customer.firstName)
  await page.getByLabel('Cognome').fill(customer.lastName)
  await page.getByLabel('Email').fill(customer.email)
  await page.getByLabel('Telefono').fill(customer.phone)
  await page.getByRole('radio', { name: /Ritiro a Cerchio/ }).check()
  await page.getByRole('radio', { name: new RegExp(payment) }).check()
  await page.getByRole('checkbox', { name: /Ho letto e accetto/ }).check()
  await page.getByRole('button', { name: 'Ordina con obbligo di pagamento' }).click()

  await expect(page).toHaveURL(/\/ordine\?id=/)
  await expect(page.getByRole('heading', { name: 'Ordine ricevuto' })).toBeVisible()
  const number = await page.getByText(/^Ordine n\. \d+$/).textContent()
  return Number(number?.replace(/\D/g, ''))
}

function mailDir(): string {
  const state = JSON.parse(readFileSync(join(import.meta.dirname, '.state', 'backend.json'), 'utf8')) as { mailDir: string }
  return state.mailDir
}

/** Il testo dell'email (.eml) con questo modello e questo destinatario, appena il server l'ha salvata. */
export async function waitForEmail(template: string, to: string): Promise<string> {
  const dir = mailDir()
  let found = ''
  await expect
    .poll(
      () => {
        if (!existsSync(dir)) return false
        const match = readdirSync(dir)
          .filter((name) => name.endsWith(`-${template}.eml`))
          .map((name) => readFileSync(join(dir, name), 'utf8'))
          .find((raw) => new RegExp(`^To: .*${to.replace(/[.+]/g, '\\$&')}`, 'mi').test(raw))
        found = match ?? ''
        return Boolean(match)
      },
      { message: `email "${template}" a ${to}`, timeout: 20_000 },
    )
    .toBe(true)
  return found
}
