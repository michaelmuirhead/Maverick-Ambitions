export type Gender = 'male' | 'female'

export type BackgroundId =
  | 'hustler'
  | 'middle-ground'
  | 'heir'
  | 'scholar'
  | 'immigrant-dream'

export type TraitId =
  | 'ambitious'
  | 'charismatic'
  | 'analytical'
  | 'creative'
  | 'frugal'
  | 'risk-taker'
  | 'athletic'
  | 'street-smart'
  | 'charming'
  | 'workaholic'

export type EducationLevel = 'none' | 'high-school' | 'some-college' | 'degree'

// ── Permanent attributes ──────────────────────────────────────────────────────
// Set at creation, grow very slowly through sustained actions over years.
// Health starts near-max at 18 and degrades with age and prolonged needs neglect.
export interface Attributes {
  intelligence: number   // learning speed, business decisions
  charisma: number       // negotiation, hiring, relationships
  streetSmarts: number   // spotting opportunities/scams, street deals
  creativity: number     // marketing, unlocking creative businesses
  health: number         // energy cap, longevity
}

// ── Daily needs ───────────────────────────────────────────────────────────────
// Decay every in-game day. When they drop low they penalise skill performance
// and attribute checks.
export interface Needs {
  energy: number    // depleted by work/activity, restored by sleep
  hunger: number    // depleted over time, restored by eating
  hygiene: number   // depleted over time, restored by showering
  mood: number      // influenced by all other needs + events + relationships
  social: number    // depleted by isolation, restored by people interactions
}

// ── Skills ────────────────────────────────────────────────────────────────────
// Learned by working, running businesses, or through education.
// Each 0–100; they unlock new actions and improve outcomes as they level up.
export interface Skills {
  business: number    // managing operations, unlocking larger ventures
  sales: number       // closing deals, negotiating prices
  finance: number     // investing, reading markets, accounting
  leadership: number  // managing employees, staff retention
  cooking: number     // required for food businesses
  marketing: number   // advertising effectiveness, brand building
  driving: number     // delivery/transport businesses, logistics
}

export interface Background {
  id: BackgroundId
  name: string
  description: string
  flavour: string
  startingMoney: number
  attributeBonuses: Partial<Attributes>
  skillBonuses: Partial<Skills>
  startingEducation: EducationLevel
}

export interface Trait {
  id: TraitId
  name: string
  description: string
  effect: string
  attributeBonuses: Partial<Attributes>
}

/** The data collected during character creation */
export interface CharacterDraft {
  firstName: string
  lastName: string
  gender: Gender
  birthYear: number
  backgroundId: BackgroundId
  traitIds: TraitId[]
}

/** A fully resolved, playable character */
export interface Character {
  id: string
  firstName: string
  lastName: string
  gender: Gender
  birthYear: number
  age: number
  background: Background
  traits: Trait[]
  attributes: Attributes
  needs: Needs
  skills: Skills
  money: number
  education: EducationLevel
}
