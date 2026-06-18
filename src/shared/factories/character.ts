import type {
  Attributes,
  Character,
  CharacterDraft,
  EducationLevel,
  Needs,
  Skills
} from '../types/character'
import { BACKGROUND_MAP } from '../data/backgrounds'
import { TRAIT_MAP } from '../data/traits'

const GAME_START_YEAR = 2000

const BASE_ATTRIBUTES: Attributes = {
  intelligence: 40,
  charisma: 40,
  streetSmarts: 40,
  creativity: 40,
  health: 90
}

const FULL_NEEDS: Needs = {
  energy: 100,
  hunger: 100,
  hygiene: 100,
  mood: 80,
  social: 70
}

// Education gives a head start on certain skills
const EDUCATION_SKILL_BONUS: Record<EducationLevel, Partial<Skills>> = {
  none:           { driving: 10 },
  'high-school':  { business: 5,  sales: 8,  finance: 5,  cooking: 8,  marketing: 5,  driving: 15 },
  'some-college': { business: 15, sales: 10, finance: 12, leadership: 8, marketing: 10, driving: 15 },
  degree:         { business: 25, sales: 15, finance: 20, leadership: 12, marketing: 15, driving: 15 }
}

const BASE_SKILLS: Skills = {
  business: 0, sales: 0, finance: 0,
  leadership: 0, cooking: 0, marketing: 0, driving: 0
}

export function buildCharacter(draft: CharacterDraft): Character {
  const background = BACKGROUND_MAP[draft.backgroundId]
  const traits = draft.traitIds.map((id) => TRAIT_MAP[id])

  // Attributes: base + background + trait bonuses
  const attributes: Attributes = { ...BASE_ATTRIBUTES }

  for (const [k, v] of Object.entries(background.attributeBonuses)) {
    const key = k as keyof Attributes
    attributes[key] = clamp(attributes[key] + (v ?? 0), 0, 100)
  }

  for (const trait of traits) {
    for (const [k, v] of Object.entries(trait.attributeBonuses)) {
      const key = k as keyof Attributes
      attributes[key] = clamp(attributes[key] + (v ?? 0), 0, 100)
    }
  }

  // Skills: education base + background bonus
  const skills: Skills = { ...BASE_SKILLS }
  const eduBonus = EDUCATION_SKILL_BONUS[background.startingEducation]

  for (const [k, v] of Object.entries(eduBonus)) {
    const key = k as keyof Skills
    skills[key] = clamp(skills[key] + (v ?? 0), 0, 100)
  }

  for (const [k, v] of Object.entries(background.skillBonuses)) {
    const key = k as keyof Skills
    skills[key] = clamp(skills[key] + (v ?? 0), 0, 100)
  }

  return {
    id: crypto.randomUUID(),
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    gender: draft.gender,
    birthYear: draft.birthYear,
    age: GAME_START_YEAR - draft.birthYear,
    background,
    traits,
    attributes,
    needs: { ...FULL_NEEDS },
    skills,
    money: background.startingMoney,
    education: background.startingEducation
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
