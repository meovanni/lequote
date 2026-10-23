import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import nodemailer, { type Transporter } from 'nodemailer'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import type { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from '@medusajs/framework/types'

export interface SmtpOptions {
  /** Senza host (sviluppo) le email non partono: si salvano in previewDir come .eml e .html. */
  host?: string
  port?: number
  /** true per la porta 465 (TLS diretto); con 587 si usa STARTTLS. */
  secure?: boolean
  user?: string
  pass?: string
  /** Mittente, per esempio "Le Quote <info@le-quote.it>": le risposte arrivano lì. */
  from: string
  previewDir?: string
}

type Dependencies = { logger: Logger }

// Email tramite l'SMTP della casella già in uso (ADR 0004): nessun servizio in abbonamento.
// Il contenuto arriva già composto (subject, text, html) da src/lib/order-emails.ts.
export class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = 'smtp'

  private readonly logger: Logger
  private readonly options: SmtpOptions
  private readonly transporter: Transporter

  constructor({ logger }: Dependencies, options: SmtpOptions) {
    super()
    this.logger = logger
    this.options = options
    this.transporter = options.host
      ? nodemailer.createTransport({
          host: options.host,
          port: options.port ?? 587,
          secure: options.secure ?? false,
          auth: options.user ? { user: options.user, pass: options.pass } : undefined,
        })
      : nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' })
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'SMTP: manca il mittente (SMTP_FROM).')
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { subject, text, html } = notification.content ?? {}
    if (!subject || !(text || html)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMTP: email "${notification.template}" senza contenuto.`)
    }
    const replyTo = typeof notification.provider_data?.replyTo === 'string' ? notification.provider_data.replyTo : undefined
    const info = await this.transporter.sendMail({
      from: notification.from ?? this.options.from,
      to: notification.to,
      replyTo,
      subject,
      text,
      html,
    })

    if (!this.options.host) await this.savePreview(notification.template, info.message as Buffer, html)
    return { id: info.messageId }
  }

  private async savePreview(template: string, raw: Buffer, html: string | undefined) {
    const dir = this.options.previewDir ?? path.join(process.cwd(), '.mail')
    const name = `${new Date().toISOString().replace(/[:.]/g, '-')}-${template}`
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, `${name}.eml`), raw)
    if (html) await writeFile(path.join(dir, `${name}.html`), html)
    this.logger.info(`Email non inviata (SMTP_HOST assente): anteprima in ${path.join(dir, name)}.html`)
  }
}
