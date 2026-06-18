import type { EconomyState, EconomicPhase } from '../types/economy'
import type { GameEvent, GameTime } from '../types/game'
import type { HousingDef } from '../types/housing'

// ~8-year business cycle
const CYCLE_PERIOD_MONTHS = 96
const CYCLE_STEP = (2 * Math.PI) / CYCLE_PERIOD_MONTHS

// Base 3% annual inflation expressed as monthly compounding rate
const MONTHLY_BASE_INFLATION = Math.pow(1.03, 1 / 12) - 1

// 6 game months cooldown between random shocks
const SHOCK_COOLDOWN_HOURS = 24 * 30 * 6

export function initEconomy(): EconomyState {
  return {
    priceLevel: 1.0,
    housingIndex: 1.0,
    wageIndex: 1.0,
    goodsIndex: 1.0,
    phase: 'expansion',
    cycleAngle: Math.PI * 0.25, // start mid-expansion so the player sees gradual movement
    annualInflation: 0.03,
    lastShockHour: -SHOCK_COOLDOWN_HOURS
  }
}

/**
 * Advance the economy by one month. Called on day 1 / hour 0 of each month.
 * The `rng` param exists so tests can control randomness.
 */
export function advanceEconomy(
  economy: EconomyState,
  gameTime: GameTime,
  rng: () => number = Math.random
): { economy: EconomyState; events: GameEvent[] } {
  const events: GameEvent[] = []
  const timeCtx = { day: 1, month: gameTime.month, year: gameTime.year, hour: 0 }

  // Advance cycle
  const newAngle = economy.cycleAngle + CYCLE_STEP
  const strength = Math.sin(newAngle)   // -1 (trough) to +1 (peak)
  const cosine   = Math.cos(newAngle)   // derivative — positive = heading up

  // Sector targets driven by cycle strength
  const housingTarget = 1.0 + 0.35 * strength
  const wageTarget    = 1.0 + 0.18 * strength
  const goodsTarget   = 1.0 + 0.12 * strength

  // Lazy drift toward targets (indexes move gradually, not instantly)
  let housingIndex = clamp(economy.housingIndex + 0.07 * (housingTarget - economy.housingIndex), 0.6, 1.8)
  let wageIndex    = clamp(economy.wageIndex    + 0.07 * (wageTarget    - economy.wageIndex),    0.7, 1.4)
  let goodsIndex   = clamp(economy.goodsIndex   + 0.07 * (goodsTarget   - economy.goodsIndex),   0.8, 1.3)

  // Monthly inflation: base rate modulated by cycle (higher inflation near peaks)
  const monthlyInflation = MONTHLY_BASE_INFLATION + strength * 0.001
  let priceLevel = economy.priceLevel * (1 + Math.max(0.0005, monthlyInflation))

  // Annualised inflation for display
  const annualInflation = Math.pow(1 + Math.max(0.0005, monthlyInflation), 12) - 1

  // Detect current cycle phase from angle quadrant
  let phase: EconomicPhase
  if      (strength >  0.3 && cosine >  0) phase = 'expansion'
  else if (strength >  0   && cosine <= 0) phase = 'peak'
  else if (strength <= 0   && cosine <= 0) phase = 'contraction'
  else                                      phase = 'trough'

  // Phase transition events
  if (economy.phase !== phase) {
    type PhaseMsg = [string, GameEvent['kind']]
    const MSGS: Record<EconomicPhase, PhaseMsg> = {
      expansion:   ['📈 Economy enters expansion — wages rising, housing demand up.',      'success'],
      peak:        ['⚠ Economy peaks — growth slowing, inflation remains elevated.',        'warning'],
      contraction: ['📉 Recession begins — housing cools, wage growth stalls.',             'danger'],
      trough:      ['🔻 Economy bottoms out — housing affordable, recovery approaching.',   'info']
    }
    const [msg, kind] = MSGS[phase]
    events.push({ id: crypto.randomUUID(), message: msg, kind, gameTime: timeCtx })
  }

  // Random economic shocks
  let lastShockHour = economy.lastShockHour
  const hoursSinceShock = gameTime.totalHours - economy.lastShockHour

  if (hoursSinceShock >= SHOCK_COOLDOWN_HOURS && rng() < 0.15) {
    const roll = rng()
    let msg = ''
    let kind: GameEvent['kind'] = 'warning'

    if (roll < 0.18) {
      housingIndex = clamp(housingIndex + 0.22, 0.6, 1.8)
      msg  = '🏗 Housing boom — surge in demand is driving rents and prices sharply higher.'
      kind = 'warning'
    } else if (roll < 0.36) {
      housingIndex = clamp(housingIndex - 0.22, 0.6, 1.8)
      msg  = '🏚 Housing market correction — rents and property values fall sharply.'
      kind = 'info'
    } else if (roll < 0.52) {
      wageIndex = clamp(wageIndex + 0.13, 0.7, 1.4)
      msg  = '💼 Labour shortage — employers raising wages to compete for workers.'
      kind = 'success'
    } else if (roll < 0.67) {
      const spike = 0.01 + rng() * 0.025
      priceLevel *= (1 + spike)
      msg  = `💸 Inflation shock — cost of living jumps ${(spike * 100).toFixed(1)}% unexpectedly.`
      kind = 'danger'
    } else if (roll < 0.83) {
      wageIndex    = clamp(wageIndex    - 0.11, 0.7, 1.4)
      housingIndex = clamp(housingIndex - 0.14, 0.6, 1.8)
      msg  = '📉 Economic shock — businesses cutting jobs, housing demand drops.'
      kind = 'danger'
    } else {
      goodsIndex = clamp(goodsIndex + 0.10, 0.8, 1.3)
      msg  = '🛒 Supply chain disruption — cost of goods and services spikes.'
      kind = 'warning'
    }

    if (msg) {
      events.push({ id: crypto.randomUUID(), message: msg, kind, gameTime: timeCtx })
      lastShockHour = gameTime.totalHours
    }
  }

  // Annual economic summary (every January)
  if (gameTime.month === 1) {
    events.push({
      id: crypto.randomUUID(),
      message: `📊 ${gameTime.year} economy: inflation ${(annualInflation * 100).toFixed(1)}% · housing ${Math.round(housingIndex * 100)}% · wages ${Math.round(wageIndex * 100)}% of baseline.`,
      kind: 'info',
      gameTime: timeCtx
    })
  }

  return {
    economy: { priceLevel, housingIndex, wageIndex, goodsIndex, phase, cycleAngle: newAngle, annualInflation, lastShockHour },
    events
  }
}

// ── Market price helpers ───────────────────────────────────────────────────────

/** Live market rent (fluctuates monthly for renters) */
export function marketRent(def: Pick<HousingDef, 'monthlyRent'>, eco: EconomyState): number {
  return Math.round(def.monthlyRent * eco.priceLevel * eco.housingIndex)
}

/** Live move-in cost at time of signing */
export function marketMoveInCost(def: Pick<HousingDef, 'moveInCost'>, eco: EconomyState): number {
  return Math.round(def.moveInCost * eco.priceLevel * eco.housingIndex)
}

/** Live down payment at time of purchase */
export function marketDownPayment(def: Pick<HousingDef, 'downPayment'>, eco: EconomyState): number {
  return Math.round(def.downPayment * eco.priceLevel * eco.housingIndex)
}

/** Mortgage payment locked at time of purchase (owners get stability) */
export function marketMortgage(def: Pick<HousingDef, 'monthlyMortgage'>, eco: EconomyState): number {
  return Math.round(def.monthlyMortgage * eco.priceLevel * eco.housingIndex)
}

/** Current market wage for a job (reflects labour market conditions) */
export function marketWage(baseWage: number, eco: EconomyState): number {
  return Math.round(baseWage * eco.priceLevel * eco.wageIndex * 100) / 100
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
