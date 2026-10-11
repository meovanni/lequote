import { domande } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import styles from './Domande.module.css'

// Elenco affiancato invece di una fisarmonica: le risposte sono brevi, e averle tutte a vista
// evita al visitatore di aprire sette pannelli per trovare quella giusta.
export function Domande() {
  return (
    <section id="domande" data-surface="light-alt" className={styles.section}>
      <div className={styles.inner}>
        <Reveal>
          <SectionHeading title={domande.title} visible />
        </Reveal>

        <div className={styles.topics}>
          {domande.topics.map((topic, topicIndex) => (
            <Reveal key={topic.id} offset={topicIndex * 6} className={styles.topic}>
              <h3 className={`${styles.topicLabel} mono-label`}>{topic.label}</h3>
              {/* Titoli veri (non <dt>): permettono di saltare da una domanda all'altra. */}
              <div className={styles.items}>
                {topic.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <h4 className="display-3">{item.question}</h4>
                    <p className={`${styles.answer} body`}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
