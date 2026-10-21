import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { REVEAL_VIEWPORT, riseChild, staggerParent } from '@/lib/motion'
import { useContent } from '@/i18n/LocaleContext'
import type { ProductLine } from '@/types'
import { SectionHeading } from '@/components/common/SectionHeading/SectionHeading'
import { LegalPanel } from '@/components/common/LegalPanel/LegalPanel'
import { Reveal } from '@/components/common/Reveal/Reveal'
import { LotLookup } from './LotLookup'
import styles from './Filiera.module.css'

const tabId = (line: ProductLine) => `filiera-tab-${line}`
const panelId = (line: ProductLine) => `filiera-panel-${line}`

export function Filiera() {
  const { filiera, ui } = useContent()
  const [activeLine, setActiveLine] = useState<ProductLine>(filiera.lines[0].line)
  const tabRefs = useRef<Partial<Record<ProductLine, HTMLButtonElement | null>>>({})

  // Tablist ARIA (pattern APG): frecce, Home e Fine spostano selezione e focus.
  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = filiera.lines.length
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % count,
      ArrowLeft: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = filiera.lines[target].line
    setActiveLine(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="filiera" data-surface="dark" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <Reveal>
            <p className={`${styles.eyebrow} eyebrow`}>{filiera.eyebrow}</p>
            <SectionHeading title={filiera.title} visible />
          </Reveal>
          <Reveal offset={6}>
            <p className={`${styles.intro} body-lead`}>{filiera.intro}</p>
          </Reveal>
        </header>

        <div className={styles.chain}>
          <div role="tablist" aria-label={ui.filieraTablistLabel} className={styles.tabs}>
            {filiera.lines.map((entry, index) => {
              const selected = entry.line === activeLine
              return (
                <button
                  key={entry.line}
                  ref={(el) => {
                    tabRefs.current[entry.line] = el
                  }}
                  id={tabId(entry.line)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId(entry.line)}
                  tabIndex={selected ? 0 : -1}
                  className={[styles.tab, 'mono-label', selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setActiveLine(entry.line)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {/* La pillola scivola da un tab all'altro invece di sparire e ricomparire. */}
                  {selected && (
                    <motion.span
                      layoutId="filiera-tab-pill"
                      className={styles.tabPill}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className={styles.tabLabel}>{entry.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tutti i pannelli restano nel DOM perché aria-controls deve puntare a un elemento
              esistente: quelli inattivi sono soltanto nascosti. */}
          {filiera.lines.map((entry) => (
            <div
              key={entry.line}
              role="tabpanel"
              id={panelId(entry.line)}
              aria-labelledby={tabId(entry.line)}
              hidden={entry.line !== activeLine}
              className={styles.panel}
            >
              <motion.div
                key={`head-${activeLine}`}
                className={styles.panelHead}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="display-2">{entry.label}</h3>
                <span className="specimen-tag specimen">{entry.elevation}</span>
                <p className={`${styles.summary} body`}>{entry.summary}</p>
              </motion.div>

              {/* La chiave legata al tab rimonta l'elenco: a ogni cambio le fasi rientrano in cascata. */}
              <motion.ol
                key={`steps-${activeLine}`}
                className={styles.steps}
                initial="hidden"
                whileInView="visible"
                viewport={REVEAL_VIEWPORT}
                variants={staggerParent(0.09)}
              >
                {entry.steps.map((step, index) => (
                  <motion.li key={step.id} className={styles.step} variants={riseChild}>
                    <span className={`${styles.stepNumber} specimen-tag specimen`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="display-3">{step.title}</h4>
                    <p className={`${styles.stepMeta} specimen`}>
                      <span>{step.place}</span>
                      <span className={styles.stepPeriod}>{step.period}</span>
                    </p>
                    <p className={`${styles.stepText} body-sm`}>{step.description}</p>
                  </motion.li>
                ))}
              </motion.ol>

              <LegalPanel label={filiera.legalPanelLabel} items={entry.legalInfo} footnote={filiera.internalNote} />
            </div>
          ))}
        </div>

        <LotLookup />
      </div>
    </section>
  )
}
