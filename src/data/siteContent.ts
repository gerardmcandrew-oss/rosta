// Landing page content that needs to stay accurate. Update here, not in components.

export type FeatureStatus = 'Working in demo' | 'Planned' | 'Not included'

export interface Requirement {
  id: string
  need: string
  howRosta: string
  status: FeatureStatus
  planned?: string
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: 'R1',
    need: 'Employees can view their upcoming shifts on a phone.',
    howRosta: 'A mobile home screen shows the next shift first, then the week as day-by-day cards.',
    status: 'Working in demo',
  },
  {
    id: 'R2',
    need: 'Employees can request a shift replacement without relying on group messages.',
    howRosta: 'Pick a shift, choose an eligible colleague and send. They accept or decline inside Rosta.',
    status: 'Working in demo',
    planned: 'Email or push notifications when a request arrives.',
  },
  {
    id: 'R3',
    need: 'Managers can approve or reject staffing changes.',
    howRosta: 'Approval unlocks only after the colleague accepts. Rejecting leaves the rota untouched.',
    status: 'Working in demo',
  },
  {
    id: 'R4',
    need: 'The system identifies scheduling conflicts automatically.',
    howRosta: 'Overlapping shifts, availability and pending commitments are checked on request, acceptance and approval.',
    status: 'Working in demo',
  },
  {
    id: 'R5',
    need: 'Managers can track new-employee induction progress.',
    howRosta: 'Six induction tasks per person, with progress worked out from completed records and manager sign-off.',
    status: 'Working in demo',
    planned: 'Custom task lists for each café.',
  },
  {
    id: 'R6',
    need: 'Shift eligibility reflects relevant completed training.',
    howRosta: 'Each shift lists the skills it needs. Till shifts need till training, floor shifts need customer service training.',
    status: 'Working in demo',
  },
]

export const LIMITATIONS: { feature: string; status: FeatureStatus; note: string }[] = [
  { feature: 'Replacement requests, approvals, induction and eligibility', status: 'Working in demo', note: 'Runs on real rules against sample records.' },
  { feature: 'Direct rota assignment by a manager', status: 'Working in demo', note: 'Uses the same eligibility checks.' },
  { feature: 'Adding, editing or removing staff', status: 'Planned', note: 'The demo uses a preloaded fictional team.' },
  { feature: 'Creating new shifts and rota templates', status: 'Planned', note: 'The sample week is fixed.' },
  { feature: 'Notifications by email or push', status: 'Planned', note: 'Requests appear when you switch persona.' },
  { feature: 'Two-way shift swaps', status: 'Planned', note: 'The demo supports one-way cover only.' },
  { feature: 'Real accounts and secure login', status: 'Not included', note: 'Persona switching is a demonstration feature.' },
  { feature: 'Sync between devices', status: 'Not included', note: 'Data is saved in your browser only.' },
  { feature: 'Payroll, payments and subscriptions', status: 'Not included', note: 'Prices on this page are assumptions.' },
]

export const SOURCES_CHECKED = '21 October 2026'

export const COMPETITORS = [
  {
    name: 'Deputy',
    url: 'https://www.deputy.com/',
    sources: [{ label: 'Shift swapping feature page', url: 'https://www.deputy.com/features/shift-swapping' }],
    summary:
      'Workforce scheduling software. Its shift swapping page describes staff swapping or offering shifts, suggestions of colleagues who are available and qualified, and an option to require manager approval.',
  },
  {
    name: 'Connecteam',
    url: 'https://connecteam.com/',
    sources: [
      { label: 'Employee onboarding page', url: 'https://connecteam.com/solutions/employee-onboarding/' },
      { label: 'Shift replacements help article', url: 'https://help.connecteam.com/en/articles/6444737-user-shift-replacements' },
    ],
    summary:
      'An employee app covering scheduling, onboarding and team chat. Its help centre describes offering or swapping shifts with qualified teammates, conflict checks for swaps and optional admin approval.',
  },
]

/**
 * External user testing. Leave `sessions` empty until a real session has
 * happened, then record exactly what the tester did and said.
 */
export interface TestSession {
  testerType: string
  device: string
  tasks: string
  worked: string
  problems: string
  changes: string
  date: string
}

export const TEST_SESSIONS: TestSession[] = []

export const PHOTO_CREDITS = [
  {
    file: 'counter',
    alt: 'A barista in an apron working behind the counter of a small café',
    creator: 'Syauqy Ayyash',
    url: 'https://unsplash.com/photos/barista-preparing-drinks-behind-a-coffee-shop-counter-BBZ1O-D3gYc',
  },
  {
    file: 'team-counter',
    alt: 'Two baristas in aprons preparing drinks together behind a bright café counter',
    creator: 'rawkkim',
    url: 'https://unsplash.com/photos/baristas-preparing-drinks-behind-a-modern-coffee-counter-CO7bBJlVgg8',
  },
  {
    file: 'tablet',
    alt: 'A café team member in an apron holding a notebook, ready for the shift',
    creator: 'Vitaly Gariev',
    url: 'https://unsplash.com/photos/woman-in-apron-holding-tablet-in-restaurant-0e2eYxBiP6A',
  },
  {
    file: 'espresso',
    alt: 'An espresso machine on a café counter in warm daylight, with a barista working beside it',
    creator: 'Blake Wisz',
    url: 'https://unsplash.com/photos/barista-preparing-coffee-with-espresso-machine-in-cafe-vCtvn_xqoyA',
  },
] as const

export type PhotoName = (typeof PHOTO_CREDITS)[number]['file']
