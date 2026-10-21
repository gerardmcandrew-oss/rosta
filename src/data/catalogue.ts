import type { OnboardingTask, RoleId, SkillDefinition, SkillId, TaskId } from '../models/types'

// Internal demonstration tasks. They are not accredited certifications.
export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: 'handbook',
    title: 'Read the employee handbook',
    description: 'House rules, breaks, uniform, sick leave and who to call if you are running late.',
    completedBy: 'employee',
    estimatedMinutes: 20,
  },
  {
    id: 'workplace-intro',
    title: 'Workplace introduction',
    description: 'Walk through the café, fire exits, first aid kit, stock room and opening checklist.',
    completedBy: 'employee',
    estimatedMinutes: 30,
  },
  {
    id: 'food-safety',
    title: 'Food safety orientation',
    description: 'Hand washing, allergen labels, fridge temperature log and cleaning schedule.',
    completedBy: 'employee',
    estimatedMinutes: 45,
  },
  {
    id: 'till-training',
    title: 'Till training',
    description: 'Taking payments, refunds, voids and cashing up. Practised with a manager, who confirms it.',
    completedBy: 'manager',
    estimatedMinutes: 60,
  },
  {
    id: 'customer-service',
    title: 'Customer service training',
    description: 'Greeting, taking orders at the table, handling complaints and allergen questions.',
    completedBy: 'employee',
    estimatedMinutes: 30,
  },
  {
    id: 'manager-sign-off',
    title: 'Manager sign-off',
    description: 'A manager reviews the induction with you and signs it off as complete.',
    completedBy: 'manager',
    estimatedMinutes: 15,
  },
]

/** Every shift needs the basics: handbook, workplace introduction and food safety. */
export const CORE_TASKS: TaskId[] = ['handbook', 'workplace-intro', 'food-safety']

export const SKILLS: Record<SkillId, SkillDefinition> = {
  barista: { id: 'barista', label: 'Barista', requiresTasks: [], requiresCompetency: true },
  till: { id: 'till', label: 'Till', requiresTasks: ['till-training'], requiresCompetency: false },
  floor: { id: 'floor', label: 'Floor service', requiresTasks: ['customer-service'], requiresCompetency: false },
  supervisor: { id: 'supervisor', label: 'Supervisor', requiresTasks: ['till-training'], requiresCompetency: true },
}

export const ROLE_LABELS: Record<RoleId, string> = {
  manager: 'Café manager',
  supervisor: 'Shift supervisor',
  barista: 'Barista',
  till: 'Till operator',
  floor: 'Floor assistant',
  'new-starter': 'New starter',
}

export const SHIFT_ROLE_LABELS: Record<'supervisor' | 'barista' | 'till' | 'floor', string> = {
  supervisor: 'Supervisor',
  barista: 'Barista',
  till: 'Till',
  floor: 'Floor',
}

export const taskById = (id: TaskId) => ONBOARDING_TASKS.find((t) => t.id === id)!
