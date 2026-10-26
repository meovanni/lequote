import type { CSSProperties } from 'react'
import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath } from '@/i18n/locales'
import { valueRows } from '@/lib/analysisDisplay'
import { formatAnalysisValue, intensity, type LatestValues } from '@/lib/medusa/analyses'
import type { ProductPage } from '@/data/content/it'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './ProductDetail.module.css'

// Blocchi della scheda prodotto che vengono dai referti pubblicati nel back office: parametri
// chimici (l'acidità sempre accanto a perossidi e assorbimento UV), profilo organolettico del
// panel test e dichiarazione nutrizionale. Senza un referto restano i testi di riserva.

type Latest = LatestValues | null

function AnalysesLink() {
  const { productUi } = useContent()
  const locale = useLocale()
  return (
    <a href={localizePath(locale, '/analisi')} className={`${styles.inlineLink} body-sm`}>
      {productUi.analysesLink}
    </a>
  )
}

export function ChemistryBlock({ latest }: { latest: Latest }) {
  const { productUi, analysisUi } = useContent()
  const locale = useLocale()
  const rows = latest ? valueRows([...latest.byKey.values()], 'chimica', locale, analysisUi) : []

  return (
    <Reveal offset={6} className={styles.profile}>
      <h2 className={`${styles.asideTitle} mono-label`}>{productUi.analysisTitle}</h2>
      {rows.length > 0 && (
        <table className={styles.nutrition}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row" className="body-sm">
                  {row.label}
                </th>
                <td className="body-sm">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className={`${styles.note} body-sm`}>
        {latest && rows.length > 0 ? productUi.analysisCampaign(latest.campaign) : productUi.analysisPending}
      </p>
      <AnalysesLink />
    </Reveal>
  )
}

const PANEL = ['fruttato', 'amaro', 'piccante'] as const

export function OrganolepticProfile({ latest }: { latest: Latest }) {
  const { productUi, analysisUi } = useContent()
  const locale = useLocale()
  const bars = PANEL.flatMap((key) => {
    const value = latest?.byKey.get(key)
    const level = intensity(value?.value)
    return value && level !== null ? [{ key, label: analysisUi.valueLabels[key], value: formatAnalysisValue(locale, value.value), level }] : []
  })
  const notes = latest?.byKey.get('descrittori')?.value
  const defects = latest?.byKey.get('difetti')?.value

  return (
    <Reveal offset={8} className={styles.profile}>
      <h2 className={`${styles.asideTitle} mono-label`}>{productUi.profileTitle}</h2>
      {bars.length === 0 && !notes ? (
        <p className={`${styles.note} body-sm`}>{productUi.profilePending}</p>
      ) : (
        <>
          {notes && <p className="body">{notes}</p>}
          {bars.length > 0 && (
            <dl className={styles.panel}>
              {bars.map((bar) => (
                <div key={bar.key} className={styles.panelRow}>
                  <dt className="body-sm">{bar.label}</dt>
                  <dd className={styles.panelValue}>
                    <span className={styles.panelTrack} aria-hidden="true">
                      <span className={styles.panelBar} style={{ '--level': bar.level } as CSSProperties} />
                    </span>
                    <span className="body-sm">{bar.value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {defects !== undefined && Number(defects) === 0 && <p className={`${styles.note} body-sm`}>{productUi.defectsNone}</p>}
          <p className={`${styles.note} body-sm`}>{productUi.profileScale}</p>
        </>
      )}
    </Reveal>
  )
}

export function NutritionTable({ latest, fallback }: { latest: Latest; fallback: ProductPage['nutrition'] }) {
  const { productUi, analysisUi } = useContent()
  const locale = useLocale()
  const fromAnalysis = latest ? valueRows([...latest.byKey.values()], 'nutrizionale', locale, analysisUi) : []
  const per = fromAnalysis.length > 0 && latest ? productUi.nutritionPer(latest.nutritionBasis) : fallback?.per
  const rows = fromAnalysis.length > 0 ? fromAnalysis.map(({ label, value }) => ({ label, value })) : (fallback?.rows ?? [])
  if (rows.length === 0) return null

  return (
    <Reveal offset={8}>
      <table className={styles.nutrition}>
        <caption className={`${styles.caption} mono-label`}>{productUi.nutritionTitle}</caption>
        <thead>
          <tr>
            <th scope="col" className="body-sm">
              {productUi.nutritionNutrient}
            </th>
            <th scope="col" className="body-sm">
              {per}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="body-sm">
                {row.label}
              </th>
              <td className="body-sm">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  )
}
