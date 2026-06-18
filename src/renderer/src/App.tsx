import { useState } from 'react'
import type { Character } from '@shared/types/character'
import MainMenu from './screens/MainMenu'
import NewGame from './screens/NewGame'
import TitleBar from './components/TitleBar'

export type Screen = 'main-menu' | 'new-game' | 'load-game' | 'settings' | 'game'

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('main-menu')
  const [character, setCharacter] = useState<Character | null>(null)

  const navigate = (to: Screen): void => setScreen(to)

  const handleCharacterCreated = (c: Character): void => {
    setCharacter(c)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      {screen === 'main-menu' && <MainMenu onNavigate={navigate} />}
      {screen === 'new-game' && (
        <NewGame onNavigate={navigate} onCharacterCreated={handleCharacterCreated} />
      )}
      {screen === 'game' && character && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--color-text-secondary)' }}>
          <h2 style={{ color: 'var(--color-accent)', fontSize: 28 }}>
            Welcome, {character.firstName} {character.lastName}
          </h2>
          <p>Age {character.age} · ${character.money.toLocaleString()} · {character.background.name}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Traits: {character.traits.map(t => t.name).join(' · ')}
          </p>
          <p style={{ marginTop: 24, fontSize: 12 }}>
            The game world is being built. Check back soon.
          </p>
          <button
            onClick={() => navigate('main-menu')}
            style={{ marginTop: 16, padding: '8px 24px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ← Back to Menu
          </button>
        </div>
      )}
    </div>
  )
}
