export type HousingId =
  | 'couch-surfing'
  | 'shared-room'
  | 'studio'
  | 'apartment-1bed'
  | 'apartment-2bed'
  | 'townhouse'
  | 'house-modest'
  | 'condo-upscale'
  | 'house-luxury'
  | 'mansion'

export interface HousingDef {
  id: HousingId
  name: string
  description: string
  tier: number
  /** Monthly rent (0 if owned or couch surfing) */
  monthlyRent: number
  /** Cost to move in as a renter: first month + security deposit */
  moveInCost: number
  /** null = cannot be purchased */
  purchasePrice: number | null
  downPayment: number
  /** Monthly mortgage when owned */
  monthlyMortgage: number
  /** Multiplier on energy restored per sleep hour (base = 35) */
  sleepQualityMultiplier: number
  /** Passive mood change per hour while living here */
  moodPerHour: number
  /** Multiplier on hygiene restored when showering */
  hygieneMultiplier: number
  bedrooms: number
  canRent: boolean
  canBuy: boolean
}

/** The player's current housing situation */
export interface Housing {
  def: HousingDef
  owned: boolean
  /** totalHours at time of move-in (for tenure tracking) */
  moveInHour: number
  /** Monthly payment currently being deducted */
  monthlyPayment: number
}
