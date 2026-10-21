import { BANK_TRANSFER_DAYS, SELLER } from '@/data/business'
import type { LegalContent } from './types'

// Deutsche Übersetzung von it.ts, Abschnitt für Abschnitt. Rechtsverweise bleiben wie veröffentlicht.

const seller = `${SELLER.name}, ${SELLER.address}, USt-IdNr. ${SELLER.vat}`
const contacts = `E-Mail ${SELLER.email}, zertifizierte E-Mail (PEC) ${SELLER.pec}, Telefon ${SELLER.phone}`

export const legalDe: LegalContent = {
  ui: {
    draftNotice:
      'Entwurf, der noch von der Rechtsberatung des Hofes geprüft wird. Angaben in eckigen Klammern liegen noch nicht vor.',
    translationNotice: 'Übersetzung zur besseren Verständlichkeit: Der Vertrag wird auf Italienisch geschlossen, maßgeblich ist der italienische Text.',
    updated: (date) => `Zuletzt aktualisiert: ${date}`,
    sourcesLabel: 'Rechtsgrundlagen',
    tocLabel: 'Auf dieser Seite',
    footerNavLabel: 'Rechtliche Informationen',
    linkLabels: {
      'condizioni-di-vendita': 'Verkaufsbedingungen',
      recesso: 'Widerruf',
      privacy: 'Datenschutz',
      cookie: 'Cookies',
    },
  },

  documents: {
    'condizioni-di-vendita': {
      title: 'Verkaufsbedingungen',
      metaDescription: 'Allgemeine Bedingungen für den Online-Verkauf von nativem Olivenöl extra und Honig von Le Quote.',
      intro:
        'Diese Bedingungen gelten für Käufe, die Verbraucher auf dieser Website tätigen, also Personen, die zu Zwecken außerhalb einer gewerblichen oder beruflichen Tätigkeit kaufen.',
      sections: [
        {
          id: 'venditore',
          heading: 'Verkäufer',
          body: [`Verkäufer ist ${seller}. Kontakt: ${contacts}.`],
          sources: ['D.Lgs. 206/2005 (Codice del Consumo), art. 49 c.1 lett. b-c', 'D.Lgs. 70/2003, art. 7'],
        },
        {
          id: 'prodotti-prezzi',
          heading: 'Produkte und Preise',
          body: [
            'Jede Produktseite nennt die wesentlichen Eigenschaften und die Pflichtangaben zu Lebensmitteln, die vor dem Kauf im Bereich „Pflichtangaben“ abrufbar sind.',
            'Die Preise verstehen sich in Euro inklusive Mehrwertsteuer. Eventuelle Lieferkosten werden im Warenkorb vor der Bestätigung der Bestellung angezeigt; die Abholung auf dem Hof ist kostenlos.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. a, e', 'Reg. (UE) 1169/2011, art. 14'],
        },
        {
          id: 'ordine',
          heading: 'Wie der Vertrag zustande kommt',
          body: [
            'Nach der Auswahl der Produkte geben Sie im Warenkorb Ihre Daten, die Lieferart und die Zahlungsart an, akzeptieren diese Bedingungen und bestätigen mit der Schaltfläche „Zahlungspflichtig bestellen“.',
            'Der Vertrag kommt zustande, wenn Sie unsere Bestätigungs-E-Mail erhalten, die die Bestellung zusammenfasst und diese Bedingungen oder einen Link darauf enthält. Vertragssprache ist Italienisch; die Übersetzungen der Website dienen dem Verständnis.',
            'Ist ein Produkt nach der Bestellung nicht verfügbar, informieren wir Sie und erstatten bereits gezahlte Beträge unverzüglich.',
          ],
          sources: ['Codice del Consumo, artt. 51 c.2 e 7, 61 c.5', 'D.Lgs. 70/2003, artt. 12-13'],
        },
        {
          id: 'pagamento',
          heading: 'Zahlung',
          body: [
            'Sie können auf zwei Arten bezahlen:',
            {
              list: [
                `Banküberweisung im Voraus: Die Bankverbindung steht auf der Bestätigungsseite und in der Bestell-E-Mail. Wir bereiten die Bestellung vor, sobald die Überweisung eingegangen ist; geht sie nicht innerhalb von ${BANK_TRANSFER_DAYS} Tagen nach der Bestellung ein, wird die Bestellung storniert und wir informieren Sie.`,
                'Zahlung bei Abholung, nur wenn Sie die Abholung auf dem Hof wählen: Sie bezahlen bei der Abholung mit den im Warenkorb genannten Zahlungsmitteln.',
              ],
            },
            'Wir erheben und speichern keine Zahlungskartendaten.',
          ],
          sources: ['Codice del Consumo, art. 49 c.1 lett. g'],
        },
        {
          id: 'consegna',
          heading: 'Lieferung und Abholung',
          body: [
            'Wir liefern nur innerhalb Italiens. Die verfügbaren Optionen (Abholung auf unseren Höfen, Versand) und ihre Kosten sind die im Warenkorb angezeigten.',
            'Bei Abholung schreiben wir Ihnen, sobald die Bestellung bereit ist, mit Öffnungszeiten und Adresse. Beim Versand liefern wir innerhalb von 30 Tagen nach der Bestellung, sofern beim Kauf keine andere Frist angegeben ist.',
            'Die Gefahr des Verlusts oder der Beschädigung geht auf Sie über, wenn Sie die Produkte erhalten oder abholen.',
          ],
          sources: ['Codice del Consumo, artt. 61 e 63'],
        },
        {
          id: 'recesso',
          heading: 'Widerrufsrecht',
          body: [
            'Sie können den Vertrag binnen 14 Tagen ohne Angabe von Gründen widerrufen, ab dem Tag, an dem Sie die Produkte erhalten oder abholen. Das Widerrufsrecht gilt nicht für versiegelte Packungen, die Sie nach der Lieferung geöffnet haben, da sie aus Gründen des Gesundheitsschutzes und der Hygiene nicht weiterverkauft werden können.',
            'Fristen, Form, Rücksendekosten und Erstattung beschreibt die Seite Widerruf, die auch das Muster-Widerrufsformular enthält.',
          ],
          sources: ['Codice del Consumo, artt. 49 c.1 lett. h, 52, 59 c.1 lett. e'],
        },
        {
          id: 'garanzia',
          heading: 'Gesetzliche Gewährleistung',
          body: [
            'Wir haften für jede Vertragswidrigkeit der Produkte, die innerhalb von zwei Jahren nach der Lieferung offenbar wird. Bei Lebensmitteln gilt zudem das Mindesthaltbarkeitsdatum auf dem Etikett, sofern das Produkt wie angegeben gelagert wurde.',
            `Bei einem Mangel schreiben Sie uns an ${SELLER.email}: Je nach Fall ersetzen wir das Produkt, mindern den Preis oder erstatten ihn, ohne Kosten für Sie.`,
          ],
          sources: ['Codice del Consumo, artt. 128 e seguenti'],
        },
        {
          id: 'reclami',
          heading: 'Beschwerden und Streitbeilegung',
          body: [
            `Beschwerden richten Sie an ${SELLER.email} oder per zertifizierter E-Mail an ${SELLER.pec}: Wir antworten innerhalb von [10, noch zu bestätigen] Werktagen.`,
            'Sie können sich auch an eine Stelle zur alternativen Streitbeilegung (AS) wenden, die in den Verzeichnissen nach dem italienischen Verbrauchergesetzbuch geführt wird. Die europäische OS-Plattform wurde am 20. Juli 2025 eingestellt.',
          ],
          sources: ['Codice del Consumo, artt. 141 e seguenti', 'Reg. (UE) 2024/3228'],
        },
        {
          id: 'legge-foro',
          heading: 'Anwendbares Recht und Gerichtsstand',
          body: [
            'Für den Vertrag gilt italienisches Recht; zwingende, für Sie günstigere Vorschriften des Staates, in dem Sie wohnen, bleiben unberührt. Zuständig ist das Gericht Ihres Wohn- oder Aufenthaltsortes.',
          ],
          sources: ['Reg. (CE) 593/2008 (Roma I), art. 6', 'Codice del Consumo, art. 66-bis'],
        },
      ],
    },

    recesso: {
      title: 'Widerrufsrecht',
      metaDescription: 'So widerrufen Sie einen Kauf bei Le Quote: Frist, Musterformular, Rücksendung und Erstattung.',
      sections: [
        {
          id: 'termine',
          heading: 'Frist',
          body: [
            'Sie können binnen 14 Tagen ab dem Tag widerrufen, an dem Sie oder eine von Ihnen benannte Person, die nicht der Beförderer ist, die Produkte erhalten oder abholen. Kommt die Bestellung in mehreren Lieferungen, beginnt die Frist mit der letzten.',
          ],
          sources: ['Codice del Consumo, art. 52 c.1 e c.2 lett. b'],
        },
        {
          id: 'esclusioni',
          heading: 'Wann kein Widerrufsrecht besteht',
          body: [
            'Öl und Honig werden in versiegelten Packungen verkauft. Eine nach der Lieferung geöffnete Packung kann aus Gründen des Gesundheitsschutzes und der Hygiene nicht zurückgegeben werden. Für die ungeöffneten Packungen derselben Bestellung können Sie dennoch widerrufen.',
          ],
          sources: ['Codice del Consumo, art. 59 c.1 lett. e'],
        },
        {
          id: 'come',
          heading: 'Wie Sie uns informieren',
          body: [
            `Senden Sie uns vor Ablauf der Frist eine eindeutige Erklärung: per E-Mail an ${SELLER.email}, per zertifizierter E-Mail an ${SELLER.pec} oder per Brief an ${SELLER.address}. Sie können das Musterformular unten verwenden, müssen es aber nicht. Wir bestätigen den Eingang unverzüglich.`,
            'Es genügt, dass Ihre Erklärung innerhalb der 14 Tage abgesendet wird.',
          ],
          sources: ['Codice del Consumo, art. 54'],
        },
        {
          id: 'restituzione',
          heading: 'Rücksendung der Produkte',
          body: [
            'Senden Sie die Produkte binnen 14 Tagen nach Ihrer Widerrufserklärung zurück oder bringen Sie sie auf einen unserer Höfe. Die unmittelbaren Kosten der Rücksendung tragen Sie.',
            'Sie haften nur für einen Wertverlust, der auf einen Umgang mit den Produkten zurückgeht, der zur Prüfung ihrer Beschaffenheit und Eigenschaften nicht notwendig war.',
          ],
          sources: ['Codice del Consumo, artt. 57 c.1-2'],
        },
        {
          id: 'rimborso',
          heading: 'Erstattung',
          body: [
            'Wir erstatten alle Zahlungen einschließlich der Standardlieferkosten binnen 14 Tagen ab dem Tag, an dem Ihr Widerruf bei uns eingeht. Wir können die Erstattung verweigern, bis wir die Produkte zurückerhalten haben oder Sie den Nachweis der Rücksendung erbracht haben.',
            'Wir erstatten mit demselben Zahlungsmittel, das Sie verwendet haben. Haben Sie bei Abholung bar bezahlt, erstatten wir per Überweisung auf das von Ihnen genannte Konto, ohne Kosten für Sie.',
          ],
          sources: ['Codice del Consumo, art. 56'],
        },
        {
          id: 'modulo',
          heading: 'Muster-Widerrufsformular',
          body: [
            'Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.',
            {
              list: [
                `An: ${seller}, ${SELLER.email}, PEC ${SELLER.pec}.`,
                'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren: …',
                'Bestellt am (*) / erhalten am (*): …',
                'Bestellnummer: …',
                'Name des/der Verbraucher(s): …',
                'Anschrift des/der Verbraucher(s): …',
                'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): …',
                'Datum: …',
              ],
            },
            '(*) Unzutreffendes streichen.',
          ],
          sources: ['Codice del Consumo, Allegato I, parte B'],
        },
      ],
    },

    privacy: {
      title: 'Datenschutzerklärung',
      metaDescription: 'Wie Le Quote die personenbezogenen Daten von Besuchern und Kunden verarbeitet.',
      intro: 'Wir verarbeiten nur die Daten, die wir für Bestellungen und zur Beantwortung Ihrer Nachrichten brauchen. Kein Marketing, kein Profiling.',
      sections: [
        {
          id: 'titolare',
          heading: 'Verantwortlicher',
          body: [`${seller}. Für Anfragen zu Ihren Daten: ${SELLER.email}.`],
          sources: ['Reg. (UE) 2016/679 (GDPR), art. 13 c.1 lett. a'],
        },
        {
          id: 'dati-finalita',
          heading: 'Welche Daten, wofür und auf welcher Grundlage',
          body: [
            {
              list: [
                'Bestellungen: Name, E-Mail, Telefon, Lieferadresse bei Versand, Produkte und Beträge. Sie dienen dem Abschluss und der Erfüllung des Vertrags und der Kontaktaufnahme zu Lieferung oder Abholung (Grundlage: Vertragserfüllung).',
                'Steuer- und Buchführungspflichten: die Bestell- und Zahlungsdaten, die wir von Gesetzes wegen erfassen und aufbewahren müssen (Grundlage: rechtliche Verpflichtung).',
                'Nachrichten: Wenn Sie uns schreiben, nutzen wir Ihre Angaben für die Antwort (Grundlage: von Ihnen angefragte Maßnahmen oder unser berechtigtes Interesse an einer Antwort).',
                'Sicherheit: Der Server protokolliert technische Daten der Anfragen, etwa die IP-Adresse, um die Website vor Missbrauch zu schützen (Grundlage: berechtigtes Interesse an Sicherheit).',
              ],
            },
            'Die Bestelldaten sind erforderlich: Ohne sie können wir die Bestellung nicht annehmen. Die Chargensuche und das Surfen auf der Website erfordern keine personenbezogenen Daten.',
          ],
          sources: ['GDPR, art. 6 c.1 lett. b, c, f', 'GDPR, art. 13 c.1 lett. c-d, c.2 lett. e'],
        },
        {
          id: 'destinatari',
          heading: 'Wer die Daten erhält',
          body: [
            'Die Daten verarbeiten wir selbst und, in unserem Auftrag und vertraglich gebunden:',
            {
              list: [
                'der Anbieter des Servers für Website und Verwaltung: [wird nach der Auswahl genannt, Phase 4];',
                'der Anbieter des Postfachs, von dem wir die Bestell-E-Mails senden: [wird genannt];',
                'unser Steuerberater, für die steuerlichen Pflichten;',
                'der Paketdienst, nur bei Versandbestellungen: [wird genannt, sobald der Versand aktiv ist].',
              ],
            },
            'Die Bank erhält die Daten Ihrer Überweisung. Wir verkaufen die Daten nicht und geben sie nicht zu anderen Zwecken an Dritte weiter.',
          ],
          sources: ['GDPR, artt. 13 c.1 lett. e, 28'],
        },
        {
          id: 'trasferimenti',
          heading: 'Wo die Daten liegen',
          body: ['Website und Verwaltung laufen auf einem Server in der Europäischen Union [wird mit der Wahl des Hostings bestätigt]. Wir übermitteln keine Daten außerhalb des Europäischen Wirtschaftsraums.'],
          sources: ['GDPR, art. 13 c.1 lett. f'],
        },
        {
          id: 'conservazione',
          heading: 'Wie lange',
          body: [
            {
              list: [
                'Bestelldaten und Buchungsbelege: 10 Jahre, wie gesetzlich vorgeschrieben.',
                'Warenkörbe ohne Bestellung: 5 Tage nach der letzten Änderung, danach gelöscht.',
                'Nachrichten: so lange wie zur Bearbeitung nötig, danach höchstens [12 Monate, noch zu bestätigen].',
                'Technische Serverprotokolle: [14 Tage, noch zu bestätigen].',
              ],
            },
          ],
          sources: ['GDPR, art. 13 c.2 lett. a', 'Codice civile, art. 2220'],
        },
        {
          id: 'diritti',
          heading: 'Ihre Rechte',
          body: [
            `Sie können jederzeit Auskunft über Ihre Daten, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen sowie Verarbeitungen auf Grundlage berechtigter Interessen widersprechen, per E-Mail an ${SELLER.email}. Wir antworten innerhalb eines Monats.`,
            'Wenn Sie meinen, dass die Verarbeitung gegen das Recht verstößt, können Sie Beschwerde bei der italienischen Datenschutzbehörde einlegen, dem Garante per la protezione dei dati personali (www.garanteprivacy.it).',
            'Wir treffen keine ausschließlich automatisierten Entscheidungen.',
          ],
          sources: ['GDPR, artt. 12, 15-22, 77'],
        },
      ],
    },

    cookie: {
      title: 'Cookies und Browser-Speicher',
      metaDescription: 'Was die Website von Le Quote in Ihrem Browser speichert: nur technische Daten, kein Profiling.',
      intro: 'Die Website verwendet keine Profiling-Cookies und keine Statistikwerkzeuge und lädt keine Inhalte von anderen Websites. Deshalb bitten wir Sie um keine Einwilligung.',
      sections: [
        {
          id: 'tecnici',
          heading: 'Was wir im Browser speichern',
          body: [
            {
              list: [
                '„lequote.cart“ (lokaler Speicher des Browsers): die Nummer Ihres Warenkorbs, damit Sie Ihre Produkte beim nächsten Besuch wiederfinden. Sie enthält keine personenbezogenen Daten und wird nach der Bestellung gelöscht; Sie können sie auch in den Browsereinstellungen entfernen.',
                'Interner Bereich: nur für die Betreiber des Shops hält ein Sitzungscookie die Anmeldung in der Verwaltung aufrecht und wird beim Abmelden gelöscht.',
              ],
            },
            'Es handelt sich um technische Mittel, die für den von Ihnen gewünschten Dienst nötig sind: Sie erfordern von Gesetzes wegen keine Einwilligung.',
          ],
          sources: [
            'D.Lgs. 196/2003 (Codice privacy), art. 122 c.1',
            'Garante privacy, Linee guida cookie e altri strumenti di tracciamento, 10 giugno 2021',
          ],
        },
        {
          id: 'terze-parti',
          heading: 'Inhalte Dritter',
          body: [
            'Schriften, Bilder und Videos kommen von unserem eigenen Server: Beim Besuch der Website gehen keine Daten an Google, soziale Netzwerke oder andere Anbieter. Sollten wir künftig Werkzeuge Dritter einbinden, aktualisieren wir diese Seite und holen, wo nötig, vorher Ihre Einwilligung ein.',
          ],
        },
      ],
    },
  },
}
