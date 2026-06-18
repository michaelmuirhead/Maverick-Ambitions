import { useState } from 'react'
import type { Screen } from '../App'
import type { CharacterDraft } from '@shared/types/character'
import type { Character } from '@shared/types/character'
import { buildCharacter } from '@shared/factories/character'
import StepBasicInfo from './steps/StepBasicInfo'
import StepBackground from './steps/StepBackground'
import StepTraits from './steps/StepTraits'
import StepSummary from './steps/StepSummary'
import styles from './NewGame.module.css'

interface Props {
  onNavigate: (screen: Screen) => void
  onCharacterCreated: (character: Character) => void
}

const STEPS = [
  { id: 'basic',      label: 'Identity'   },
  { id: 'background', label: 'Background' },
  { id: 'traits',     label: 'Traits'     },
  { id: 'summary',    label: 'Summary'    }
]

const GAME_START_YEAR = 2000

const DEFAULT_DRAFT: CharacterDraft = {
  firstName: '',
  lastName: '',
  gender: 'male',
  birthYear: GAME_START_YEAR - 22,
  backgroundId: 'middle-ground',
  traitIds: []
}

export default function NewGame({ onNavigate, onCharacterCreated }: Props): JSX.Element {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CharacterDraft>(DEFAULT_DRAFT)

  const patch = (p: Partial<CharacterDraft>): void =>
    setDraft((d) => ({ ...d, ...p }))

  const character = buildCharacter(draft)

  const canAdvance = (): boolean => {
    if (step === 0) return draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0
    if (step === 2) return draft.traitIds.length === 2
    return true
  }

  const next = (): void => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const back = (): void => {
    if (step > 0) setStep((s) => s - 1)
    else onNavigate('main-menu')
  }

  const begin = (): void => {
    onCharacterCreated(character)
    onNavigate('game')
  }

  return (
    <div className={styles.root}>
      {/* Step indicator */}
      <div className={styles.stepBar}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}
          >
            <div className={styles.stepDotCircle}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={styles.stepDotLabel}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
          </div>
        ))}
      </div>

      {/* Step heading */}
      <div className={styles.heading}>
        <h2 className={styles.headingTitle}>{stepTitle(step)}</h2>
        <p className={styles.headingStep}>Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Step content */}
      <div className={styles.body}>
        <div className={styles.scrollArea}>
          {step === 0 && <StepBasicInfo draft={draft} onChange={patch} />}
          {step === 1 && <StepBackground draft={draft} onChange={patch} />}
          {step === 2 && <StepTraits draft={draft} onChange={patch} />}
          {step === 3 && <StepSummary character={character} onBegin={begin} />}
        </div>
      </div>

      {/* Nav buttons */}
      <div className={styles.nav}>
        <button className={styles.navBack} onClick={back}>
          {step === 0 ? '← Main Menu' : '← Back'}
        </button>
        {step < STEPS.length - 1 && (
          <button
            className={`${styles.navNext} ${!canAdvance() ? styles.navNextDisabled : ''}`}
            onClick={next}
            disabled={!canAdvance()}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

function stepTitle(step: number): string {
  const titles = [
    'Who are you?',
    'Where did you come from?',
    'What defines you?',
    'Your story begins'
  ]
  return titles[step]
}
