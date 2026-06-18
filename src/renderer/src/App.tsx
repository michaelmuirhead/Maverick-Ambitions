import { useState } from 'react'
import MainMenu from './screens/MainMenu'
import TitleBar from './components/TitleBar'

export type Screen = 'main-menu' | 'new-game' | 'load-game' | 'settings' | 'game'

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('main-menu')

  const navigate = (to: Screen): void => setScreen(to)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      {screen === 'main-menu' && <MainMenu onNavigate={navigate} />}
    </div>
  )
}
