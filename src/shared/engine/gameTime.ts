import type { GameTime } from '../types/game'

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Game starts Monday January 3, 2000 at 8:00 AM
export const GAME_START: GameTime = {
  year: 2000,
  month: 1,
  day: 3,
  hour: 8,
  dayOfWeek: 0,  // Monday
  totalHours: 0
}

export function advanceHour(t: GameTime): GameTime {
  let { year, month, day, hour, dayOfWeek, totalHours } = t

  hour += 1
  totalHours += 1

  if (hour >= 24) {
    hour = 0
    day += 1
    dayOfWeek = (dayOfWeek + 1) % 7

    const maxDay = DAYS_IN_MONTH[month] + (month === 2 && isLeapYear(year) ? 1 : 0)
    if (day > maxDay) {
      day = 1
      month += 1
      if (month > 12) {
        month = 1
        year += 1
      }
    }
  }

  return { year, month, day, hour, dayOfWeek, totalHours }
}

export function formatTime(t: GameTime): string {
  const h = t.hour % 12 === 0 ? 12 : t.hour % 12
  const ampm = t.hour < 12 ? 'AM' : 'PM'
  return `${h}:00 ${ampm}`
}

export function formatDate(t: GameTime): string {
  return `${DAY_NAMES[t.dayOfWeek]} ${MONTH_NAMES[t.month]} ${t.day}, ${t.year}`
}

export function isWeekday(t: GameTime): boolean {
  return t.dayOfWeek < 5
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
