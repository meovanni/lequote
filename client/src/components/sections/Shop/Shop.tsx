import { shop } from '@/data/content'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { Eyebrow } from '@/components/common/Eyebrow/Eyebrow'
import styles from './Shop.module.css'

export function Shop() {
  return (
    <section id="shop" data-surface="dark" className={styles.section}>
      <Reveal variant="scale" className={styles.inner}>
        <Eyebrow>{shop.eyebrow}</Eyebrow>
        <h2 className="display-1 sr-only">{shop.title}</h2>
        <p className={`${styles.body} body-lead`}>{shop.body}</p>
        <a href={shop.ctaHref} className={`${styles.cta} mono-label`}>
          {shop.ctaLabel}
        </a>
      </Reveal>
    </section>
  )
}
