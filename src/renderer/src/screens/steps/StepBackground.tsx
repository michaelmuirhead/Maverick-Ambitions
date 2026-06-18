import type { CharacterDraft } from '@shared/types/character'
import { BACKGROUNDS } from '@shared/data/backgrounds'
import styles from './Steps.module.css'

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function StepBackground({ draft, onChange }: Props): JSX.Element {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepIntro}>
        Your origin shapes your starting point. Choose wisely.
      </p>

      <div className={styles.cardGrid}>
        {BACKGROUNDS.map((bg) => {
          const isSelected = draft.backgroundId === bg.id
          const bonuses = Object.entries(bg.statBonuses).filter(([, v]) => v !== 0)
          return (
            <button
              key={bg.id}
              className={`${styles.bgCard} ${isSelected ? styles.bgCardSelected : ''}`}
              onClick={() => onChange({ backgroundId: bg.id })}
              type="button"
            >
              <div className={styles.bgCardHeader}>
                <span className={styles.bgCardName}>{bg.name}</span>
                <span className={styles.bgCardMoney}>
                  ${bg.startingMoney.toLocaleString()}
                </span>
              </div>

              <p className={styles.bgCardDesc}>{bg.description}</p>
              <p className={styles.bgCardFlavour}>{bg.flavour}</p>

              <div className={styles.bgCardStats}>
                {bonuses.map(([stat, val]) => (
                  <span
                    key={stat}
                    className={`${styles.statPill} ${(val ?? 0) > 0 ? styles.statPillPos : styles.statPillNeg}`}
                  >
                    {(val ?? 0) > 0 ? '+' : ''}{val} {formatStat(stat)}
                  </span>
                ))}
                <span className={styles.statPill}>{formatEducation(bg.startingEducation)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatStat(key: string): string {
  const map: Record<string, string> = {
    intelligence: 'INT',
    charisma: 'CHA',
    fitness: 'FIT',
    streetSmarts: 'STR',
    creativity: 'CRE',
    happiness: 'HAP'
  }
  return map[key] ?? key
}

function formatEducation(level: string): string {
  const map: Record<string, string> = {
    none: 'No Degree',
    'high-school': 'High School',
    'some-college': 'Some College',
    degree: 'Degree'
  }
  return map[level] ?? level
}
