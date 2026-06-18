import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

const BASE_INTERVAL_MS = 1000 // 1 second per game hour at 1×

export function useGameClock(): void {
  const tick = useGameStore((s) => s.tick)
  const togglePause = useGameStore((s) => s.togglePause)
  const paused = useGameStore((s) => s.clock.paused)
  const speed = useGameStore((s) => s.clock.speed)
  const character = useGameStore((s) => s.character)

  const tickRef = useRef(tick)
  tickRef.current = tick

  // Tick interval
  useEffect(() => {
    if (paused || !character) return

    const interval = BASE_INTERVAL_MS / speed
    const id = setInterval(() => tickRef.current(), interval)
    return () => clearInterval(id)
  }, [paused, speed, character])

  // Space bar toggles pause
  useEffect(() => {
    if (!character) return

    const onKey = (e: KeyboardEvent): void => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        togglePause()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [character, togglePause])
}
