import type { Trait } from '../types/character'

export const TRAITS: Trait[] = [
  {
    id: 'ambitious',
    name: 'Ambitious',
    description: 'You are never satisfied with "good enough."',
    effect: '+15% skill XP gain across all skills',
    attributeBonuses: {}
  },
  {
    id: 'charismatic',
    name: 'Charismatic',
    description: 'People are drawn to you. Deals come easier.',
    effect: 'Better negotiation and hiring outcomes',
    attributeBonuses: { charisma: 15 }
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'You see patterns others miss.',
    effect: 'Improved business and investment decisions',
    attributeBonuses: { intelligence: 15 }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unconventional thinking is your edge.',
    effect: 'Unlocks creative business types earlier',
    attributeBonuses: { creativity: 15 }
  },
  {
    id: 'frugal',
    name: 'Frugal',
    description: 'Every penny counts. You spend less, save more.',
    effect: '-20% personal monthly living expenses',
    attributeBonuses: {}
  },
  {
    id: 'risk-taker',
    name: 'Risk-Taker',
    description: 'You thrive in chaos. Big bets excite you.',
    effect: 'Higher variance on all investments and gambles',
    attributeBonuses: { charisma: 5 }
  },
  {
    id: 'athletic',
    name: 'Athletic',
    description: 'A disciplined body sharpens the mind.',
    effect: 'Slower Health decay, higher Energy ceiling',
    attributeBonuses: { health: 15 }
  },
  {
    id: 'street-smart',
    name: 'Street Smart',
    description: 'You know how the game is really played.',
    effect: 'Better at spotting scams and back-alley opportunities',
    attributeBonuses: { streetSmarts: 15 }
  },
  {
    id: 'charming',
    name: 'Charming',
    description: 'A smile and a word and doors open for you.',
    effect: 'Better relationship outcomes, faster social skill growth',
    attributeBonuses: { charisma: 10 }
  },
  {
    id: 'workaholic',
    name: 'Workaholic',
    description: 'You outwork everyone. Rest is for the weak.',
    effect: '+20% income, but Energy and Mood needs decay faster',
    attributeBonuses: { intelligence: 5 }
  }
]

export const TRAIT_MAP = Object.fromEntries(
  TRAITS.map((t) => [t.id, t])
) as Record<string, Trait>
