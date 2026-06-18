import { useGameStore } from '../../store/gameStore'
import { formatDate, formatTime } from '@shared/engine/gameTime'
import type { ClockSpeed } from '@shared/types/game'
import type { EconomicPhase } from '@shared/types/economy'
import styles from './TopBar.module.css'

const SPEEDS: { value: ClockSpeed; label: string }[] = [
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 4, label: '4×' }
]

const PHASE_ICONS: Record<EconomicPhase, string> = {
  expansion:   '📈',
  peak:        '📊',
  contraction: '📉',
  trough:      '🔻'
}

const PHASE_LABELS: Record<EconomicPhase, string> = {
  expansion:   'Expansion',
  peak:        'Peak',
  contraction: 'Recession',
  trough:      'Trough'
}

export default function TopBar({ onOpenHousing }: { onOpenHousing: () => void }): JSX.Element {
  const character  = useGameStore((s) => s.character)
  const gameTime   = useGameStore((s) => s.gameTime)
  const clock      = useGameStore((s) => s.clock)
  const economy    = useGameStore((s) => s.economy)
  const togglePause = useGameStore((s) => s.togglePause)
  const setSpeed   = useGameStore((s) => s.setSpeed)

  if (!character) return <></>

  return (
    <div className={styles.topBar}>
      <div className={styles.charInfo}>
        <span className={styles.charName}>
          {character.firstName} {character.lastName}
        </span>
        <span className={styles.charMeta}>Age {character.age}</span>
      </div>

      <div className={styles.money}>
        ${character.money.toLocaleString()}
      </div>

      <div className={styles.clock}>
        <span className={styles.date}>{formatDate(gameTime)}</span>
        <span className={styles.time}>{formatTime(gameTime)}</span>
      </div>

      <div className={styles.economy}>
        <span className={styles.econIcon}>{PHASE_ICONS[economy.phase]}</span>
        <div className={styles.econText}>
          <span className={styles.econPhase}>{PHASE_LABELS[economy.phase]}</span>
          <span className={styles.econRate}>{(economy.annualInflation * 100).toFixed(1)}% infl.</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.housingBtn}
          onClick={onOpenHousing}
          title="Housing"
        >
          🏠
        </button>

        <button
          className={`${styles.pauseBtn} ${clock.paused ? styles.pauseBtnPaused : ''}`}
          onClick={togglePause}
          title="Pause / Play (Space)"
        >
          {clock.paused ? '▶' : '⏸'}
        </button>

        {SPEEDS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.speedBtn} ${clock.speed === value && !clock.paused ? styles.speedBtnActive : ''}`}
            onClick={() => { setSpeed(value); if (clock.paused) togglePause() }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
