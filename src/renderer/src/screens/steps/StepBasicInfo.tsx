import type { CharacterDraft, Gender } from '@shared/types/character'
import styles from './Steps.module.css'

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

const GENDERS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'nonbinary', label: 'Non-binary', icon: '⚬' }
]

const CURRENT_YEAR = 2000
const MIN_BIRTH_YEAR = CURRENT_YEAR - 30   // max age 30
const MAX_BIRTH_YEAR = CURRENT_YEAR - 18   // min age 18

export default function StepBasicInfo({ draft, onChange }: Props): JSX.Element {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepIntro}>
        Every story starts with a name. Who are you?
      </p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>First Name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Marcus"
            maxLength={24}
            value={draft.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Last Name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Cole"
            maxLength={24}
            value={draft.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Gender</label>
        <div className={styles.genderRow}>
          {GENDERS.map((g) => (
            <button
              key={g.value}
              className={`${styles.genderBtn} ${draft.gender === g.value ? styles.genderBtnActive : ''}`}
              onClick={() => onChange({ gender: g.value })}
              type="button"
            >
              <span className={styles.genderIcon}>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Birth Year
          <span className={styles.labelHint}>
            — You begin your story at age {CURRENT_YEAR - draft.birthYear}
          </span>
        </label>
        <div className={styles.sliderWrapper}>
          <input
            className={styles.slider}
            type="range"
            min={MIN_BIRTH_YEAR}
            max={MAX_BIRTH_YEAR}
            value={draft.birthYear}
            onChange={(e) => onChange({ birthYear: Number(e.target.value) })}
          />
          <div className={styles.sliderLabels}>
            <span>Age 30</span>
            <span className={styles.sliderValue}>{draft.birthYear}</span>
            <span>Age 18</span>
          </div>
        </div>
      </div>
    </div>
  )
}
