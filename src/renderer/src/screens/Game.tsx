import { useGameClock } from '../hooks/useGameClock'
import TopBar from '../components/HUD/TopBar'
import NeedsPanel from '../components/HUD/NeedsPanel'
import ActivityPanel from '../components/HUD/ActivityPanel'
import EventLog from '../components/HUD/EventLog'
import styles from './Game.module.css'

export default function Game(): JSX.Element {
  useGameClock()

  return (
    <div className={styles.root}>
      <TopBar />
      <div className={styles.body}>
        <NeedsPanel />
        <ActivityPanel />
        <EventLog />
      </div>
    </div>
  )
}
