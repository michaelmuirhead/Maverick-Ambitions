import { create } from 'zustand'
import type { Character } from '@shared/types/character'
import type {
  ActivityType, ClockSpeed, ClockState,
  GameEvent, GameTime, ScheduledActivity
} from '@shared/types/game'
import type { Employment, JobOffer } from '@shared/types/jobs'
import type { Housing, HousingDef } from '@shared/types/housing'
import type { EconomyState } from '@shared/types/economy'
import { GAME_START, advanceHour } from '@shared/engine/gameTime'
import { makeActivity } from '@shared/engine/activities'
import { applyTick } from '@shared/engine/tick'
import { resolveJobSearch, OFFER_EXPIRY_HOURS } from '@shared/engine/jobSearch'
import { HOUSING_MAP, BACKGROUND_STARTING_HOUSING, makeHousing } from '@shared/data/housing'
import {
  initEconomy, advanceEconomy,
  marketRent, marketMoveInCost, marketDownPayment, marketMortgage
} from '@shared/engine/economy'

interface GameStore {
  character: Character | null
  gameTime: GameTime
  clock: ClockState
  currentActivity: ScheduledActivity | null
  activityQueue: ScheduledActivity[]
  eventLog: GameEvent[]
  jobOffers: JobOffer[]
  employment: Employment | null
  housing: Housing | null
  economy: EconomyState

  startGame: (character: Character) => void
  tick: () => void
  togglePause: () => void
  setSpeed: (speed: ClockSpeed) => void
  enqueueActivity: (type: ActivityType, hours: number) => void
  enqueueWorkShift: (hours: number) => void
  acceptOffer: (offerId: string) => void
  declineOffer: (offerId: string) => void
  quitJob: () => void
  moveIn: (def: HousingDef, owned: boolean) => void
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
  housing: null,
  economy: initEconomy(),

  startGame: (character) => {
    const startingHousingId = BACKGROUND_STARTING_HOUSING[character.background.id]
    const housingDef = HOUSING_MAP[startingHousingId]
    const housing = makeHousing(housingDef, false, 0)

    set({
      character,
      gameTime: { ...GAME_START },
      clock: { paused: true, speed: 1 },
      currentActivity: null,
      activityQueue: [],
      jobOffers: [],
      employment: null,
      housing,
      economy: initEconomy(),
      eventLog: [
        {
          id: crypto.randomUUID(),
          message: `Welcome, ${character.firstName}. You're living in a ${housingDef.name} and have $${character.money.toLocaleString()}. Find work to get started.`,
          kind: 'info',
          gameTime: { ...GAME_START }
        }
      ]
    })
  },

  tick: () => {
    const state = get()
    const { character, gameTime, activityQueue, employment, housing } = state
    if (!character) return

    let activeActivity = state.currentActivity

    if (!activeActivity && activityQueue.length > 0) {
      const [next, ...rest] = activityQueue
      set({ currentActivity: next, activityQueue: rest })
      activeActivity = next
    }

    const { character: updatedChar, activityDone, events } = applyTick(
      character,
      activeActivity,
      gameTime,
      employment,
      housing
    )

    const newTime = advanceHour(gameTime)
    const newEvents: GameEvent[] = [...events]
    const timeCtx = {
      day: newTime.day, month: newTime.month,
      year: newTime.year, hour: newTime.hour
    }

    let finalMoney = updatedChar.money
    let currentEconomy = state.economy
    let currentHousing = housing

    // ── Monthly processing: economy advance + rent ─────────────────────────────
    if (newTime.day === 1 && newTime.hour === 0) {
      // 1. Advance the economy
      const { economy: newEconomy, events: econEvents } = advanceEconomy(currentEconomy, newTime)
      newEvents.push(...econEvents)
      currentEconomy = newEconomy

      // 2. For renters: recalculate rent to reflect current market
      if (currentHousing && !currentHousing.owned && currentHousing.monthlyPayment > 0) {
        const newRent = marketRent(currentHousing.def, newEconomy)
        if (newRent !== currentHousing.monthlyPayment) {
          const dir = newRent > currentHousing.monthlyPayment ? 'up' : 'down'
          newEvents.push({
            id: crypto.randomUUID(),
            message: `Rent adjusted ${dir} to $${newRent.toLocaleString()}/mo — ${currentHousing.def.name}.`,
            kind: dir === 'up' ? 'warning' : 'info',
            gameTime: timeCtx
          })
        }
        currentHousing = { ...currentHousing, monthlyPayment: newRent }
      }

      // 3. Deduct rent or mortgage
      if (currentHousing && currentHousing.monthlyPayment > 0) {
        const paymentLabel = currentHousing.owned ? 'Mortgage' : 'Rent'
        finalMoney = Math.max(0, finalMoney - currentHousing.monthlyPayment)
        newEvents.push({
          id: crypto.randomUUID(),
          message: `${paymentLabel} paid: $${currentHousing.monthlyPayment.toLocaleString()} — ${currentHousing.def.name}.`,
          kind: 'info',
          gameTime: timeCtx
        })
        if (updatedChar.money < currentHousing.monthlyPayment) {
          newEvents.push({
            id: crypto.randomUUID(),
            message: `⚠ You couldn't fully cover your ${paymentLabel.toLowerCase()}! Get more income.`,
            kind: 'danger',
            gameTime: timeCtx
          })
        }
      }
    }

    // ── Resolve completed job-search ───────────────────────────────────────────
    if (activityDone && activeActivity?.type === 'job-search') {
      const existingIds = state.jobOffers.map((o) => o.job.id)
      const newOffers = resolveJobSearch(updatedChar, activeActivity.totalHours, existingIds, newTime, currentEconomy)
      if (newOffers.length > 0) {
        newEvents.push({
          id: crypto.randomUUID(),
          message: `Job search complete — ${newOffers.length} offer${newOffers.length > 1 ? 's' : ''} waiting.`,
          kind: 'success',
          gameTime: timeCtx
        })
        set((s) => ({ jobOffers: [...s.jobOffers, ...newOffers] }))
      } else {
        newEvents.push({
          id: crypto.randomUUID(),
          message: 'Job search complete — no leads this time.',
          kind: 'info',
          gameTime: timeCtx
        })
      }
    }

    // ── Expire old job offers ──────────────────────────────────────────────────
    const validOffers = state.jobOffers.filter(
      (o) => newTime.totalHours - o.offeredAtHour < OFFER_EXPIRY_HOURS
    )

    // ── Advance activity ───────────────────────────────────────────────────────
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

    let updatedEmployment = employment
    if (activeActivity?.type === 'work-shift' && employment) {
      updatedEmployment = {
        ...employment,
        totalHoursWorked: employment.totalHoursWorked + 1,
        totalEarned: employment.totalEarned + (activeActivity.incomeOverride ?? 0)
      }
    }

    set((s) => ({
      character: { ...updatedChar, money: finalMoney },
      gameTime: newTime,
      currentActivity: nextActivity,
      activityQueue: nextQueue,
      jobOffers: validOffers,
      employment: updatedEmployment,
      housing: currentHousing,
      economy: currentEconomy,
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
      clock: !s.currentActivity && s.activityQueue.length === 0
        ? { ...s.clock, paused: false }
        : s.clock
    }))
  },

  enqueueWorkShift: (hours) => {
    const { employment } = get()
    if (!employment) return
    const activity: ScheduledActivity = {
      type: 'work-shift',
      hoursRemaining: hours,
      totalHours: hours,
      incomeOverride: employment.job.hourlyWage
    }
    set((s) => ({
      activityQueue: [...s.activityQueue, activity],
      clock: !s.currentActivity && s.activityQueue.length === 0
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
      eventLog: [{
        id: crypto.randomUUID(),
        message: `You accepted the ${offer.job.title} position at ${offer.job.employer}. Wage: $${offer.job.hourlyWage}/hr.`,
        kind: 'success',
        gameTime: { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
      }, ...s.eventLog]
    }))
  },

  declineOffer: (offerId) =>
    set((s) => ({ jobOffers: s.jobOffers.filter((o) => o.id !== offerId) })),

  quitJob: () => {
    const { employment, gameTime } = get()
    if (!employment) return
    set((s) => ({
      employment: null,
      eventLog: [{
        id: crypto.randomUUID(),
        message: `You quit your job at ${employment.job.employer}.`,
        kind: 'warning',
        gameTime: { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
      }, ...s.eventLog]
    }))
  },

  moveIn: (def, owned) => {
    const { character, gameTime, economy } = get()
    if (!character) return

    // Use live market prices at time of move
    const cost = owned ? marketDownPayment(def, economy) : marketMoveInCost(def, economy)
    if (character.money < cost) return

    // Owners lock in today's mortgage rate; renters will drift with the market
    const monthlyPayment = owned ? marketMortgage(def, economy) : marketRent(def, economy)
    const newHousing: Housing = { def, owned, moveInHour: gameTime.totalHours, monthlyPayment }
    const monthlyLabel = owned ? 'mortgage' : 'rent'

    set((s) => ({
      housing: newHousing,
      character: { ...character, money: character.money - cost },
      eventLog: [{
        id: crypto.randomUUID(),
        message: `Moved into ${def.name}. ${owned ? 'Down payment' : 'Move-in cost'}: $${cost.toLocaleString()}. Monthly ${monthlyLabel}: $${monthlyPayment.toLocaleString()}.`,
        kind: 'success',
        gameTime: { day: gameTime.day, month: gameTime.month, year: gameTime.year, hour: gameTime.hour }
      }, ...s.eventLog]
    }))
  }
}))
