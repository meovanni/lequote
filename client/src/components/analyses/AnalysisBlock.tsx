import { useContent, useLocale } from '@/i18n/LocaleContext'
import { valueRows } from '@/lib/analysisDisplay'
import { formatIsoDate } from '@/lib/date'
import type { PublicAnalysis, ValueGroup } from '@/lib/medusa/analyses'
import styles from './AnalysisBlock.module.css'

const GROUPS: ValueGroup[] = ['chimica', 'organolettica', 'nutrizionale', 'altro']

/** Un'analisi espansa: titolo, laboratorio e data, poi una tabella per gruppo di valori. */
export function AnalysisBlock({ analysis }: { analysis: PublicAnalysis }) {
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
    </article>
  )
}
