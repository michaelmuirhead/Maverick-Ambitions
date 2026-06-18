import { useGameStore } from '../../store/gameStore'
import { formatDate, formatTime } from '@shared/engine/gameTime'
import type { ClockSpeed } from '@shared/types/game'
import styles from './TopBar.module.css'

const SPEEDS: { value: ClockSpeed; label: string }[] = [
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 4, label: '4×' }
]

export default function TopBar(): JSX.Element {
  const character = useGameStore((s) => s.character)
  const gameTime = useGameStore((s) => s.gameTime)
  const clock = useGameStore((s) => s.clock)
  const togglePause = useGameStore((s) => s.togglePause)
  const setSpeed = useGameStore((s) => s.setSpeed)

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

      <div className={styles.controls}>
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
