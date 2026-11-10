import PDFDocument from 'pdfkit'
import { documentLabel, formatDay, partyAddress } from './build'
import type { DdtData, DocumentRecord, InvoiceData, Party, Seller } from './types'

// PDF A4 di DDT e fatture, con i caratteri standard del PDF (niente file di font da portarsi dietro).

type Doc = InstanceType<typeof PDFDocument>

const MARGIN = 40
const WIDTH = 595.28 - 2 * MARGIN
const BOTTOM = 841.89 - MARGIN
const INK = '#1f2a37'
const MUTED = '#5b6574'
const RULE = '#c9ced6'

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const decimal = (digits: number) => new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: digits })
const quantity = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 3 })

const CARRIER_LABEL = { mittente: 'Mittente', destinatario: 'Destinatario', vettore: 'Vettore' } as const

function toBuffer(draw: (doc: Doc) => void, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, info: { Title: title, Author: 'Le Quote' }, bufferPages: true })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    draw(doc)
    pageNumbers(doc)
    doc.end()
  })
}

function pageNumbers(doc: Doc) {
  const range = doc.bufferedPageRange()
  if (range.count < 2) return
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index)
    doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(`Pagina ${index + 1} di ${range.count}`, MARGIN, BOTTOM + 12, { width: WIDTH, align: 'right', lineBreak: false })
  }
}

function label(doc: Doc, text: string, x: number, y: number, width: number) {
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(MUTED).text(text.toUpperCase(), x, y, { width, characterSpacing: 0.4 })
}

function body(doc: Doc, text: string, x: number, y: number, width: number, bold = false, size = 9) {
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor(INK).text(text, x, y, { width })
  return doc.y
}

/** Intestazione: il venditore a sinistra, tipo e numero del documento a destra. Restituisce la y sotto. */
function header(doc: Doc, seller: Seller, title: string, subtitle: string): number {
  const top = MARGIN
  body(doc, seller.name, MARGIN, top, WIDTH * 0.58, true, 11)
  const sellerLines = [
    seller.address,
    seller.vat ? `P.IVA ${seller.vat}` : '',
    [seller.email, seller.pec ? `PEC ${seller.pec}` : ''].filter(Boolean).join(' · '),
    seller.phone ? `Tel. ${seller.phone}` : '',
  ].filter(Boolean)
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(sellerLines.join('\n'), MARGIN, doc.y + 2, { width: WIDTH * 0.58 })
  const leftBottom = doc.y
  doc.font('Helvetica-Bold').fontSize(15).fillColor(INK).text(title, MARGIN + WIDTH * 0.6, top, { width: WIDTH * 0.4, align: 'right' })
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(subtitle, MARGIN + WIDTH * 0.6, doc.y + 2, { width: WIDTH * 0.4, align: 'right' })
  const y = Math.max(leftBottom, doc.y) + 14
  doc.moveTo(MARGIN, y).lineTo(MARGIN + WIDTH, y).lineWidth(0.8).strokeColor(INK).stroke()
  return y + 12
}

function partyLines(party: Party): string[] {
  return [
    partyAddress(party),
    party.vat ? `P.IVA ${party.vat}` : '',
    party.fiscalCode ? `Codice fiscale ${party.fiscalCode}` : '',
    party.sdiCode ? `Codice destinatario ${party.sdiCode}` : '',
    party.pec ? `PEC ${party.pec}` : '',
  ].filter(Boolean)
}

/** Un riquadro con titolo e righe; restituisce la y del fondo. */
function box(doc: Doc, title: string, name: string, lines: string[], x: number, y: number, width: number): number {
  label(doc, title, x + 8, y + 7, width - 16)
  let bottom = body(doc, name, x + 8, doc.y + 2, width - 16, true, 10)
  if (lines.length > 0) {
    doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(lines.join('\n'), x + 8, bottom + 1, { width: width - 16 })
    bottom = doc.y
  }
  return bottom + 7
}

function boxes(doc: Doc, y: number, items: { title: string; name: string; lines: string[] }[]): number {
  const gap = 10
  const width = (WIDTH - gap * (items.length - 1)) / items.length
  const bottoms = items.map((item, index) => box(doc, item.title, item.name, item.lines, MARGIN + index * (width + gap), y, width))
  const bottom = Math.max(...bottoms)
  items.forEach((_, index) => doc.rect(MARGIN + index * (width + gap), y, width, bottom - y).lineWidth(0.6).strokeColor(RULE).stroke())
  return bottom + 14
}

type Column = { title: string; width: number; align?: 'left' | 'right' }

/** Tabella delle righe, con l'intestazione ripetuta a ogni pagina nuova. */
function table(doc: Doc, y: number, columns: Column[], rows: string[][], reserve: number): number {
  const drawHead = (top: number) => {
    doc.rect(MARGIN, top, WIDTH, 16).fillColor('#eef0f3').fill()
    let x = MARGIN
    for (const column of columns) {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED).text(column.title.toUpperCase(), x + 4, top + 5, { width: column.width - 8, align: column.align ?? 'left', lineBreak: false })
      x += column.width
    }
    return top + 20
  }
  let top = drawHead(y)
  rows.forEach((row, rowIndex) => {
    doc.font('Helvetica').fontSize(8.5)
    const height = Math.max(...row.map((cell, index) => doc.heightOfString(cell, { width: columns[index].width - 8 }))) + 6
    const last = rowIndex === rows.length - 1
    if (top + height > BOTTOM - (last ? reserve : 0)) {
      doc.addPage()
      top = drawHead(MARGIN)
    }
    let x = MARGIN
    row.forEach((cell, index) => {
      doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(cell, x + 4, top, { width: columns[index].width - 8, align: columns[index].align ?? 'left' })
      x += columns[index].width
    })
    top += height
    doc.moveTo(MARGIN, top - 3).lineTo(MARGIN + WIDTH, top - 3).lineWidth(0.4).strokeColor(RULE).stroke()
  })
  return top + 8
}

function ensureSpace(doc: Doc, y: number, needed: number): number {
  if (y + needed <= BOTTOM) return y
  doc.addPage()
  return MARGIN
}

/** Coppie etichetta-valore su una griglia (quattro colonne di norma). */
function facts(doc: Doc, y: number, items: [string, string][], columns = 4): number {
  const width = WIDTH / columns
  let rowTop = y
  for (let start = 0; start < items.length; start += columns) {
    let rowBottom = rowTop
    items.slice(start, start + columns).forEach(([title, value], index) => {
      const x = MARGIN + index * width
      label(doc, title, x, rowTop, width - 8)
      rowBottom = Math.max(rowBottom, body(doc, value || '-', x, doc.y + 2, width - 8))
    })
    rowTop = rowBottom + 8
  }
  return rowTop
}

export function renderDdt(document: DocumentRecord<DdtData>): Promise<Buffer> {
  const data = document.data
  const title = documentLabel('ddt', document.number, document.year, document.issued_at)
  return toBuffer((doc) => {
    let y = header(doc, data.seller, 'Documento di trasporto', `n. ${document.number}/${document.year} del ${formatDay(document.issued_at)}`)
    if (document.status === 'canceled') y = canceledBanner(doc, y)
    y = boxes(doc, y, [
      { title: 'Destinatario', name: data.recipient.name, lines: partyLines(data.recipient) },
      { title: 'Luogo di destinazione', name: data.destination || 'Come destinatario', lines: [] },
    ])
    y = table(
      doc,
      y,
      [
        { title: 'Descrizione', width: WIDTH - 230 },
        { title: 'Lotto', width: 110 },
        { title: 'Quantità', width: 80, align: 'right' },
        { title: 'U.M.', width: 40 },
      ],
      data.lines.map((line) => [line.description, line.lot || '-', quantity.format(line.quantity), line.unit]),
      150,
    )
    y = ensureSpace(doc, y, 150)
    y = facts(doc, y, [
      ['Causale del trasporto', data.reason],
      ['Trasporto a cura del', data.carrier === 'vettore' && data.carrierName ? `Vettore: ${data.carrierName}` : CARRIER_LABEL[data.carrier]],
      ['Inizio del trasporto', new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome' }).format(new Date(data.transportStart))],
      ['Ordine', data.orderCodes.join(', ')],
      ['Numero colli', data.packages === null ? '' : String(data.packages)],
      ['Aspetto dei beni', data.appearance],
      ['Peso lordo', data.weightKg === null ? '' : `${decimal(1).format(data.weightKg)} kg`],
      ['Note', data.notes],
    ])
    y = ensureSpace(doc, y + 10, 60)
    const signature = (WIDTH - 20) / 3
    ;['Firma del mittente', 'Firma del vettore', 'Firma del destinatario'].forEach((text, index) => {
      const x = MARGIN + index * (signature + 10)
      doc.moveTo(x, y + 34).lineTo(x + signature, y + 34).lineWidth(0.6).strokeColor(INK).stroke()
      label(doc, text, x, y + 38, signature)
    })
  }, title)
}

function canceledBanner(doc: Doc, y: number): number {
  doc.rect(MARGIN, y, WIDTH, 20).fillColor('#fde8e8').fill()
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#9b1c1c').text('DOCUMENTO ANNULLATO', MARGIN, y + 6, { width: WIDTH, align: 'center' })
  return y + 30
}

const COURTESY_NOTE =
  'Copia di cortesia, priva di valore fiscale (art. 21 DPR 633/1972). La fattura elettronica è disponibile ' +
  'all’indirizzo telematico comunicato oppure nell’area riservata del sito dell’Agenzia delle Entrate.'

export function renderInvoice(document: DocumentRecord<InvoiceData>): Promise<Buffer> {
  const data = document.data
  const title = documentLabel('fattura', document.number, document.year, document.issued_at)
  return toBuffer((doc) => {
    const kind = data.ddtReferences.length > 0 ? 'Fattura differita' : 'Fattura'
    let y = header(doc, data.seller, kind, `n. ${document.number}/${document.year} del ${formatDay(document.issued_at)}`)
    if (document.status === 'canceled') y = canceledBanner(doc, y)
    y = boxes(doc, y, [{ title: 'Cliente', name: data.customer.name, lines: partyLines(data.customer) }])
    if (data.ddtReferences.length > 0) {
      doc.font('Helvetica').fontSize(8.5).fillColor(INK).text(`Merce consegnata con: ${data.ddtReferences.join('; ')}.`, MARGIN, y - 4, { width: WIDTH })
      y = doc.y + 10
    }
    y = table(
      doc,
      y,
      [
        { title: 'Descrizione', width: WIDTH - 285 },
        { title: 'Quantità', width: 60, align: 'right' },
        { title: 'Prezzo', width: 70, align: 'right' },
        { title: 'IVA', width: 40, align: 'right' },
        { title: 'Imponibile', width: 115, align: 'right' },
      ],
      data.lines.map((line) => [
        `${line.description}\n${line.reference}`,
        `${quantity.format(line.quantity)} ${line.unit}`,
        decimal(4).format(line.unitNet),
        `${quantity.format(line.vatRate)}%`,
        euro.format(line.net),
      ]),
      190,
    )
    y = ensureSpace(doc, y, 190)
    const summaryX = MARGIN + WIDTH - 260
    y = table(
      doc,
      y,
      [
        { title: 'Riepilogo IVA', width: WIDTH - 180 },
        { title: 'Imponibile', width: 90, align: 'right' },
        { title: 'Imposta', width: 90, align: 'right' },
      ],
      data.vatSummary.map((row) => [`IVA ${quantity.format(row.rate)}%`, euro.format(row.net), euro.format(row.vat)]),
      0,
    )
    const totals: [string, string, boolean][] = [
      ['Totale imponibile', euro.format(data.netTotal), false],
      ['Totale IVA', euro.format(data.vatTotal), false],
      ['Totale documento', euro.format(data.total), true],
      ...(data.paid > 0 ? ([['Già pagato', euro.format(data.paid), false], ['Da pagare', euro.format(data.due), true]] as [string, string, boolean][]) : []),
    ]
    for (const [text, value, strong] of totals) {
      doc.font(strong ? 'Helvetica-Bold' : 'Helvetica').fontSize(strong ? 10 : 9).fillColor(INK)
      doc.text(text, summaryX, y, { width: 160 })
      doc.text(value, summaryX + 160, y, { width: 100, align: 'right' })
      y = doc.y + 3
    }
    y += 8
    const payment: [string, string][] = [
      ['Pagamento', data.paymentMethod],
      ['Termini', data.paymentTerms],
      ...(data.seller.iban ? ([['IBAN', `${data.seller.iban}${data.seller.bankHolder ? ` (${data.seller.bankHolder})` : ''}`]] as [string, string][]) : []),
      ['Note', data.notes],
    ]
    y = facts(doc, ensureSpace(doc, y, 60), payment, 2)
    y = ensureSpace(doc, y + 6, 40)
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(MUTED).text(COURTESY_NOTE, MARGIN, y, { width: WIDTH })
  }, title)
}
