import { useContent, useLocale } from '@/i18n/LocaleContext'
import { sectionHref } from '@/i18n/locales'
import { useCatalogProduct } from '@/hooks/useCatalogProduct'
import type { ProductHandle } from '@/data/content/handles'
import { OilBottle } from '@/components/common/Product/OilBottle'
import { HoneyJar } from '@/components/common/Product/HoneyJar'
import { LegalPanel } from '@/components/common/LegalPanel/LegalPanel'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { AnimatedWords } from '@/components/common/AnimatedWords/AnimatedWords'
import { ProductBuyBox } from './ProductBuyBox'
import styles from './ProductDetail.module.css'

interface ProductDetailProps {
  handle: ProductHandle
}

// Scheda prodotto: racconto e informazioni obbligatorie dai contenuti tradotti, formati e prezzi
// da Medusa. Le informazioni di legge sono le stesse della sezione Filiera per quella linea.
export function ProductDetail({ handle }: ProductDetailProps) {
  const { products, productUi, filiera, ui } = useContent()
  const locale = useLocale()
  const page = products[handle]
  const catalog = useCatalogProduct(handle)
  const legal = filiera.lines.find((line) => line.line === page.line)

  return (
    <article>
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
            <span className={`${styles.eyebrow} specimen-tag specimen`}>{page.eyebrow}</span>
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
                {page.facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className="body-sm">{fact.label}</dt>
                    <dd className="body">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {page.nutrition && (
              <Reveal offset={8}>
                <table className={styles.nutrition}>
                  <caption className={`${styles.caption} mono-label`}>{productUi.nutritionTitle}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="body-sm">
                        {productUi.nutritionNutrient}
                      </th>
                      <th scope="col" className="body-sm">
                        {page.nutrition.per}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.nutrition.rows.map((row) => (
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
            )}

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
