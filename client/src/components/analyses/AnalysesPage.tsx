import { useContent, useLocale } from '@/i18n/LocaleContext'
import { localizePath, sectionHref } from '@/i18n/locales'
import { usePublicAnalyses } from '@/hooks/usePublicAnalyses'
import type { CampaignAnalyses } from '@/lib/medusa/analyses'
import { AnalysisBlock } from './AnalysisBlock'
import styles from './AnalysesPage.module.css'

function CampaignBlock({ campaign }: { campaign: CampaignAnalyses }) {
  const { analysisUi } = useContent()
  return (
    <section className={styles.campaign} data-line={campaign.productLine}>
      <h2 className={styles.tags}>
        <span className="line-tag specimen-tag specimen">{analysisUi.lineName[campaign.productLine]}</span>
        <span className="specimen-tag specimen">{analysisUi.campaign(campaign.campaign)}</span>
      </h2>
      {campaign.analyses.map((analysis) => (
        <AnalysisBlock key={`${analysis.title}-${analysis.date ?? ''}`} analysis={analysis} />
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
          <h1 className="title-mark display-2">{analysisUi.title}</h1>
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
