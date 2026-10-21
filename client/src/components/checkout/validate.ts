import type { PaymentMethod, ShippingChoice } from '@/lib/medusa/cart'

export interface CheckoutValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  province: string
  deliveryId: string | null
  payment: PaymentMethod | null
  terms: boolean
}

export type CheckoutErrorCode = 'required' | 'email' | 'postalCode' | 'province' | 'delivery' | 'payment' | 'terms'

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, CheckoutErrorCode>>

export const EMPTY_CHECKOUT: CheckoutValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  province: '',
  deliveryId: null,
  payment: null,
  terms: false,
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTAL_CODE = /^\d{5}$/
const PROVINCE = /^[A-Za-z]{2}$/

/** Ordine dei campi nella pagina: il primo errore riceve il focus. */
export const FIELD_ORDER: (keyof CheckoutValues)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'deliveryId',
  'address',
  'postalCode',
  'city',
  'province',
  'payment',
  'terms',
]

// Il pagamento al ritiro vale solo con un'opzione di ritiro; l'indirizzo serve solo per spedire.
export function validateCheckout(values: CheckoutValues, delivery: ShippingChoice | undefined): CheckoutErrors {
  const errors: CheckoutErrors = {}
  const blank = (value: string) => value.trim() === ''

  if (blank(values.firstName)) errors.firstName = 'required'
  if (blank(values.lastName)) errors.lastName = 'required'
  if (blank(values.email)) errors.email = 'required'
  else if (!EMAIL.test(values.email.trim())) errors.email = 'email'
  if (blank(values.phone)) errors.phone = 'required'

  if (!delivery) errors.deliveryId = 'delivery'
  if (delivery?.kind === 'delivery') {
    if (blank(values.address)) errors.address = 'required'
    if (blank(values.city)) errors.city = 'required'
    if (!POSTAL_CODE.test(values.postalCode.trim())) errors.postalCode = 'postalCode'
    if (!PROVINCE.test(values.province.trim())) errors.province = 'province'
  }

  if (!values.payment) errors.payment = 'payment'
  else if (values.payment === 'ritiro' && delivery?.kind !== 'pickup') errors.payment = 'payment'

  if (!values.terms) errors.terms = 'terms'
  return errors
}
