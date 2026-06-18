import { create } from 'zustand'
import type { Character } from '@shared/types/character'
import type {
  ActivityType,
  ClockSpeed,
  ClockState,
  GameEvent,
  GameTime,
  ScheduledActivity
} from '@shared/types/game'
import type { Employment, JobOffer } from '@shared/types/jobs'
import { GAME_START, advanceHour } from '@shared/engine/gameTime'
import { makeActivity } from '@shared/engine/activities'
import { applyTick } from '@shared/engine/tick'
import { resolveJobSearch, OFFER_EXPIRY_HOURS } from '@shared/engine/jobSearch'

interface GameStore {
  // ── State ─────────────────────────────────────────────────────────────────
  character: Character | null
  gameTime: GameTime
  clock: ClockState
  currentActivity: ScheduledActivity | null
  activityQueue: ScheduledActivity[]
  eventLog: GameEvent[]
  jobOffers: JobOffer[]
  employment: Employment | null

  // ── Actions ───────────────────────────────────────────────────────────────
  startGame: (character: Character) => void
  tick: () => void
  togglePause: () => void
  setSpeed: (speed: ClockSpeed) => void
  enqueueActivity: (type: ActivityType, hours: number) => void
  enqueueWorkShift: (hours: number) => void
  acceptOffer: (offerId: string) => void
  declineOffer: (offerId: string) => void
  quitJob: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  character: null,
  gameTime: { ...GAME_START },
  clock: { paused: true, speed: 1 },
  currentActivity: null,
  activityQueue: [],
  eventLog: [],
  jobOffers: [],
  employment: null,

  startGame: (character) => {
    set({
      character,
      gameTime: { ...GAME_START },
      clock: { paused: true, speed: 1 },
      currentActivity: null,
      activityQueue: [],
      jobOffers: [],
      employment: null,
      eventLog: [
        {
          id: crypto.randomUUID(),
          message: `Welcome, ${character.firstName}. You have $${character.money.toLocaleString()} and no job. Schedule your first activity to begin.`,
          kind: 'info',
          gameTime: { ...GAME_START }
        }
      ]
    })
  },

  tick: () => {
    const state = get()
    const { character, gameTime, activityQueue, employment } = state
    if (!character) return

    let activeActivity = state.currentActivity

    // Pull from queue if nothing active
    if (!activeActivity && activityQueue.length > 0) {
      const [next, ...rest] = activityQueue
      set({ currentActivity: next, activityQueue: rest })
      activeActivity = next
    }

    const { character: updatedChar, activityDone, events } = applyTick(
      character,
      activeActivity,
      gameTime,
      employment
    )

    const newTime = advanceHour(gameTime)
    const newEvents: GameEvent[] = [...events]

    // Resolve completed job-search
    if (activityDone && activeActivity?.type === 'job-search') {
      const existingIds = state.jobOffers.map((o) => o.job.id)
      const newOffers = resolveJobSearch(
        updatedChar,
        activeActivity.totalHours,
        existingIds,
        newTime
      )
      if (newOffers.length > 0) {
        newEvents.push({
          id: crypto.randomUUID(),
          message: `Job search complete — ${newOffers.length} offer${newOffers.length > 1 ? 's' : ''} waiting.`,
          kind: 'success',
          gameTime: { day: newTime.day, month: newTime.month, year: newTime.year, hour: newTime.hour }
        })
        set((s) => ({ jobOffers: [...s.jobOffers, ...newOffers] }))
      } else {
        newEvents.push({
          id: crypto.randomUUID(),
          message: 'Job search complete — no leads this time. Try again or build your skills.',
          kind: 'info',
          gameTime: { day: newTime.day, month: newTime.month, year: newTime.year, hour: newTime.hour }
        })
      }
    }

    // Expire old job offers
    const validOffers = state.jobOffers.filter(
      (o) => newTime.totalHours - o.offeredAtHour < OFFER_EXPIRY_HOURS
    )

    // Advance activity queue
    let nextActivity: ScheduledActivity | null = activeActivity
    let nextQueue = get().activityQueue

    if (activeActivity && activityDone) {
      if (nextQueue.length > 0) {
        const [next, ...rest] = nextQueue
        nextActivity = next
        nextQueue = rest
      } else {
        nextActivity = null
      }
    } else if (activeActivity && !activityDone) {
      nextActivity = { ...activeActivity, hoursRemaining: activeActivity.hoursRemaining - 1 }
    }

    const shouldPause = !nextActivity && nextQueue.length === 0

    // Update employment hours if working
    let updatedEmployment = employment
    if (activeActivity?.type === 'work-shift' && employment) {
      updatedEmployment = {
        ...employment,
        totalHoursWorked: employment.totalHoursWorked + 1,
        totalEarned: employment.totalEarned + (activeActivity.incomeOverride ?? 0)
      }
    }

    set((s) => ({
      character: updatedChar,
      gameTime: newTime,
      currentActivity: nextActivity,
      activityQueue: nextQueue,
      jobOffers: validOffers,
      employment: updatedEmployment,
      eventLog: newEvents.length > 0
        ? [...newEvents, ...s.eventLog].slice(0, 100)
        : s.eventLog,
      clock: shouldPause ? { ...s.clock, paused: true } : s.clock
    }))
  },

  togglePause: () =>
    set((s) => ({ clock: { ...s.clock, paused: !s.clock.paused } })),

  setSpeed: (speed) =>
    set((s) => ({ clock: { ...s.clock, speed } })),

  enqueueActivity: (type, hours) => {
    const activity = makeActivity(type, hours)
    set((s) => ({
      activityQueue: [...s.activityQueue, activity],
      clock:
        !s.currentActivity && s.activityQueue.length === 0
          ? { ...s.clock, paused: false }
          : s.clock
    }))
  },

  enqueueWorkShift: (hours) => {
    const { employment } = get()
    if (!employment) return
    const income = employment.job.hourlyWage
    const activity: ScheduledActivity = {
      type: 'work-shift',
      hoursRemaining: hours,
      totalHours: hours,
      incomeOverride: income
    }
    set((s) => ({
      activityQueue: [...s.activityQueue, activity],
      clock:
        !s.currentActivity && s.activityQueue.length === 0
          ? { ...s.clock, paused: false }
          : s.clock
    }))
  },

  acceptOffer: (offerId) => {
    const { jobOffers, gameTime } = get()
    const offer = jobOffers.find((o) => o.id === offerId)
    if (!offer) return

    const employment: Employment = {
      job: offer.job,
      hiredAtHour: gameTime.totalHours,
      hiredDate: { day: gameTime.day, month: gameTime.month, year: gameTime.year },
      totalHoursWorked: 0,
      totalEarned: 0
    }

    set((s) => ({
      employment,
      jobOffers: s.jobOffers.filter((o) => o.id !== offerId),
      eventLog: [
        {
          id: crypto.randomUUID(),
          message: `You accepted the ${offer.job.title} position at ${offer.job.employer}. Wage: $${offer.job.hourlyWage}/hr.`,
          kind: 'success',
          gameTime: { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
        },
        ...s.eventLog
      ]
    }))
  },

  declineOffer: (offerId) => {
    set((s) => ({ jobOffers: s.jobOffers.filter((o) => o.id !== offerId) }))
  },

  quitJob: () => {
    const { employment, gameTime } = get()
    if (!employment) return
    set((s) => ({
      employment: null,
      eventLog: [
        {
          id: crypto.randomUUID(),
          message: `You quit your job at ${employment.job.employer}.`,
          kind: 'warning',
          gameTime: { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
        },
        ...s.eventLog
      ]
    }))
  }
}))
