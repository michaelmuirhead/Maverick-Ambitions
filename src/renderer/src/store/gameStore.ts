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
import { GAME_START, advanceHour } from '@shared/engine/gameTime'
import { makeActivity } from '@shared/engine/activities'
import { applyTick } from '@shared/engine/tick'

interface GameStore {
  // ── State ─────────────────────────────────────────────────────────────────
  character: Character | null
  gameTime: GameTime
  clock: ClockState
  currentActivity: ScheduledActivity | null
  activityQueue: ScheduledActivity[]
  eventLog: GameEvent[]

  // ── Actions ───────────────────────────────────────────────────────────────
  startGame: (character: Character) => void
  tick: () => void
  togglePause: () => void
  setSpeed: (speed: ClockSpeed) => void
  enqueueActivity: (type: ActivityType, hours: number) => void
  clearQueue: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  character: null,
  gameTime: { ...GAME_START },
  clock: { paused: true, speed: 1 },
  currentActivity: null,
  activityQueue: [],
  eventLog: [],

  startGame: (character) => {
    set({
      character,
      gameTime: { ...GAME_START },
      clock: { paused: true, speed: 1 },
      currentActivity: null,
      activityQueue: [],
      eventLog: [
        {
          id: crypto.randomUUID(),
          message: `Welcome to your new life, ${character.firstName}. The clock is paused — schedule your first activity to begin.`,
          kind: 'info',
          gameTime: { ...GAME_START }
        }
      ]
    })
  },

  tick: () => {
    const { character, gameTime, currentActivity, activityQueue } = get()
    if (!character) return

    let activeActivity = currentActivity

    // If nothing active, pull from queue
    if (!activeActivity && activityQueue.length > 0) {
      const [next, ...rest] = activityQueue
      set({ currentActivity: next, activityQueue: rest })
      activeActivity = next
    }

    const { character: updatedChar, activityDone, events } = applyTick(
      character,
      activeActivity,
      gameTime
    )

    const newTime = advanceHour(gameTime)

    let nextActivity: ScheduledActivity | null = activeActivity
    let nextQueue = get().activityQueue

    if (activeActivity && activityDone) {
      // Pull next from queue
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

    // If queue just emptied, pause the clock
    const shouldPause = !nextActivity && nextQueue.length === 0

    set((state) => ({
      character: updatedChar,
      gameTime: newTime,
      currentActivity: nextActivity,
      activityQueue: nextQueue,
      eventLog: events.length > 0
        ? [...events, ...state.eventLog].slice(0, 100)
        : state.eventLog,
      clock: shouldPause
        ? { ...state.clock, paused: true }
        : state.clock
    }))

    if (shouldPause && !activeActivity) {
      // Already paused — no additional action needed
    }
  },

  togglePause: () =>
    set((state) => ({
      clock: { ...state.clock, paused: !state.clock.paused }
    })),

  setSpeed: (speed) =>
    set((state) => ({ clock: { ...state.clock, speed } })),

  enqueueActivity: (type, hours) => {
    const activity = makeActivity(type, hours)
    set((state) => {
      const newQueue = [...state.activityQueue, activity]
      return {
        activityQueue: newQueue,
        // If clock was paused due to empty queue, unpause now
        clock:
          !state.currentActivity && state.activityQueue.length === 0
            ? { ...state.clock, paused: false }
            : state.clock
      }
    })
  },

  clearQueue: () => set({ currentActivity: null, activityQueue: [] })
}))
