import { useGameStore } from '../../store/gameStore'
import type { Needs, Attributes } from '@shared/types/character'
import styles from './NeedsPanel.module.css'

const NEED_ROWS: { key: keyof Needs; label: string; icon: string; color: string }[] = [
  { key: 'energy',  label: 'Energy',  icon: '⚡', color: '#f6ad55' },
  { key: 'hunger',  label: 'Hunger',  icon: '🍽', color: '#68d391' },
  { key: 'hygiene', label: 'Hygiene', icon: '🚿', color: '#63b3ed' },
  { key: 'mood',    label: 'Mood',    icon: '😊', color: '#b794f4' },
  { key: 'social',  label: 'Social',  icon: '👥', color: '#f0b429' }
]

const ATTR_ROWS: { key: keyof Attributes; label: string }[] = [
  { key: 'intelligence', label: 'INT' },
  { key: 'charisma',     label: 'CHA' },
  { key: 'streetSmarts', label: 'STR' },
  { key: 'creativity',   label: 'CRE' },
  { key: 'health',       label: 'HLT' }
]

function needColor(val: number): string {
  if (val > 60) return 'var(--color-success)'
  if (val > 30) return '#f6ad55'
  return 'var(--color-danger)'
}

export default function NeedsPanel(): JSX.Element {
  const character = useGameStore((s) => s.character)
  if (!character) return <></>

  return (
    <aside className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Needs</h3>
        {NEED_ROWS.map(({ key, label, icon }) => {
          const val = Math.round(character.needs[key])
          return (
            <div key={key} className={styles.needRow}>
              <span className={styles.needIcon}>{icon}</span>
              <div className={styles.needBarWrap}>
                <div className={styles.needLabel}>{label}</div>
                <div className={styles.needTrack}>
                  <div
                    className={styles.needFill}
                    style={{ width: `${val}%`, background: needColor(val) }}
                  />
                </div>
              </div>
              <span className={styles.needVal} style={{ color: needColor(val) }}>
                {val}
              </span>
            </div>
          )
        })}
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Attributes</h3>
        {ATTR_ROWS.map(({ key, label }) => {
          const val = character.attributes[key]
          return (
            <div key={key} className={styles.attrRow}>
              <span className={styles.attrLabel}>{label}</span>
              <div className={styles.attrTrack}>
                <div className={styles.attrFill} style={{ width: `${val}%` }} />
              </div>
              <span className={styles.attrVal}>{val}</span>
            </div>
          )
        })}
      </section>
    </aside>
  )
}
