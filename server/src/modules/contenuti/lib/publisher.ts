import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PublishedContent } from './drafts'

// "Pubblica": scrive le modifiche nella vetrina (client/src/data/published/published.generated.json)
// e, se è impostato STOREFRONT_BUILD_COMMAND, rigenera le pagine statiche (ADR 0003). In sviluppo
// basta il file: il server di Vite lo rilegge da solo. Se la generazione fallisce si rimette il
// file di prima, così il prossimo tentativo riparte dallo stato online.

export type PublisherConfig = {
  /** Cartella della vetrina (client/). */
  dir: string
  /** Comando che rigenera le pagine statiche, lanciato nella cartella della vetrina. */
  command?: string
  timeoutMs: number
}

export const PUBLISHED_FILE = join('src', 'data', 'published', 'published.generated.json')

export function publisherConfig(env: NodeJS.ProcessEnv = process.env): PublisherConfig {
  return {
    dir: env.STOREFRONT_DIR || join(process.cwd(), '..', 'client'),
    command: env.STOREFRONT_BUILD_COMMAND || undefined,
    timeoutMs: Number(env.STOREFRONT_BUILD_TIMEOUT_MS) || 10 * 60 * 1000,
  }
}

const tail = (text: string, size = 1500) => (text.length > size ? `…${text.slice(-size)}` : text)

function run(command: string, cwd: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { cwd, shell: true, env: process.env })
    let output = ''
    const collect = (chunk: Buffer) => {
      output = tail(output + chunk.toString(), 20_000)
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    const timer = setTimeout(() => child.kill(), timeoutMs)
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(new Error(`Non riesco ad avviare la generazione del sito: ${error.message}`))
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve()
      else reject(new Error(`La generazione del sito non è riuscita (codice ${code ?? 'interrotto'}).\n${tail(output)}`))
    })
  })
}

export async function publishToStorefront(content: PublishedContent, config: PublisherConfig): Promise<void> {
  if (!existsSync(join(config.dir, 'package.json'))) {
    throw new Error(`Cartella della vetrina non trovata (${config.dir}): impostala in STOREFRONT_DIR.`)
  }
  const file = join(config.dir, PUBLISHED_FILE)
  const previous = existsSync(file) ? await readFile(file, 'utf8') : null
  await writeFile(file, `${JSON.stringify(content, null, 2)}\n`)
  if (!config.command) return

  try {
    await run(config.command, config.dir, config.timeoutMs)
  } catch (error) {
    if (previous === null) await rm(file, { force: true })
    else await writeFile(file, previous)
    throw error
  }
}
