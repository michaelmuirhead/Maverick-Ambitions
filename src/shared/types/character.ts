export type Gender = 'male' | 'female' | 'nonbinary'

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

export interface Background {
  id: BackgroundId
  name: string
  description: string
  flavour: string
  startingMoney: number
  statBonuses: Partial<CoreStats>
  startingEducation: EducationLevel
}

export interface Trait {
  id: TraitId
  name: string
  description: string
  effect: string
  statBonuses: Partial<CoreStats>
}

export type EducationLevel = 'none' | 'high-school' | 'some-college' | 'degree'

export interface CoreStats {
  intelligence: number
  charisma: number
  fitness: number
  streetSmarts: number
  creativity: number
  happiness: number
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
  background: Background
  traits: Trait[]
  stats: CoreStats
  money: number
  education: EducationLevel
  age: number
}
