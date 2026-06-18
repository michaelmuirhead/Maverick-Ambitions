import type { CharacterDraft, TraitId } from '@shared/types/character'
import { TRAITS } from '@shared/data/traits'
import styles from './Steps.module.css'

const MAX_TRAITS = 2

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function StepTraits({ draft, onChange }: Props): JSX.Element {
  const toggle = (id: TraitId): void => {
    const current = draft.traitIds
    if (current.includes(id)) {
      onChange({ traitIds: current.filter((t) => t !== id) })
    } else if (current.length < MAX_TRAITS) {
      onChange({ traitIds: [...current, id] })
    }
  }

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepIntro}>
        Choose <strong>{MAX_TRAITS} traits</strong> that define your character.
        These shape how you interact with the world.
        <span className={styles.traitCount}>
          {draft.traitIds.length} / {MAX_TRAITS} selected
        </span>
      </p>

      <div className={styles.traitGrid}>
        {TRAITS.map((trait) => {
          const isSelected = draft.traitIds.includes(trait.id)
          const isDisabled = !isSelected && draft.traitIds.length >= MAX_TRAITS
          return (
            <button
              key={trait.id}
              className={`${styles.traitCard} ${isSelected ? styles.traitCardSelected : ''} ${isDisabled ? styles.traitCardDisabled : ''}`}
              onClick={() => toggle(trait.id)}
              type="button"
              disabled={isDisabled}
            >
              <div className={styles.traitCardTop}>
                <span className={styles.traitName}>{trait.name}</span>
                {isSelected && <span className={styles.traitCheck}>✓</span>}
              </div>
              <p className={styles.traitDesc}>{trait.description}</p>
              <p className={styles.traitEffect}>{trait.effect}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
