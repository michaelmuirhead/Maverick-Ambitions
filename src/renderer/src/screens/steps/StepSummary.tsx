import type { Attributes, Character, Needs, Skills } from '@shared/types/character'
import styles from './Steps.module.css'

interface Props {
  character: Character
  onBegin: () => void
}

const ATTR_ROWS: { key: keyof Attributes; label: string; color: string }[] = [
  { key: 'intelligence', label: 'Intelligence', color: '#63b3ed' },
  { key: 'charisma',     label: 'Charisma',     color: '#f6ad55' },
  { key: 'streetSmarts', label: 'Street Smarts', color: '#fc8181' },
  { key: 'creativity',   label: 'Creativity',    color: '#b794f4' },
  { key: 'health',       label: 'Health',        color: '#68d391' }
]

const SKILL_LABELS: { key: keyof Skills; label: string }[] = [
  { key: 'business',   label: 'Business'   },
  { key: 'sales',      label: 'Sales'      },
  { key: 'finance',    label: 'Finance'    },
  { key: 'leadership', label: 'Leadership' },
  { key: 'cooking',    label: 'Cooking'    },
  { key: 'marketing',  label: 'Marketing'  },
  { key: 'driving',    label: 'Driving'    }
]

const NEED_LABELS: { key: keyof Needs; label: string; icon: string }[] = [
  { key: 'energy',  label: 'Energy',  icon: '⚡' },
  { key: 'hunger',  label: 'Hunger',  icon: '🍽' },
  { key: 'hygiene', label: 'Hygiene', icon: '🚿' },
  { key: 'mood',    label: 'Mood',    icon: '😊' },
  { key: 'social',  label: 'Social',  icon: '👥' }
]

const EDUCATION_LABELS: Record<string, string> = {
  none: 'No Degree',
  'high-school': 'High School Diploma',
  'some-college': 'Some College',
  degree: "Bachelor's Degree"
}

export default function StepSummary({ character, onBegin }: Props): JSX.Element {
  const nonZeroSkills = SKILL_LABELS.filter(({ key }) => character.skills[key] > 0)

  return (
    <div className={styles.stepContent}>
      <div className={styles.summaryCard}>
        {/* Identity */}
        <div className={styles.summaryIdentity}>
          <div className={styles.summaryAvatar}>
            {character.firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className={styles.summaryName}>
              {character.firstName} {character.lastName}
            </h2>
            <p className={styles.summaryMeta}>
              Age {character.age} · {capitalise(character.gender)} · {EDUCATION_LABELS[character.education]}
            </p>
            <p className={styles.summaryMeta}>
              Starting money:{' '}
              <span className={styles.summaryMoney}>
                ${character.money.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.summaryDivider} />

        {/* Background + Traits */}
        <div className={styles.summaryRow}>
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>Background</h3>
            <p className={styles.summarySectionValue}>{character.background.name}</p>
            <p className={styles.summarySectionSub}>{character.background.flavour}</p>
          </div>
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>Traits</h3>
            {character.traits.map((t) => (
              <p key={t.id} className={styles.summarySectionValue}>{t.name}</p>
            ))}
          </div>
        </div>

        <div className={styles.summaryDivider} />

        {/* Attributes */}
        <div>
          <h3 className={styles.summarySectionTitle} style={{ marginBottom: 10 }}>Attributes</h3>
          <div className={styles.statsList}>
            {ATTR_ROWS.map(({ key, label, color }) => {
              const val = character.attributes[key]
              return (
                <div key={key} className={styles.statRow}>
                  <span className={styles.statLabel}>{label}</span>
                  <div className={styles.statBarTrack}>
                    <div className={styles.statBarFill} style={{ width: `${val}%`, background: color }} />
                  </div>
                  <span className={styles.statValue}>{val}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Starting Skills */}
        {nonZeroSkills.length > 0 && (
          <>
            <div className={styles.summaryDivider} />
            <div>
              <h3 className={styles.summarySectionTitle} style={{ marginBottom: 10 }}>Starting Skills</h3>
              <div className={styles.skillGrid}>
                {nonZeroSkills.map(({ key, label }) => {
                  const val = character.skills[key]
                  return (
                    <div key={key} className={styles.skillChip}>
                      <span className={styles.skillChipLabel}>{label}</span>
                      <span className={styles.skillChipValue}>{val}</span>
                      <div className={styles.skillChipBar} style={{ width: `${val}%` }} />
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Needs note */}
        <div className={styles.summaryDivider} />
        <div className={styles.needsNote}>
          <span className={styles.needsNoteTitle}>Daily Needs</span>
          <div className={styles.needsPills}>
            {NEED_LABELS.map(({ key, label, icon }) => (
              <span key={key} className={styles.needsPill}>
                {icon} {label} <strong>{character.needs[key]}</strong>
              </span>
            ))}
          </div>
          <p className={styles.needsNoteHint}>
            Needs decay each day. Keep them up to perform at your best.
          </p>
        </div>
      </div>

      <button className={styles.beginBtn} onClick={onBegin}>
        Begin Your Story
      </button>
    </div>
  )
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
