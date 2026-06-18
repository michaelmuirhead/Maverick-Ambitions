import type { Background } from '../types/character'

export const BACKGROUNDS: Background[] = [
  {
    id: 'hustler',
    name: 'The Hustler',
    description: 'Born with nothing, you learned to survive on wit and grit. Every dollar was earned the hard way.',
    flavour: '"The streets were my classroom."',
    startingMoney: 500,
    startingEducation: 'high-school',
    statBonuses: { streetSmarts: 25, charisma: 10, fitness: 5, intelligence: -5 }
  },
  {
    id: 'middle-ground',
    name: 'Middle Ground',
    description: 'A stable upbringing — not rich, not poor. You have a solid foundation but no head start.',
    flavour: '"Average start. Unlimited potential."',
    startingMoney: 2500,
    startingEducation: 'high-school',
    statBonuses: { intelligence: 5, charisma: 5, fitness: 5, streetSmarts: 5 }
  },
  {
    id: 'heir',
    name: 'The Heir',
    description: 'Born into money and connections. You have capital and confidence — but the streets are foreign territory.',
    flavour: '"I didn\'t ask to be born into this. But here we are."',
    startingMoney: 30000,
    startingEducation: 'degree',
    statBonuses: { intelligence: 15, charisma: 15, fitness: 0, streetSmarts: -20 }
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'Books over bravado. You worked hard in school and graduated with knowledge — and student debt.',
    flavour: '"I can out-think any problem."',
    startingMoney: 1200,
    startingEducation: 'degree',
    statBonuses: { intelligence: 25, creativity: 10, charisma: 5, streetSmarts: -10 }
  },
  {
    id: 'immigrant-dream',
    name: 'Immigrant Dream',
    description: 'You arrived with almost nothing but fire in your chest. Resilience is not optional — it\'s survival.',
    flavour: '"I crossed an ocean for this opportunity."',
    startingMoney: 350,
    startingEducation: 'high-school',
    statBonuses: { streetSmarts: 20, charisma: 20, fitness: 10, intelligence: 5, happiness: -10 }
  }
]

export const BACKGROUND_MAP = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b])
) as Record<string, Background>
