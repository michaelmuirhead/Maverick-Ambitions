import type { ActivityType, ScheduledActivity } from '../types/game'
import type { Needs, Skills } from '../types/character'

export interface ActivityDef {
  type: ActivityType
  label: string
  description: string
  icon: string
  /** Fixed duration in hours, or null if player chooses */
  fixedHours: number | null
  /** Options when duration is player-chosen */
  durationOptions?: number[]
  /** Per-hour delta applied to needs while this activity is active */
  needsDelta: Partial<Needs>
  /** Per-hour skill XP granted */
  skillXp?: Partial<Skills>
  /** Hourly income (positive) or expense (negative) */
  incomePerHour?: number
}

export const ACTIVITIES: ActivityDef[] = [
  {
    type: 'sleep',
    label: 'Sleep',
    description: 'Rest and recover your energy.',
    icon: '🛌',
    fixedHours: null,
    durationOptions: [5, 6, 7, 8, 9],
    needsDelta: { energy: 35, hunger: -1, hygiene: -1, mood: 2, social: -1 }
  },
  {
    type: 'eat',
    label: 'Eat',
    description: 'Grab a meal and refuel.',
    icon: '🍽️',
    fixedHours: 1,
    needsDelta: { hunger: 50, mood: 5, energy: -1 },
    incomePerHour: -8  // meal cost
  },
  {
    type: 'shower',
    label: 'Shower',
    description: 'Clean up and feel human again.',
    icon: '🚿',
    fixedHours: 1,
    needsDelta: { hygiene: 80, mood: 8, energy: -1 }
  },
  {
    type: 'exercise',
    label: 'Exercise',
    description: 'Work out to build fitness over time.',
    icon: '🏋️',
    fixedHours: null,
    durationOptions: [1, 2],
    needsDelta: { energy: -6, hunger: -5, hygiene: -8, mood: 8, social: -1 }
  },
  {
    type: 'socialise',
    label: 'Socialise',
    description: 'Spend time with people. Builds Charisma slowly.',
    icon: '👥',
    fixedHours: null,
    durationOptions: [1, 2, 3],
    needsDelta: { energy: -2, hunger: -2, social: 30, mood: 8 },
    skillXp: { sales: 0.3 },
    incomePerHour: -5  // going out costs money
  },
  {
    type: 'leisure',
    label: 'Leisure',
    description: 'Relax at home. Watch TV, read, unwind.',
    icon: '🎮',
    fixedHours: null,
    durationOptions: [1, 2, 3],
    needsDelta: { energy: -1, mood: 10, social: 3, hunger: -2 }
  },
  {
    type: 'job-search',
    label: 'Job Search',
    description: 'Hunt for employment. Results depend on your skills and charisma.',
    icon: '📋',
    fixedHours: null,
    durationOptions: [1, 2, 3, 4],
    needsDelta: { energy: -4, mood: -3, hunger: -3, social: -1 }
  },
  {
    type: 'work-shift',
    label: 'Work Shift',
    description: 'Put in a shift at your job. Earn your wage and build skills.',
    icon: '💼',
    fixedHours: null,
    durationOptions: [4, 8],
    needsDelta: { energy: -6, hunger: -4, hygiene: -3, mood: -2, social: -2 }
    // incomePerHour comes from the job via ScheduledActivity.incomeOverride
  }
]

export const ACTIVITY_MAP = Object.fromEntries(
  ACTIVITIES.map((a) => [a.type, a])
) as Record<ActivityType, ActivityDef>

export function makeActivity(type: ActivityType, hours: number): ScheduledActivity {
  return { type, hoursRemaining: hours, totalHours: hours }
}
