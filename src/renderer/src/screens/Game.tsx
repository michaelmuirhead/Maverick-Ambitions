import { useState } from 'react'
import { useGameClock } from '../hooks/useGameClock'
import TopBar from '../components/HUD/TopBar'
import NeedsPanel from '../components/HUD/NeedsPanel'
import ActivityPanel from '../components/HUD/ActivityPanel'
import EventLog from '../components/HUD/EventLog'
import HousingModal from '../components/HUD/HousingModal'
import styles from './Game.module.css'

export default function Game(): JSX.Element {
  useGameClock()
  const [housingOpen, setHousingOpen] = useState(false)

  return (
    <div className={styles.root}>
      <TopBar onOpenHousing={() => setHousingOpen(true)} />
      <div className={styles.body}>
        <NeedsPanel onOpenHousing={() => setHousingOpen(true)} />
        <ActivityPanel />
        <EventLog />
      </div>
      <HousingModal open={housingOpen} onClose={() => setHousingOpen(false)} />
    </div>
  )
}
