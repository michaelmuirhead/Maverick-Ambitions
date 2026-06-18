import type { Character } from '@shared/types/character'
import styles from './Steps.module.css'

interface Props {
  character: Character
  onBegin: () => void
}

const STAT_LABELS: { key: keyof import('@shared/types/character').CoreStats; label: string; color: string }[] = [
  { key: 'intelligence', label: 'Intelligence', color: '#63b3ed' },
  { key: 'charisma',     label: 'Charisma',     color: '#f6ad55' },
  { key: 'fitness',      label: 'Fitness',       color: '#68d391' },
  { key: 'streetSmarts', label: 'Street Smarts', color: '#fc8181' },
  { key: 'creativity',   label: 'Creativity',    color: '#b794f4' },
  { key: 'happiness',    label: 'Happiness',     color: '#f0b429' }
]

const EDUCATION_LABELS: Record<string, string> = {
  none: 'No Degree',
  'high-school': 'High School Diploma',
  'some-college': 'Some College',
  degree: "Bachelor's Degree"
}

export default function StepSummary({ character, onBegin }: Props): JSX.Element {
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

        {/* Stats */}
        <div className={styles.statsList}>
          {STAT_LABELS.map(({ key, label, color }) => {
            const val = character.stats[key]
            return (
              <div key={key} className={styles.statRow}>
                <span className={styles.statLabel}>{label}</span>
                <div className={styles.statBarTrack}>
                  <div
                    className={styles.statBarFill}
                    style={{ width: `${val}%`, background: color }}
                  />
                </div>
                <span className={styles.statValue}>{val}</span>
              </div>
            )
          })}
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
