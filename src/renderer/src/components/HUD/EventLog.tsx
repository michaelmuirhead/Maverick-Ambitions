import { useGameStore } from '../../store/gameStore'
import type { GameEventKind } from '@shared/types/game'
import styles from './EventLog.module.css'

const KIND_COLORS: Record<GameEventKind, string> = {
  info:    'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-accent)',
  danger:  'var(--color-danger)'
}

const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function EventLog(): JSX.Element {
  const events = useGameStore((s) => s.eventLog)

  return (
    <aside className={styles.panel}>
      <h3 className={styles.title}>Events</h3>
      <div className={styles.list}>
        {events.length === 0 && (
          <p className={styles.empty}>Nothing yet.</p>
        )}
        {events.map((evt) => {
          const { day, month, hour } = evt.gameTime
          const h = hour % 12 === 0 ? 12 : hour % 12
          const ampm = hour < 12 ? 'AM' : 'PM'
          return (
            <div key={evt.id} className={styles.event}>
              <span
                className={styles.eventDot}
                style={{ background: KIND_COLORS[evt.kind] }}
              />
              <div className={styles.eventBody}>
                <p className={styles.eventMsg}>{evt.message}</p>
                <p className={styles.eventTime}>
                  {MONTH_ABBR[month]} {day} · {h}:00 {ampm}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
