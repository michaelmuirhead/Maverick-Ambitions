import type { Character, Needs } from '../types/character'
import type { GameEvent, GameTime, ScheduledActivity } from '../types/game'
import type { Employment } from '../types/jobs'
import type { Housing } from '../types/housing'
import { ACTIVITY_MAP } from './activities'

const BASE_DECAY: Needs = {
  energy: -4,
  hunger: -3,
  hygiene: -2,
  mood: -1,
  social: -2
}

function performanceMultiplier(needs: Needs): number {
  const energyFactor = needs.energy / 100
  const moodFactor   = needs.mood   / 100
  return Math.max(0.5, energyFactor * 0.6 + moodFactor * 0.4)
}

interface TickResult {
  character: Character
  activityDone: boolean
  events: GameEvent[]
}

export function applyTick(
  character: Character,
  activity: ScheduledActivity | null,
  gameTime: GameTime,
  employment: Employment | null,
  housing: Housing | null
): TickResult {
  const events: GameEvent[] = []
  let needs = { ...character.needs }
  let money = character.money
  let skills = { ...character.skills }

  const activityDef = activity ? ACTIVITY_MAP[activity.type] : null

  // Base decay every hour
  needs = applyNeedsDelta(needs, BASE_DECAY)

  if (activityDef) {
    // Activity replaces base decay for needs it explicitly controls
    needs = applyNeedsDelta(needs, activityDef.needsDelta)
    for (const key of Object.keys(activityDef.needsDelta) as (keyof Needs)[]) {
      needs[key] = clampNeed(needs[key] - BASE_DECAY[key])
    }
  }

  // Housing: passive mood modifier every hour
  if (housing) {
    needs.mood = clampNeed(needs.mood + housing.def.moodPerHour)
  }

  // Housing: apply sleep quality multiplier when sleeping
  if (activity?.type === 'sleep' && housing) {
    const baseEnergyGain = activityDef?.needsDelta.energy ?? 35
    const bonus = baseEnergyGain * (housing.def.sleepQualityMultiplier - 1)
    needs.energy = clampNeed(needs.energy + bonus)
  }

  // Housing: apply hygiene multiplier when showering
  if (activity?.type === 'shower' && housing) {
    const baseHygieneGain = activityDef?.needsDelta.hygiene ?? 80
    const bonus = baseHygieneGain * (housing.def.hygieneMultiplier - 1)
    needs.hygiene = clampNeed(needs.hygiene + bonus)
  }

  // Income: use incomeOverride (work-shift) or activity def's incomePerHour
  const income = activity?.incomeOverride ?? activityDef?.incomePerHour ?? 0
  if (income !== 0) {
    if (activity?.type === 'work-shift') {
      const perf = performanceMultiplier(character.needs)
      money = Math.max(0, money + income * perf)
    } else {
      money = Math.max(0, money + income)
    }
  }

  // Charisma-based tips for café/delivery
  if (activity?.type === 'work-shift' && employment?.job.charismaBonus) {
    money += employment.job.charismaBonus * character.attributes.charisma
  }

  // Skill XP from activity defs (socialise → sales, etc.)
  if (activityDef?.skillXp) {
    for (const [k, xp] of Object.entries(activityDef.skillXp)) {
      skills[k as keyof typeof skills] = Math.min(
        100,
        skills[k as keyof typeof skills] + (xp ?? 0)
      )
    }
  }

  // Skill XP from work
  if (activity?.type === 'work-shift' && employment) {
    const { primarySkill, secondarySkill } = employment.job
    if (primarySkill) skills[primarySkill] = Math.min(100, skills[primarySkill] + 0.5)
    if (secondarySkill) skills[secondarySkill] = Math.min(100, skills[secondarySkill] + 0.25)
  }

  // Low-need warnings at 40 and 20 thresholds
  const timeCtx = {
    day: gameTime.day, month: gameTime.month,
    year: gameTime.year, hour: gameTime.hour
  }
  for (const [key, val] of Object.entries(needs) as [keyof Needs, number][]) {
    if (val <= 20 && Math.floor(character.needs[key]) > 20) {
      events.push({
        id: crypto.randomUUID(),
        message: `${NEED_LABELS[key]} is critically low!`,
        kind: 'danger',
        gameTime: timeCtx
      })
    } else if (val <= 40 && Math.floor(character.needs[key]) > 40) {
      events.push({
        id: crypto.randomUUID(),
        message: `${NEED_LABELS[key]} is getting low.`,
        kind: 'warning',
        gameTime: timeCtx
      })
    }
  }

  // Mood penalty when multiple needs are critical
  if (Object.values(needs).filter((v) => v < 20).length >= 3) {
    needs.mood = clampNeed(needs.mood - 5)
  }

  return {
    character: { ...character, needs, money, skills },
    activityDone: activity ? activity.hoursRemaining <= 1 : false,
    events
  }
}

function applyNeedsDelta(needs: Needs, delta: Partial<Needs>): Needs {
  const result = { ...needs }
  for (const [k, v] of Object.entries(delta) as [keyof Needs, number][]) {
    result[k] = clampNeed(result[k] + v)
  }
  return result
}

function clampNeed(n: number): number {
  return Math.min(100, Math.max(0, n))
}

const NEED_LABELS: Record<keyof Needs, string> = {
  energy: 'Energy', hunger: 'Hunger', hygiene: 'Hygiene',
  mood: 'Mood', social: 'Social'
}
