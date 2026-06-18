import type { Skills } from './character'
import type { GameTime } from './game'

export type JobId =
  | 'warehouse-worker'
  | 'cafe-server'
  | 'cleaner'
  | 'retail-sales'
  | 'delivery-driver'
  | 'office-junior'

export interface JobDef {
  id: JobId
  title: string
  employer: string
  description: string
  hourlyWage: number
  /** Extra hourly income based on charisma (tips, commissions) */
  charismaBonus?: number
  shiftOptions: number[]       // hours per shift (e.g. [4, 8])
  requiredSkills: Partial<Skills>
  /** Skill that grows while working */
  primarySkill: keyof Skills | null
  secondarySkill?: keyof Skills
}

export interface JobOffer {
  id: string
  job: JobDef
  /** totalHours at time of offer — expires 168h (7 days) later */
  offeredAtHour: number
}

export interface Employment {
  job: JobDef
  hiredAtHour: number
  hiredDate: Pick<GameTime, 'day' | 'month' | 'year'>
  totalHoursWorked: number
  totalEarned: number
}
