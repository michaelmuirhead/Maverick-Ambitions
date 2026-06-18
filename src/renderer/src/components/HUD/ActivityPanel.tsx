import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { ACTIVITIES, ACTIVITY_MAP } from '@shared/engine/activities'
import type { ActivityType } from '@shared/types/game'
import type { Employment, JobOffer } from '@shared/types/jobs'
import styles from './ActivityPanel.module.css'

type Tab = 'schedule' | 'jobs'

export default function ActivityPanel(): JSX.Element {
  const currentActivity  = useGameStore((s) => s.currentActivity)
  const activityQueue    = useGameStore((s) => s.activityQueue)
  const clock            = useGameStore((s) => s.clock)
  const enqueueActivity  = useGameStore((s) => s.enqueueActivity)
  const enqueueWorkShift = useGameStore((s) => s.enqueueWorkShift)
  const employment       = useGameStore((s) => s.employment)
  const jobOffers        = useGameStore((s) => s.jobOffers)
  const acceptOffer      = useGameStore((s) => s.acceptOffer)
  const declineOffer     = useGameStore((s) => s.declineOffer)
  const quitJob          = useGameStore((s) => s.quitJob)

  const [tab, setTab] = useState<Tab>('schedule')
  const [picking, setPicking] = useState<ActivityType | null>(null)

  const queueEmpty = !currentActivity && activityQueue.length === 0

  const handlePick = (type: ActivityType, hours: number): void => {
    if (type === 'work-shift') {
      enqueueWorkShift(hours)
    } else {
      enqueueActivity(type, hours)
    }
    setPicking(null)
  }

  // Available activities: include work-shift only when employed
  const availableActivities = ACTIVITIES.filter(
    (a) => a.type !== 'work-shift' || employment !== null
  )

  return (
    <div className={styles.panel}>
      {/* Tab bar */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'schedule' ? styles.tabActive : ''}`}
          onClick={() => { setTab('schedule'); setPicking(null) }}
        >
          Schedule
        </button>
        <button
          className={`${styles.tab} ${tab === 'jobs' ? styles.tabActive : ''}`}
          onClick={() => { setTab('jobs'); setPicking(null) }}
        >
          Career
          {jobOffers.length > 0 && (
            <span className={styles.badge}>{jobOffers.length}</span>
          )}
        </button>
      </div>

      {tab === 'schedule' && (
        <>
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
                    {currentActivity.type === 'work-shift' && employment &&
                      <span className={styles.activeWage}> · ${employment.job.hourlyWage}/hr</span>
                    }
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
                {availableActivities.map((a) => (
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
                employment={employment}
                onConfirm={handlePick}
                onCancel={() => setPicking(null)}
              />
            )}
          </div>
        </>
      )}

      {tab === 'jobs' && (
        <CareerTab
          employment={employment}
          jobOffers={jobOffers}
          onAccept={acceptOffer}
          onDecline={declineOffer}
          onQuit={quitJob}
        />
      )}
    </div>
  )
}

// ── Duration picker ────────────────────────────────────────────────────────────

function DurationPicker({
  type,
  employment,
  onConfirm,
  onCancel
}: {
  type: ActivityType
  employment: Employment | null
  onConfirm: (type: ActivityType, hours: number) => void
  onCancel: () => void
}): JSX.Element {
  const def = ACTIVITY_MAP[type]
  const options =
    type === 'work-shift' && employment
      ? employment.job.shiftOptions
      : def.fixedHours !== null
      ? [def.fixedHours]
      : (def.durationOptions ?? [1])

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
          <button key={h} className={styles.durationBtn} onClick={() => onConfirm(type, h)}>
            {h}h
          </button>
        ))}
      </div>
      <button className={styles.cancelBtn} onClick={onCancel}>← Back</button>
    </div>
  )
}

// ── Career tab ─────────────────────────────────────────────────────────────────

function CareerTab({
  employment,
  jobOffers,
  onAccept,
  onDecline,
  onQuit
}: {
  employment: Employment | null
  jobOffers: JobOffer[]
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onQuit: () => void
}): JSX.Element {
  const [confirmQuit, setConfirmQuit] = useState(false)

  return (
    <div className={styles.careerTab}>
      {/* Current job */}
      <section className={styles.careerSection}>
        <h3 className={styles.sectionTitle}>Current Job</h3>
        {employment ? (
          <div className={styles.jobCard}>
            <div className={styles.jobCardHeader}>
              <span className={styles.jobTitle}>{employment.job.title}</span>
              <span className={styles.jobWage}>${employment.job.hourlyWage}/hr</span>
            </div>
            <p className={styles.jobEmployer}>{employment.job.employer}</p>
            <p className={styles.jobDesc}>{employment.job.description}</p>
            <div className={styles.jobStats}>
              <span>Shifts: {employment.job.shiftOptions.join(' or ')}h</span>
              <span>Earned: ${Math.round(employment.totalEarned).toLocaleString()}</span>
              <span>Hours: {employment.totalHoursWorked}</span>
            </div>
            {confirmQuit ? (
              <div className={styles.quitConfirm}>
                <span>Are you sure?</span>
                <button className={styles.quitYes} onClick={() => { onQuit(); setConfirmQuit(false) }}>
                  Yes, quit
                </button>
                <button className={styles.quitNo} onClick={() => setConfirmQuit(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.quitBtn} onClick={() => setConfirmQuit(true)}>
                Quit Job
              </button>
            )}
          </div>
        ) : (
          <p className={styles.noJob}>Not employed. Use Job Search to find work.</p>
        )}
      </section>

      {/* Job offers */}
      <section className={styles.careerSection}>
        <h3 className={styles.sectionTitle}>
          Job Offers {jobOffers.length > 0 && `(${jobOffers.length})`}
        </h3>
        {jobOffers.length === 0 ? (
          <p className={styles.noJob}>No pending offers. Try Job Search.</p>
        ) : (
          <div className={styles.offerList}>
            {jobOffers.map((offer) => (
              <div key={offer.id} className={styles.offerCard}>
                <div className={styles.jobCardHeader}>
                  <span className={styles.jobTitle}>{offer.job.title}</span>
                  <span className={styles.jobWage}>${offer.job.hourlyWage}/hr</span>
                </div>
                <p className={styles.jobEmployer}>{offer.job.employer}</p>
                <p className={styles.jobDesc}>{offer.job.description}</p>
                <div className={styles.offerActions}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => onAccept(offer.id)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.declineBtn}
                    onClick={() => onDecline(offer.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
