import { domande } from '@/data/content'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { motion } from 'motion/react'
import { REVEAL_VIEWPORT, riseChild, staggerParent } from '@/lib/motion'
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
              <motion.div
                className={styles.items}
                initial="hidden"
                whileInView="visible"
                viewport={REVEAL_VIEWPORT}
                variants={staggerParent(0.1, 0.15)}
              >
                {topic.items.map((item) => (
                  <motion.div key={item.id} className={styles.item} variants={riseChild}>
                    <h4 className="display-3">{item.question}</h4>
                    <p className={`${styles.answer} body`}>{item.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
