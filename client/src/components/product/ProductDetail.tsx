import { useContent, useLocale } from '@/i18n/LocaleContext'
import { sectionHref } from '@/i18n/locales'
import { useCatalogProduct } from '@/hooks/useCatalogProduct'
import { usePublicAnalyses } from '@/hooks/usePublicAnalyses'
import { latestValues } from '@/lib/medusa/analyses'
import { valueText } from '@/lib/analysisDisplay'
import type { ProductHandle } from '@/data/content/handles'
import { OilBottle } from '@/components/common/Product/OilBottle'
import { HoneyJar } from '@/components/common/Product/HoneyJar'
import { LegalPanel } from '@/components/common/LegalPanel/LegalPanel'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { AnimatedWords } from '@/components/common/AnimatedWords/AnimatedWords'
import { ProductBuyBox } from './ProductBuyBox'
import { ChemistryBlock, NutritionTable, OrganolepticProfile } from './ProductAnalysis'
import styles from './ProductDetail.module.css'

interface ProductDetailProps {
  handle: ProductHandle
}

// Scheda prodotto: racconto e informazioni obbligatorie dai contenuti tradotti, formati e prezzi
// da Medusa, valori delle analisi dai referti pubblicati nel back office. Le informazioni di legge
// sono le stesse della sezione Filiera per quella linea.
export function ProductDetail({ handle }: ProductDetailProps) {
  const { products, productUi, filiera, ui, analysisUi } = useContent()
  const locale = useLocale()
  const page = products[handle]
  const catalog = useCatalogProduct(handle)
  const analyses = usePublicAnalyses(page.line)
  const latest = analyses.status === 'ready' ? latestValues(analyses.campaigns, page.line) : null
  const legal = filiera.lines.find((line) => line.line === page.line)
  const acidity = page.acidity === null ? null : (valueText(latest?.byKey.get('acidita'), locale, analysisUi) ?? page.acidity)
  const facts = acidity ? [{ label: productUi.acidityLabel, value: acidity }, ...page.facts] : page.facts

  return (
    <article data-line={page.line}>
      <section className={styles.hero} data-surface="light">
        <div className={styles.heroInner}>
          <Reveal variant="sideLeft" className={styles.visual}>
            {page.illustration === 'oil' ? (
              <OilBottle className={styles.illustration} label={ui.oilBottleLabel} />
            ) : (
              <HoneyJar className={styles.illustration} label={ui.honeyJarLabel} />
            )}
          </Reveal>

          <div className={styles.intro}>
            <a href={sectionHref(locale, 'shop')} className={`${styles.back} mono-label`}>
              ← {productUi.backToShop}
            </a>
            <span className={`${styles.eyebrow} line-tag specimen-tag specimen`}>{page.eyebrow}</span>
            <h1 className="display-1">
              <AnimatedWords text={page.name} immediate />
            </h1>
            <p className="body-lead">{page.summary}</p>
            <ProductBuyBox catalog={catalog} variantLabels={page.variantLabels} />
          </div>
        </div>
      </section>

      <section className={styles.details} data-surface="light-alt">
        <div className={styles.detailsInner}>
          <div className={styles.story}>
            {page.paragraphs.map((paragraph, index) => (
              <Reveal key={index} offset={index * 6}>
                <p className="body">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <div className={styles.aside}>
            <Reveal>
              <h2 className={`${styles.asideTitle} mono-label`}>{productUi.detailsTitle}</h2>
              <dl className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className="body-sm">{fact.label}</dt>
                    <dd className="body">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {page.line === 'olio' && <OrganolepticProfile latest={latest} />}
            {page.line === 'olio' && <ChemistryBlock latest={latest} />}
            <NutritionTable latest={latest} fallback={page.nutrition} />

            {legal && <LegalPanel label={filiera.legalPanelLabel} items={legal.legalInfo} />}

            <div className={styles.trace}>
              <h2 className={`${styles.asideTitle} mono-label`}>{productUi.traceTitle}</h2>
              <p className="body-sm">{productUi.traceBody}</p>
              <a href={sectionHref(locale, 'filiera')} className="btn btn-ghost mono-label">
                {productUi.traceLink}
              </a>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
