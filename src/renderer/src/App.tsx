import { useState } from 'react'
import type { Character } from '@shared/types/character'
import { useGameStore } from './store/gameStore'
import MainMenu from './screens/MainMenu'
import NewGame from './screens/NewGame'
import Game from './screens/Game'
import TitleBar from './components/TitleBar'

export type Screen = 'main-menu' | 'new-game' | 'game'

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('main-menu')
  const startGame = useGameStore((s) => s.startGame)

  const navigate = (to: Screen): void => setScreen(to)

  const handleCharacterCreated = (character: Character): void => {
    startGame(character)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      {screen === 'main-menu' && <MainMenu onNavigate={navigate} />}
      {screen === 'new-game' && (
        <NewGame onNavigate={navigate} onCharacterCreated={handleCharacterCreated} />
      )}
      {screen === 'game' && <Game />}
    </div>
  )
}
