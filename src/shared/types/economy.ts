export type EconomicPhase = 'expansion' | 'peak' | 'contraction' | 'trough'

export interface EconomyState {
  /** Cumulative price level since game start (1.0 = baseline year 2000) */
  priceLevel: number
  /** Housing market multiplier — affects rent, move-in costs, down payments (0.6–1.8) */
  housingIndex: number
  /** Labour market multiplier — affects wage offers (0.7–1.4) */
  wageIndex: number
  /** Cost of goods / services multiplier (0.8–1.3) */
  goodsIndex: number
  /** Current phase in the business cycle */
  phase: EconomicPhase
  /** Internal position in the business cycle (0–2π), advances monthly */
  cycleAngle: number
  /** Annualised inflation rate as a decimal (e.g. 0.031 = 3.1%) */
  annualInflation: number
  /** totalHours when the last random economic shock fired (prevents clustering) */
  lastShockHour: number
}
