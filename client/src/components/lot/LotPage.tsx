import { useEffect, useState } from 'react'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath, sectionHref, type Locale } from '@/i18n/locales'
import { formatIsoDate, formatIsoMonth } from '@/lib/date'
import { parseLotCode } from '@/lib/lotCode'
import { retrievePublicLot, type PublicLot } from '@/lib/medusa/lot'
import { LegalPanel } from '@/components/common/LegalPanel/LegalPanel'
import { AnalysisBlock } from '@/components/analyses/AnalysisBlock'
import styles from './LotPage.module.css'

/** La raccolta dura settimane: se ne scrive il mese, non il giorno. */
const stageDate = (locale: Locale, stage: { name: string; date: string }) =>
  (/^raccolta/i.test(stage.name) ? formatIsoMonth : formatIsoDate)(locale, stage.date)

type LotState =
  | { status: 'loading' }
  | { status: 'ready'; lot: PublicLot }
  | { status: 'missing'; code: string }
  | { status: 'invalid' }
  | { status: 'error' }

/** Lo stato iniziale si decide dal solo indirizzo: un codice malformato non interroga Medusa. */
function initialState(rawCode: string): LotState {
  return parseLotCode(rawCode).ok ? { status: 'loading' } : { status: 'invalid' }
}

// /lotto/:codice: la pagina aperta dal QR in etichetta, quasi sempre su un telefono.
export function LotPage({ rawCode }: { rawCode: string }) {
  const { lotUi } = useContent()
  const locale = useLocale()
  const [state, setState] = useState<LotState>(() => initialState(rawCode))

  useEffect(() => {
    const parsed = parseLotCode(rawCode)
    if (!parsed.ok) {
      setState({ status: 'invalid' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    retrievePublicLot(parsed.code)
      .then((lot) => {
        if (!cancelled) setState(lot ? { status: 'ready', lot } : { status: 'missing', code: parsed.code })
      })
      .catch((reason: unknown) => {
        console.error(reason)
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [rawCode])

  // Aperta da un QR stampato prima di un cambio di codice: il titolo dice il codice attuale.
  const currentCode = state.status === 'ready' ? state.lot.code : null
  useEffect(() => {
    if (currentCode) document.title = lotUi.metaTitle(currentCode)
  }, [currentCode, lotUi])

  const links = (
    <div className={styles.links}>
      <a href={sectionHref(locale, 'filiera')} className="btn btn-ghost mono-label">
        {lotUi.searchAgain}
      </a>
      <a href={localizePath(locale, '/')} className="btn btn-ghost mono-label">
        {lotUi.backHome}
      </a>
    </div>
  )

  if (state.status !== 'ready') {
    const title = state.status === 'missing' || state.status === 'invalid' ? lotUi.notFoundTitle : lotUi.eyebrow
    const message = {
      loading: lotUi.loading,
      missing: state.status === 'missing' ? lotUi.notFoundBody(state.code) : '',
      invalid: lotUi.invalidBody,
      error: lotUi.error,
    }[state.status]
    return (
      <section className={styles.page} data-surface="light">
        <div className={styles.inner}>
          <h1 className="title-mark display-2">{title}</h1>
          <p className={`${styles.status} body`} role="status">
            {message}
          </p>
          {state.status !== 'loading' && links}
        </div>
      </section>
    )
  }

  const { lot } = state
  return (
    <section className={styles.page} data-surface="light" data-line={lot.productLine}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className="eyebrow">{lotUi.eyebrow}</p>
          <h1 className="display-2">{lotUi.lineName[lot.productLine]}</h1>
          <div className={styles.tags}>
            <span className="line-tag specimen-tag specimen">{lot.code}</span>
            {lot.campaign && <span className="line-tag specimen-tag specimen">{lotUi.campaign(lot.campaign)}</span>}
          </div>
          {lotUi.sourceNote && <p className={`${styles.status} body-sm`}>{lotUi.sourceNote}</p>}
        </header>

        <section className={styles.block} aria-labelledby="lot-stages">
          <h2 id="lot-stages" className="display-3">
            {lotUi.stagesTitle}
          </h2>
          {lot.stages.length === 0 ? (
            <p className={`${styles.status} body`}>{lotUi.noStages}</p>
          ) : (
            <ol className={styles.stages}>
              {lot.stages.map((stage, index) => (
                <li key={`${stage.name}-${index}`} className={styles.stage}>
                  <span className={`${styles.stageNumber} specimen-tag specimen`}>{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="display-3">{stage.name}</h3>
                  {(stage.date || stage.place) && (
                    <p className={`${styles.stageMeta} specimen`}>
                      {[stage.date && stageDate(locale, { name: stage.name, date: stage.date }), stage.place].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {stage.fields.length > 0 && (
                    <dl className={styles.fields}>
                      {stage.fields.map((field) => (
                        <div key={field.label} className={styles.field}>
                          <dt className="body-sm">{field.label}</dt>
                          <dd className="body">{formatIsoDate(locale, field.value)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {lot.analyses.length > 0 && (
          <section className={styles.block} aria-labelledby="lot-analyses">
            <h2 id="lot-analyses" className="display-3">
              {lotUi.analysesTitle}
            </h2>
            {/* Le analisi della campagna già espanse, con tutti i valori letti dal referto. */}
            {lot.analyses.map((analysis) => (
              <AnalysisBlock key={`${analysis.title}-${analysis.date ?? ''}`} analysis={analysis} />
            ))}
            <a href={localizePath(locale, '/analisi')} className={`${styles.inlineLink} body-sm`}>
              {lotUi.allAnalyses}
            </a>
          </section>
        )}

        {lot.legal.length > 0 && (
          <LegalPanel
            label={lotUi.legalLabel}
            items={lot.legal.map((item) => ({ label: item.label, value: formatIsoDate(locale, item.value) }))}
          />
        )}

        {links}
      </div>
    </section>
  )
}
