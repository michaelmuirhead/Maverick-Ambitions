import type { Background } from '../types/character'

export const BACKGROUNDS: Background[] = [
  {
    id: 'hustler',
    name: 'The Hustler',
    description: 'Born with nothing, you learned to survive on wit and grit. Every dollar was earned the hard way.',
    flavour: '"The streets were my classroom."',
    startingMoney: 500,
    startingEducation: 'high-school',
    attributeBonuses: { streetSmarts: 25, charisma: 10, health: 5, intelligence: -5 },
    skillBonuses: { sales: 15, marketing: 10, driving: 5 }
  },
  {
    id: 'middle-ground',
    name: 'Middle Ground',
    description: 'A stable upbringing — not rich, not poor. You have a solid foundation but no head start.',
    flavour: '"Average start. Unlimited potential."',
    startingMoney: 2500,
    startingEducation: 'high-school',
    attributeBonuses: { intelligence: 5, charisma: 5, streetSmarts: 5 },
    skillBonuses: { business: 5, sales: 5 }
  },
  {
    id: 'heir',
    name: 'The Heir',
    description: 'Born into money and connections. You have capital and confidence — but the streets are foreign territory.',
    flavour: '"I didn\'t ask to be born into this. But here we are."',
    startingMoney: 30000,
    startingEducation: 'degree',
    attributeBonuses: { intelligence: 15, charisma: 15, streetSmarts: -20 },
    skillBonuses: { leadership: 15, business: 10, finance: 10 }
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'Books over bravado. You worked hard in school and graduated with knowledge — and student debt.',
    flavour: '"I can out-think any problem."',
    startingMoney: 1200,
    startingEducation: 'degree',
    attributeBonuses: { intelligence: 25, creativity: 10, charisma: 5, streetSmarts: -10 },
    skillBonuses: { finance: 15, business: 10, marketing: 5 }
  },
  {
    id: 'immigrant-dream',
    name: 'Immigrant Dream',
    description: 'You arrived with almost nothing but fire in your chest. Resilience is not optional — it\'s survival.',
    flavour: '"I crossed an ocean for this opportunity."',
    startingMoney: 350,
    startingEducation: 'high-school',
    attributeBonuses: { streetSmarts: 20, charisma: 20, health: 10, intelligence: 5 },
    skillBonuses: { sales: 10, cooking: 15, driving: 10 }
  }
]

export const BACKGROUND_MAP = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b])
) as Record<string, Background>
