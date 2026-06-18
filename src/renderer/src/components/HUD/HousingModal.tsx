import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { HOUSING } from '@shared/data/housing'
import { marketRent, marketMoveInCost, marketDownPayment, marketMortgage } from '@shared/engine/economy'
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
  const economy   = useGameStore((s) => s.economy)
  const moveIn    = useGameStore((s) => s.moveIn)
  const [view, setView] = useState<ViewMode>('rent')

  if (!open || !character) return null

  const money = character.money
  const listings = HOUSING.filter((h) => view === 'rent' ? h.canRent : h.canBuy)

  function handleMoveIn(def: HousingDef, owned: boolean): void {
    moveIn(def, owned)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Housing Market</h2>
          {housing && (
            <span className={styles.currentLabel}>
              Currently: <strong>{housing.def.name}</strong>
              {housing.monthlyPayment > 0 && ` · $${housing.monthlyPayment.toLocaleString()}/mo`}
              {housing.owned && ' (owned)'}
            </span>
          )}
          <div className={styles.econNote}>
            Housing index: <strong>{Math.round(economy.housingIndex * 100)}%</strong>
          </div>
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
            const isCurrent = housing?.def.id === def.id && housing.owned === (view === 'buy')

            const monthlyAmount = view === 'rent'
              ? marketRent(def, economy)
              : marketMortgage(def, economy)
            const upfrontCost = view === 'rent'
              ? marketMoveInCost(def, economy)
              : marketDownPayment(def, economy)
            const canAfford = money >= upfrontCost

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
                    {upfrontCost > 0 && (
                      <span className={`${styles.cardCost} ${!canAfford ? styles.cardCostLocked : ''}`}>
                        {view === 'rent' ? 'Move-in' : 'Down payment'}: ${upfrontCost.toLocaleString()}
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
                    negative={def.moodPerHour < 0}
                  />
                  {view === 'rent' && (
                    <StatPill label="Rate" value={`${Math.round(economy.housingIndex * 100)}%`} dimmed />
                  )}
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
                      Need ${(upfrontCost - money).toLocaleString()} more
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
  label, value, negative, dimmed
}: {
  label: string
  value: string
  negative?: boolean
  dimmed?: boolean
}): JSX.Element {
  return (
    <span className={`${styles.statPill} ${negative ? styles.statPillNeg : ''} ${dimmed ? styles.statPillDimmed : ''}`}>
      <span className={styles.statPillLabel}>{label}</span>
      <span className={styles.statPillValue}>{value}</span>
    </span>
  )
}
