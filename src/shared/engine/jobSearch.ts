import type { Character } from '../types/character'
import type { JobDef, JobOffer } from '../types/jobs'
import type { GameTime } from '../types/game'
import type { EconomyState } from '../types/economy'
import { JOBS } from '../data/jobs'
import { marketWage } from './economy'

/** Chance per search-hour of finding an offer (base 25%, boosted by CHA + STR) */
function offerChance(character: Character): number {
  const base = 0.25
  const chaBonus = (character.attributes.charisma / 100) * 0.20
  const strBonus = (character.attributes.streetSmarts / 100) * 0.10
  return Math.min(0.80, base + chaBonus + strBonus)
}

/** Returns true if the character meets the skill requirements for a job */
function meetsRequirements(character: Character, job: JobDef): boolean {
  for (const [skill, required] of Object.entries(job.requiredSkills)) {
    const playerSkill = character.skills[skill as keyof typeof character.skills]
    if (playerSkill < (required ?? 0)) return false
  }
  return true
}

/**
 * Called after a completed job-search activity.
 * Offer wages reflect current labour market conditions via the economy.
 * Returns an array of new job offers (may be empty).
 */
export function resolveJobSearch(
  character: Character,
  hoursSearched: number,
  existingOfferJobIds: string[],
  gameTime: GameTime,
  economy: EconomyState
): JobOffer[] {
  const eligible = JOBS.filter(
    (j) =>
      meetsRequirements(character, j) &&
      !existingOfferJobIds.includes(j.id)
  )

  if (eligible.length === 0) return []

  const chance = offerChance(character)
  const offers: JobOffer[] = []

  for (let i = 0; i < hoursSearched; i++) {
    if (Math.random() < chance) {
      const remaining = eligible.filter((j) => !offers.some((o) => o.job.id === j.id))
      if (remaining.length === 0) break
      const baseDef = remaining[Math.floor(Math.random() * remaining.length)]

      // Scale the offered wage to reflect current market conditions
      const marketDef: JobDef = { ...baseDef, hourlyWage: marketWage(baseDef.hourlyWage, economy) }

      offers.push({
        id: crypto.randomUUID(),
        job: marketDef,
        offeredAtHour: gameTime.totalHours
      })
    }
  }

  return offers
}

export const OFFER_EXPIRY_HOURS = 168  // 7 game days
