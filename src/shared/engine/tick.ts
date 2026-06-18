import type { Character, Needs } from '../types/character'
import type { GameEvent, GameTime, ScheduledActivity } from '../types/game'
import { ACTIVITY_MAP } from './activities'

const BASE_DECAY: Needs = {
  energy: -4,
  hunger: -3,
  hygiene: -2,
  mood: -1,
  social: -2
}

interface TickResult {
  character: Character
  activityDone: boolean
  events: GameEvent[]
}

export function applyTick(
  character: Character,
  activity: ScheduledActivity | null,
  gameTime: GameTime
): TickResult {
  const events: GameEvent[] = []
  let needs = { ...character.needs }
  let money = character.money
  let skills = { ...character.skills }

  const activityDef = activity ? ACTIVITY_MAP[activity.type] : null

  // Apply base decay every hour regardless of activity
  needs = applyNeedsDelta(needs, BASE_DECAY)

  if (activityDef) {
    // Activity overrides/supplements the base delta
    needs = applyNeedsDelta(needs, activityDef.needsDelta)
    // Undo the base decay for stats the activity explicitly manages
    for (const key of Object.keys(activityDef.needsDelta) as (keyof Needs)[]) {
      needs[key] = clampNeed(needs[key] - BASE_DECAY[key])
    }
  }

  // Apply income/cost from activity
  if (activityDef?.incomePerHour) {
    money = Math.max(0, money + activityDef.incomePerHour)
  }

  // Apply skill XP
  if (activityDef?.skillXp) {
    for (const [k, xp] of Object.entries(activityDef.skillXp)) {
      const key = k as keyof typeof skills
      skills[key] = Math.min(100, skills[key] + (xp ?? 0))
    }
  }

  // Low-need warnings (only fire at thresholds to avoid spam)
  const timeCtx = { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
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

  // Mood is penalised when multiple needs are critically low
  const criticalCount = Object.values(needs).filter((v) => v < 20).length
  if (criticalCount >= 3) {
    needs.mood = clampNeed(needs.mood - 5)
  }

  const activityDone = activity ? activity.hoursRemaining <= 1 : false

  return {
    character: { ...character, needs, money, skills },
    activityDone,
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
  energy: 'Energy',
  hunger: 'Hunger',
  hygiene: 'Hygiene',
  mood: 'Mood',
  social: 'Social'
}
