import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { HOUSING } from '@shared/data/housing'
import type { HousingDef } from '@shared/types/housing'
import styles from './HousingModal.module.css'

type ViewMode = 'rent' | 'buy'

interface Props {
  open: boolean
  onClose: () => void
}

export default function HousingModal({ open, onClose }: Props): JSX.Element | null {
  const character = useGameStore((s) => s.character)
  const housing   = useGameStore((s) => s.housing)
  const moveIn    = useGameStore((s) => s.moveIn)
  const [view, setView] = useState<ViewMode>('rent')

  if (!open || !character) return null

  const money = character.money

  const listings = HOUSING.filter((h) =>
    view === 'rent' ? h.canRent : h.canBuy
  )

  function handleMoveIn(def: HousingDef, owned: boolean): void {
    moveIn(def, owned)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Housing</h2>
          {housing && (
            <span className={styles.currentLabel}>
              Currently: <strong>{housing.def.name}</strong>
              {housing.monthlyPayment > 0 && ` · $${housing.monthlyPayment.toLocaleString()}/mo`}
            </span>
          )}
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'rent' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('rent')}
          >
            Rent
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'buy' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('buy')}
          >
            Buy
          </button>
        </div>

        <div className={styles.listings}>
          {listings.map((def) => {
            const isCurrent = housing?.def.id === def.id
            const cost = view === 'rent' ? def.moveInCost : def.downPayment
            const canAfford = money >= cost
            const monthlyAmount = view === 'rent' ? def.monthlyRent : def.monthlyMortgage

            return (
              <div
                key={def.id}
                className={`${styles.card} ${isCurrent ? styles.cardCurrent : ''} ${!canAfford ? styles.cardLocked : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTierBadge}>T{def.tier}</div>
                  <div className={styles.cardTitleBlock}>
                    <span className={styles.cardName}>{def.name}</span>
                    {def.bedrooms > 0 && (
                      <span className={styles.cardBed}>{def.bedrooms} bed</span>
                    )}
                  </div>
                  <div className={styles.cardPricing}>
                    {monthlyAmount > 0 && (
                      <span className={styles.cardMonthly}>${monthlyAmount.toLocaleString()}/mo</span>
                    )}
                    {cost > 0 && (
                      <span className={`${styles.cardCost} ${!canAfford ? styles.cardCostLocked : ''}`}>
                        {view === 'rent' ? 'Move-in' : 'Down payment'}: ${cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className={styles.cardDesc}>{def.description}</p>

                <div className={styles.cardStats}>
                  <StatPill label="Sleep" value={`${Math.round(def.sleepQualityMultiplier * 100)}%`} />
                  <StatPill label="Hygiene" value={`${Math.round(def.hygieneMultiplier * 100)}%`} />
                  <StatPill
                    label="Mood/hr"
                    value={def.moodPerHour >= 0 ? `+${def.moodPerHour}` : `${def.moodPerHour}`}
                    positive={def.moodPerHour >= 0}
                  />
                </div>

                <div className={styles.cardFooter}>
                  {isCurrent ? (
                    <span className={styles.currentBadge}>Current Home</span>
                  ) : canAfford ? (
                    <button
                      className={styles.moveInBtn}
                      onClick={() => handleMoveIn(def, view === 'buy')}
                    >
                      {view === 'rent' ? 'Move In' : 'Purchase'}
                    </button>
                  ) : (
                    <span className={styles.lockedLabel}>
                      Need ${(cost - money).toLocaleString()} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  positive
}: {
  label: string
  value: string
  positive?: boolean
}): JSX.Element {
  return (
    <span className={`${styles.statPill} ${positive === false ? styles.statPillNeg : ''}`}>
      <span className={styles.statPillLabel}>{label}</span>
      <span className={styles.statPillValue}>{value}</span>
    </span>
  )
}
