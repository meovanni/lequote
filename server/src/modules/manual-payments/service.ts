import crypto from 'crypto'
import { AbstractPaymentProvider, PaymentActions, PaymentSessionStatus } from '@medusajs/framework/utils'
import type {
  AuthorizePaymentOutput,
  CapturePaymentOutput,
  CancelPaymentOutput,
  DeletePaymentOutput,
  GetPaymentStatusOutput,
  InitiatePaymentOutput,
  RefundPaymentOutput,
  RetrievePaymentOutput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'

// Pagamenti senza intermediario: l'ordine nasce "autorizzato" e il titolare segna l'incasso dal
// back office (Cattura) quando il bonifico arriva o quando il cliente paga al ritiro. Due fornitori
// distinti invece di uno solo, così il metodo scelto si legge sul pagamento di ogni ordine.
abstract class ManualPaymentProvider extends AbstractPaymentProvider<Record<string, never>> {
  // Pubblico: il costruttore della classe base è protetto e il caricatore dei moduli istanzia le sottoclassi.
  constructor(cradle: Record<string, unknown>, options: Record<string, never>) {
    super(cradle, options)
  }

  async initiatePayment(): Promise<InitiatePaymentOutput> {
    return { id: crypto.randomUUID(), data: {} }
  }

  async authorizePayment(): Promise<AuthorizePaymentOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED, data: {} }
  }

  async getPaymentStatus(): Promise<GetPaymentStatusOutput> {
    return { status: PaymentSessionStatus.AUTHORIZED }
  }

  async retrievePayment(): Promise<RetrievePaymentOutput> {
    return { data: {} }
  }

  async updatePayment(): Promise<UpdatePaymentOutput> {
    return { data: {} }
  }

  async deletePayment(): Promise<DeletePaymentOutput> {
    return { data: {} }
  }

  async capturePayment(): Promise<CapturePaymentOutput> {
    return { data: {} }
  }

  async refundPayment(): Promise<RefundPaymentOutput> {
    return { data: {} }
  }

  async cancelPayment(): Promise<CancelPaymentOutput> {
    return { data: {} }
  }

  async getWebhookActionAndData(): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

/** Bonifico bancario: id `pp_bonifico_lequote`. */
export class BankTransferProvider extends ManualPaymentProvider {
  static identifier = 'bonifico'
}

/** Pagamento al ritiro in sede: id `pp_ritiro_lequote`. Solo con un'opzione di ritiro. */
export class PayAtPickupProvider extends ManualPaymentProvider {
  static identifier = 'ritiro'
}
