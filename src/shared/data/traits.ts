import type { Trait } from '../types/character'

export const TRAITS: Trait[] = [
  {
    id: 'ambitious',
    name: 'Ambitious',
    description: 'You are never satisfied with "good enough."',
    effect: '+15% XP gain on all skills',
    statBonuses: { happiness: -5 }
  },
  {
    id: 'charismatic',
    name: 'Charismatic',
    description: 'People are drawn to you. Deals come easier.',
    effect: '+15 Charisma, better negotiation outcomes',
    statBonuses: { charisma: 15 }
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'You see patterns others miss.',
    effect: '+15 Intelligence, improved business decisions',
    statBonuses: { intelligence: 15 }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unconventional thinking is your edge.',
    effect: '+15 Creativity, unlocks unique business types earlier',
    statBonuses: { creativity: 15 }
  },
  {
    id: 'frugal',
    name: 'Frugal',
    description: 'Every penny counts. You spend less, save more.',
    effect: '-20% personal monthly expenses',
    statBonuses: { happiness: -5 }
  },
  {
    id: 'risk-taker',
    name: 'Risk-Taker',
    description: 'You thrive in chaos. Big bets excite you.',
    effect: 'Higher variance on investments and business gambles',
    statBonuses: { charisma: 5, happiness: 5 }
  },
  {
    id: 'athletic',
    name: 'Athletic',
    description: 'A disciplined body sharpens the mind.',
    effect: '+15 Fitness, slower fitness decay over time',
    statBonuses: { fitness: 15, happiness: 5 }
  },
  {
    id: 'street-smart',
    name: 'Street Smart',
    description: 'You know how the game is really played.',
    effect: '+15 Street Smarts, better at spotting scams and opportunities',
    statBonuses: { streetSmarts: 15 }
  },
  {
    id: 'charming',
    name: 'Charming',
    description: 'A smile and a word and doors open for you.',
    effect: 'Better relationship outcomes, faster social skill growth',
    statBonuses: { charisma: 10, happiness: 5 }
  },
  {
    id: 'workaholic',
    name: 'Workaholic',
    description: 'You outwork everyone. Rest is for the weak.',
    effect: '+20% income from jobs and businesses, -10 happiness baseline',
    statBonuses: { happiness: -10, intelligence: 5 }
  }
]

export const TRAIT_MAP = Object.fromEntries(
  TRAITS.map((t) => [t.id, t])
) as Record<string, Trait>
