import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath, sectionHref } from '@/i18n/locales'
import { usePublicAnalyses } from '@/hooks/usePublicAnalyses'
import { valueRows } from '@/lib/analysisDisplay'
import { formatIsoDate } from '@/lib/date'
import type { CampaignAnalyses, PublicAnalysis, ValueGroup } from '@/lib/medusa/analyses'
import styles from './AnalysesPage.module.css'

const GROUPS: ValueGroup[] = ['chimica', 'organolettica', 'nutrizionale', 'altro']

function AnalysisBlock({ analysis }: { analysis: PublicAnalysis }) {
  const { analysisUi } = useContent()
  const locale = useLocale()
  const meta = [analysis.lab, analysis.date && formatIsoDate(locale, analysis.date)].filter(Boolean).join(' · ')

  return (
    <article className={styles.analysis}>
      <header className={styles.analysisHead}>
        <h3 className="display-3">{analysis.title}</h3>
        {meta && <p className={`${styles.meta} specimen`}>{meta}</p>}
      </header>
      {GROUPS.map((group) => {
        const rows = valueRows(analysis.values, group, locale, analysisUi)
        if (rows.length === 0) return null
        return (
          <table key={group} className={styles.values}>
            <caption className={`${styles.caption} mono-label`}>
              {analysisUi.groups[group]}
              {group === 'nutrizionale' && <span className={styles.per}> · {analysisUi.nutritionPer(analysis.nutritionBasis)}</span>}
            </caption>
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
        )
      })}
      <a href={analysis.url} target="_blank" rel="noopener" className={`${styles.inlineLink} body-sm`}>
        {analysisUi.openReport}
      </a>
    </article>
  )
}

function CampaignBlock({ campaign }: { campaign: CampaignAnalyses }) {
  const { analysisUi } = useContent()
  return (
    <section className={styles.campaign}>
      <h2 className={styles.tags}>
        <span className="specimen-tag specimen">{analysisUi.lineName[campaign.productLine]}</span>
        <span className="specimen-tag specimen">{analysisUi.campaign(campaign.campaign)}</span>
      </h2>
      {campaign.analyses.map((analysis) => (
        <AnalysisBlock key={analysis.url} analysis={analysis} />
      ))}
    </section>
  )
}

// /analisi: i referti pubblicati, campagna per campagna, con i valori controllati nel back office.
export function AnalysesPage() {
  const { analysisUi } = useContent()
  const locale = useLocale()
  const state = usePublicAnalyses()

  let body
  if (state.status === 'loading') body = <p className={`${styles.status} body`} role="status">{analysisUi.loading}</p>
  else if (state.status === 'error') body = <p className={`${styles.status} body`} role="alert">{analysisUi.error}</p>
  else if (state.campaigns.length === 0) body = <p className={`${styles.status} body`}>{analysisUi.empty}</p>
  else body = state.campaigns.map((campaign) => <CampaignBlock key={`${campaign.productLine}-${campaign.campaign}`} campaign={campaign} />)

  return (
    <section className={styles.page} data-surface="light">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className="display-2">{analysisUi.title}</h1>
          <p className="body-lead">{analysisUi.intro}</p>
        </header>
        {body}
        <div className={styles.links}>
          <a href={sectionHref(locale, 'filiera')} className="btn btn-ghost mono-label">
            {analysisUi.backToFiliera}
          </a>
          <a href={localizePath(locale, '/')} className="btn btn-ghost mono-label">
            {analysisUi.backHome}
          </a>
        </div>
      </div>
    </section>
  )
}
