import type { HousingDef, HousingId } from '../types/housing'
import type { BackgroundId } from '../types/character'

export const HOUSING: HousingDef[] = [
  {
    id: 'couch-surfing',
    name: 'Couch Surfing',
    description: 'Crashing on a friend\'s sofa. No privacy, no stability, no dignity. Temporary at best.',
    tier: 1,
    monthlyRent: 0,
    moveInCost: 0,
    purchasePrice: null,
    downPayment: 0,
    monthlyMortgage: 0,
    sleepQualityMultiplier: 0.55,
    moodPerHour: -2,
    hygieneMultiplier: 0.7,
    bedrooms: 0,
    canRent: false,
    canBuy: false
  },
  {
    id: 'shared-room',
    name: 'Shared Room',
    description: 'A single room in a boarding house. Shared bathroom, paper-thin walls. It\'s a start.',
    tier: 2,
    monthlyRent: 300,
    moveInCost: 600,
    purchasePrice: null,
    downPayment: 0,
    monthlyMortgage: 0,
    sleepQualityMultiplier: 0.75,
    moodPerHour: -1,
    hygieneMultiplier: 0.8,
    bedrooms: 0,
    canRent: true,
    canBuy: false
  },
  {
    id: 'studio',
    name: 'Studio Apartment',
    description: 'Your own space. One room does it all — bedroom, living room, kitchen corner. But it\'s yours.',
    tier: 3,
    monthlyRent: 650,
    moveInCost: 1300,
    purchasePrice: null,
    downPayment: 0,
    monthlyMortgage: 0,
    sleepQualityMultiplier: 0.9,
    moodPerHour: 0,
    hygieneMultiplier: 1.0,
    bedrooms: 0,
    canRent: true,
    canBuy: false
  },
  {
    id: 'apartment-1bed',
    name: '1-Bedroom Apartment',
    description: 'A proper apartment. Separate bedroom, living room, full kitchen. Starting to feel like an adult.',
    tier: 4,
    monthlyRent: 950,
    moveInCost: 1900,
    purchasePrice: null,
    downPayment: 0,
    monthlyMortgage: 0,
    sleepQualityMultiplier: 1.0,
    moodPerHour: 0.3,
    hygieneMultiplier: 1.0,
    bedrooms: 1,
    canRent: true,
    canBuy: false
  },
  {
    id: 'apartment-2bed',
    name: '2-Bedroom Apartment',
    description: 'Space to breathe. A spare room for guests, a home office, or a future roommate.',
    tier: 5,
    monthlyRent: 1400,
    moveInCost: 2800,
    purchasePrice: 180000,
    downPayment: 36000,
    monthlyMortgage: 1000,
    sleepQualityMultiplier: 1.1,
    moodPerHour: 0.6,
    hygieneMultiplier: 1.05,
    bedrooms: 2,
    canRent: true,
    canBuy: true
  },
  {
    id: 'townhouse',
    name: 'Townhouse',
    description: 'A proper townhouse with a small garden and a garage. Neighbours, but space between you.',
    tier: 6,
    monthlyRent: 1800,
    moveInCost: 3600,
    purchasePrice: 240000,
    downPayment: 48000,
    monthlyMortgage: 1200,
    sleepQualityMultiplier: 1.15,
    moodPerHour: 0.9,
    hygieneMultiplier: 1.1,
    bedrooms: 2,
    canRent: true,
    canBuy: true
  },
  {
    id: 'house-modest',
    name: 'Modest House',
    description: 'A detached house in a quiet street. Backyard, driveway, proper kitchen. Real estate on the résumé.',
    tier: 7,
    monthlyRent: 2200,
    moveInCost: 4400,
    purchasePrice: 300000,
    downPayment: 60000,
    monthlyMortgage: 1500,
    sleepQualityMultiplier: 1.2,
    moodPerHour: 1.2,
    hygieneMultiplier: 1.1,
    bedrooms: 3,
    canRent: true,
    canBuy: true
  },
  {
    id: 'condo-upscale',
    name: 'Upscale Condo',
    description: 'High-floor city views, concierge, gym in the building. You\'ve made it to a different tier.',
    tier: 8,
    monthlyRent: 0,
    moveInCost: 0,
    purchasePrice: 450000,
    downPayment: 90000,
    monthlyMortgage: 2100,
    sleepQualityMultiplier: 1.25,
    moodPerHour: 1.8,
    hygieneMultiplier: 1.15,
    bedrooms: 2,
    canRent: false,
    canBuy: true
  },
  {
    id: 'house-luxury',
    name: 'Luxury House',
    description: 'Gated. Four bedrooms, home theatre, pool. The kind of address that opens doors.',
    tier: 9,
    monthlyRent: 0,
    moveInCost: 0,
    purchasePrice: 800000,
    downPayment: 160000,
    monthlyMortgage: 3800,
    sleepQualityMultiplier: 1.3,
    moodPerHour: 2.5,
    hygieneMultiplier: 1.2,
    bedrooms: 4,
    canRent: false,
    canBuy: true
  },
  {
    id: 'mansion',
    name: 'Mansion',
    description: 'Staff quarters. Wine cellar. Six bedrooms. A statement. This is what it was all for.',
    tier: 10,
    monthlyRent: 0,
    moveInCost: 0,
    purchasePrice: 2500000,
    downPayment: 500000,
    monthlyMortgage: 10000,
    sleepQualityMultiplier: 1.35,
    moodPerHour: 3.5,
    hygieneMultiplier: 1.25,
    bedrooms: 6,
    canRent: false,
    canBuy: true
  }
]

export const HOUSING_MAP = Object.fromEntries(
  HOUSING.map((h) => [h.id, h])
) as Record<HousingId, HousingDef>

/** Starting housing by background */
export const BACKGROUND_STARTING_HOUSING: Record<BackgroundId, HousingId> = {
  hustler:          'shared-room',
  'middle-ground':  'studio',
  heir:             'apartment-1bed',
  scholar:          'studio',
  'immigrant-dream': 'shared-room'
}

export function makeHousing(
  def: HousingDef,
  owned: boolean,
  moveInHour: number
): import('../types/housing').Housing {
  return {
    def,
    owned,
    moveInHour,
    monthlyPayment: owned ? def.monthlyMortgage : def.monthlyRent
  }
}
