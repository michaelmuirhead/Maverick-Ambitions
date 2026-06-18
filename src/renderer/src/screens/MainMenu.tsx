import type { Screen } from '../App'
import styles from './MainMenu.module.css'

interface Props {
  onNavigate: (screen: Screen) => void
}

const VERSION = '0.1.0'

export default function MainMenu({ onNavigate }: Props): JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.cityscape} aria-hidden="true">
        <CityScape />
      </div>

      <div className={styles.overlay} />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.tagline}>YOUR STORY. YOUR EMPIRE.</div>
          <h1 className={styles.title}>
            <span className={styles.titleMaverick}>MAVERICK</span>
            <span className={styles.titleAmbitions}>AMBITIONS</span>
          </h1>
          <div className={styles.subtitle}>Life simulation · Business empire · Your choices</div>
        </header>

        <nav className={styles.menu}>
          <MenuButton
            label="New Game"
            description="Start a new life from scratch"
            primary
            onClick={() => onNavigate('new-game')}
          />
          <MenuButton
            label="Load Game"
            description="Continue a saved game"
            disabled
            onClick={() => {}}
          />
          <MenuButton
            label="Settings"
            description="Audio, display, controls"
            disabled
            onClick={() => {}}
          />
          <MenuButton
            label="Exit"
            description="Close the game"
            onClick={() => window.api?.closeWindow()}
          />
        </nav>
      </div>

      <footer className={styles.footer}>
        <span>v{VERSION}</span>
        <span>Early Development</span>
      </footer>
    </div>
  )
}

interface MenuButtonProps {
  label: string
  description: string
  primary?: boolean
  disabled?: boolean
  onClick: () => void
}

function MenuButton({ label, description, primary, disabled, onClick }: MenuButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.menuBtn} ${primary ? styles.menuBtnPrimary : ''} ${disabled ? styles.menuBtnDisabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className={styles.menuBtnLabel}>{label}</span>
      <span className={styles.menuBtnDesc}>{description}</span>
    </button>
  )
}

function CityScape(): JSX.Element {
  const buildings = [
    { x: 0,    w: 60,  h: 180 },
    { x: 55,   w: 80,  h: 260 },
    { x: 130,  w: 50,  h: 200 },
    { x: 175,  w: 100, h: 320 },
    { x: 270,  w: 70,  h: 240 },
    { x: 335,  w: 55,  h: 190 },
    { x: 385,  w: 90,  h: 380 },
    { x: 470,  w: 60,  h: 280 },
    { x: 525,  w: 120, h: 440 },
    { x: 640,  w: 75,  h: 300 },
    { x: 710,  w: 55,  h: 220 },
    { x: 760,  w: 100, h: 360 },
    { x: 855,  w: 65,  h: 260 },
    { x: 915,  w: 85,  h: 310 },
    { x: 995,  w: 50,  h: 200 },
    { x: 1040, w: 70,  h: 250 },
    { x: 1105, w: 110, h: 420 },
    { x: 1210, w: 55,  h: 190 },
    { x: 1260, w: 80,  h: 280 },
  ]

  const svgHeight = 500

  return (
    <svg
      viewBox={`0 0 1400 ${svgHeight}`}
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070b14" />
          <stop offset="100%" stopColor="#0d1a3a" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2848" />
          <stop offset="100%" stopColor="#0d1525" />
        </linearGradient>
        <linearGradient id="buildingGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#152038" />
          <stop offset="100%" stopColor="#0a1020" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1400" height={svgHeight} fill="url(#skyGrad)" />

      {/* Moon */}
      <circle cx="1300" cy="80" r="28" fill="#f0b429" opacity="0.15" />
      <circle cx="1300" cy="80" r="22" fill="#f0b429" opacity="0.08" />
      <circle cx="1300" cy="80" r="14" fill="#f0e4a0" opacity="0.4" />

      {/* Stars */}
      {[
        [100, 60], [200, 30], [350, 80], [500, 40], [650, 20], [800, 55],
        [950, 35], [1050, 65], [1150, 25], [1250, 50], [140, 100], [420, 50],
        [700, 90], [900, 15], [1100, 75]
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.5 : 1} fill="#e8ecf4" opacity={0.3 + (i % 4) * 0.1} />
      ))}

      {/* Background buildings (layer 2 - darker) */}
      {buildings.map((b, i) => (
        <rect
          key={`bg-${i}`}
          x={b.x + 20}
          y={svgHeight - b.h * 0.65}
          width={b.w * 0.8}
          height={b.h * 0.65}
          fill="url(#buildingGrad2)"
          opacity={0.5}
        />
      ))}

      {/* Foreground buildings */}
      {buildings.map((b, i) => (
        <g key={`fg-${i}`}>
          <rect
            x={b.x}
            y={svgHeight - b.h}
            width={b.w}
            height={b.h}
            fill="url(#buildingGrad)"
          />
          {/* Windows */}
          {Array.from({ length: Math.floor(b.h / 28) }).map((_, row) =>
            Array.from({ length: Math.floor(b.w / 18) }).map((_, col) => {
              const lit = Math.random() > 0.55
              return lit ? (
                <rect
                  key={`w-${i}-${row}-${col}`}
                  x={b.x + 6 + col * 18}
                  y={svgHeight - b.h + 12 + row * 28}
                  width={8}
                  height={12}
                  fill="#f0b429"
                  opacity={0.15 + Math.random() * 0.25}
                />
              ) : null
            })
          )}
        </g>
      ))}

      {/* Ground */}
      <rect x="0" y={svgHeight - 4} width="1400" height="4" fill="#0d1525" />
    </svg>
  )
}
