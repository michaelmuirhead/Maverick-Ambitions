import type { JobDef } from '../types/jobs'

export const JOBS: JobDef[] = [
  {
    id: 'warehouse-worker',
    title: 'Warehouse Worker',
    employer: "Vito's Logistics",
    description: 'Heavy lifting, long hours, honest pay. No experience needed.',
    hourlyWage: 11,
    shiftOptions: [8],
    requiredSkills: {},
    primarySkill: 'business'
  },
  {
    id: 'cafe-server',
    title: 'Café Server',
    employer: 'The Daily Grind',
    description: 'Morning rush, coffee orders, and the occasional decent tip.',
    hourlyWage: 9,
    charismaBonus: 0.08,   // $0.08 per charisma point per hour
    shiftOptions: [4],
    requiredSkills: {},
    primarySkill: 'sales'
  },
  {
    id: 'cleaner',
    title: 'Cleaner',
    employer: 'CleanPro Services',
    description: 'Flexible hours, solo work. Nobody bothers you.',
    hourlyWage: 10,
    shiftOptions: [4, 8],
    requiredSkills: {},
    primarySkill: null
  },
  {
    id: 'retail-sales',
    title: 'Retail Sales Associate',
    employer: 'FastMart',
    description: 'On the floor, moving product. Sales skills grow fast here.',
    hourlyWage: 13,
    shiftOptions: [4, 8],
    requiredSkills: { sales: 10 },
    primarySkill: 'sales'
  },
  {
    id: 'delivery-driver',
    title: 'Delivery Driver',
    employer: 'QuickRoute',
    description: 'Know the roads, own your time. Tips on top.',
    hourlyWage: 15,
    charismaBonus: 0.04,
    shiftOptions: [4, 8],
    requiredSkills: { driving: 15 },
    primarySkill: 'driving'
  },
  {
    id: 'office-junior',
    title: 'Office Junior',
    employer: 'Meridian Corp',
    description: 'Entry-level corporate. Boring but well-paid, and the skills transfer.',
    hourlyWage: 14,
    shiftOptions: [8],
    requiredSkills: { business: 10, finance: 5 },
    primarySkill: 'business',
    secondarySkill: 'finance'
  }
]

export const JOB_MAP = Object.fromEntries(
  JOBS.map((j) => [j.id, j])
) as Record<string, JobDef>
