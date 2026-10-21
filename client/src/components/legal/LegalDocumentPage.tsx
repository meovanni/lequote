import { useLocale } from '@/i18n/LocaleContext'
import { formatIsoDate } from '@/lib/date'
import { LEGAL_UPDATED, legalByLocale, type LegalBlock, type LegalPage } from '@/data/legal'
import styles from './LegalDocumentPage.module.css'

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p className="body">{block}</p>
  return (
    <ul className={styles.list}>
      {block.list.map((item) => (
        <li key={item} className="body">
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Condizioni di vendita, recesso, privacy e cookie: testo con indice e fonti per sezione. */
export function LegalDocumentPage({ page }: { page: LegalPage }) {
  const locale = useLocale()
  const { ui, documents } = legalByLocale[locale]
  const document = documents[page]

  return (
    <article className={styles.page} data-surface="light">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={`${styles.notice} body-sm`} role="note">
            {ui.draftNotice}
            {ui.translationNotice && ` ${ui.translationNotice}`}
          </p>
          <h1 className="display-2">{document.title}</h1>
          <p className={`${styles.muted} specimen`}>{ui.updated(formatIsoDate(locale, LEGAL_UPDATED))}</p>
          {document.intro && <p className="body-lead">{document.intro}</p>}
        </header>

        <nav aria-label={ui.tocLabel} className={styles.toc}>
          <p className={`${styles.muted} mono-label`}>{ui.tocLabel}</p>
          <ol>
            {document.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="body-sm">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="display-3">
              {section.heading}
            </h2>
            {section.body.map((block, index) => (
              <Block key={index} block={block} />
            ))}
            {section.sources && (
              <p className={`${styles.sources} specimen`}>
                {ui.sourcesLabel}: {section.sources.join('; ')}
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
