import type { Character, CharacterDraft, CoreStats } from '../types/character'
import { BACKGROUND_MAP } from '../data/backgrounds'
import { TRAIT_MAP } from '../data/traits'

const BASE_STATS: CoreStats = {
  intelligence: 40,
  charisma: 40,
  fitness: 40,
  streetSmarts: 40,
  creativity: 40,
  happiness: 60
}

const GAME_START_YEAR = 2000

export function buildCharacter(draft: CharacterDraft): Character {
  const background = BACKGROUND_MAP[draft.backgroundId]
  const traits = draft.traitIds.map((id) => TRAIT_MAP[id])

  const stats: CoreStats = { ...BASE_STATS }

  // Apply background bonuses
  for (const [key, val] of Object.entries(background.statBonuses)) {
    const k = key as keyof CoreStats
    stats[k] = clamp(stats[k] + (val ?? 0), 0, 100)
  }

  // Apply trait bonuses
  for (const trait of traits) {
    for (const [key, val] of Object.entries(trait.statBonuses)) {
      const k = key as keyof CoreStats
      stats[k] = clamp(stats[k] + (val ?? 0), 0, 100)
    }
  }

  return {
    id: crypto.randomUUID(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    gender: draft.gender,
    birthYear: draft.birthYear,
    background,
    traits,
    stats,
    money: background.startingMoney,
    education: background.startingEducation,
    age: GAME_START_YEAR - draft.birthYear
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
