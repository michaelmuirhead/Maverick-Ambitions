export interface GameTime {
  year: number
  month: number     // 1–12
  day: number       // 1–31
  hour: number      // 0–23
  dayOfWeek: number // 0=Mon … 6=Sun
  totalHours: number
}

export type ClockSpeed = 1 | 2 | 4

export interface ClockState {
  paused: boolean
  speed: ClockSpeed
}

export type ActivityType =
  | 'sleep'
  | 'eat'
  | 'shower'
  | 'exercise'
  | 'socialise'
  | 'leisure'
  | 'job-search'

export interface ScheduledActivity {
  type: ActivityType
  hoursRemaining: number
  totalHours: number
}

export type GameEventKind = 'info' | 'warning' | 'success' | 'danger'

export interface GameEvent {
  id: string
  message: string
  kind: GameEventKind
  gameTime: Pick<GameTime, 'day' | 'month' | 'year' | 'hour'>
}
