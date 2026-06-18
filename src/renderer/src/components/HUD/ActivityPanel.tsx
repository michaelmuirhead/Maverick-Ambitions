import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { ACTIVITIES, ACTIVITY_MAP } from '@shared/engine/activities'
import type { ActivityType } from '@shared/types/game'
import styles from './ActivityPanel.module.css'

export default function ActivityPanel(): JSX.Element {
  const currentActivity = useGameStore((s) => s.currentActivity)
  const activityQueue = useGameStore((s) => s.activityQueue)
  const clock = useGameStore((s) => s.clock)
  const enqueueActivity = useGameStore((s) => s.enqueueActivity)

  const [picking, setPicking] = useState<ActivityType | null>(null)

  const queueEmpty = !currentActivity && activityQueue.length === 0

  const handlePick = (type: ActivityType, hours: number): void => {
    enqueueActivity(type, hours)
    setPicking(null)
  }

  return (
    <div className={styles.panel}>
      {/* Current activity */}
      <div className={styles.current}>
        <h3 className={styles.sectionTitle}>Now</h3>
        {currentActivity ? (
          <div className={styles.activeCard}>
            <span className={styles.activeIcon}>
              {ACTIVITY_MAP[currentActivity.type].icon}
            </span>
            <div className={styles.activeInfo}>
              <span className={styles.activeName}>
                {ACTIVITY_MAP[currentActivity.type].label}
              </span>
              <div className={styles.activeProgress}>
                <div
                  className={styles.activeProgressFill}
                  style={{
                    width: `${((currentActivity.totalHours - currentActivity.hoursRemaining) / currentActivity.totalHours) * 100}%`
                  }}
                />
              </div>
              <span className={styles.activeHours}>
                {currentActivity.hoursRemaining}h remaining
              </span>
            </div>
          </div>
        ) : (
          <div className={`${styles.idleCard} ${clock.paused ? styles.idleCardPaused : ''}`}>
            {clock.paused ? '⏸ Paused — schedule an activity to continue' : '⏳ Idle'}
          </div>
        )}
      </div>

      {/* Queue */}
      {activityQueue.length > 0 && (
        <div className={styles.queueSection}>
          <h3 className={styles.sectionTitle}>Up Next</h3>
          <div className={styles.queue}>
            {activityQueue.map((a, i) => (
              <div key={i} className={styles.queueItem}>
                <span>{ACTIVITY_MAP[a.type].icon}</span>
                <span>{ACTIVITY_MAP[a.type].label}</span>
                <span className={styles.queueHours}>{a.totalHours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity picker */}
      <div className={styles.pickerSection}>
        <h3 className={styles.sectionTitle}>
          {queueEmpty ? '⚠ Schedule something' : 'Add to Queue'}
        </h3>

        {picking === null ? (
          <div className={styles.activityGrid}>
            {ACTIVITIES.map((a) => (
              <button
                key={a.type}
                className={styles.activityBtn}
                onClick={() => setPicking(a.type)}
              >
                <span className={styles.activityBtnIcon}>{a.icon}</span>
                <span className={styles.activityBtnLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <DurationPicker
            type={picking}
            onConfirm={handlePick}
            onCancel={() => setPicking(null)}
          />
        )}
      </div>
    </div>
  )
}

function DurationPicker({
  type,
  onConfirm,
  onCancel
}: {
  type: ActivityType
  onConfirm: (type: ActivityType, hours: number) => void
  onCancel: () => void
}): JSX.Element {
  const def = ACTIVITY_MAP[type]
  const options = def.fixedHours !== null ? [def.fixedHours] : (def.durationOptions ?? [1])

  return (
    <div className={styles.durationPicker}>
      <div className={styles.durationHeader}>
        <span>{def.icon}</span>
        <div>
          <p className={styles.durationTitle}>{def.label}</p>
          <p className={styles.durationDesc}>{def.description}</p>
        </div>
      </div>
      <p className={styles.durationPrompt}>How long?</p>
      <div className={styles.durationOptions}>
        {options.map((h) => (
          <button
            key={h}
            className={styles.durationBtn}
            onClick={() => onConfirm(type, h)}
          >
            {h}h
          </button>
        ))}
      </div>
      <button className={styles.cancelBtn} onClick={onCancel}>
        ← Back
      </button>
    </div>
  )
}
