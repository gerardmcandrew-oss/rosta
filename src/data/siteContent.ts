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
 * Testing evidence for Behind the build. Record only what actually
 * happened. Builder and AI-assisted testing are not independent user
 * testing, so never label them that way.
 */
export interface TestSession {
  title: string
  testerType: string
  device: string
  tasks: string | string[]
  worked: string | string[]
  problems: string | string[]
  date: string
}

const CONFIRMED = 'Testing and fixes confirmed: 28 October 2026'

export const TEST_SESSIONS: TestSession[] = [
  {
    title: 'AI-assisted desktop testing',
    testerType: 'AI-assisted testing. An AI tool worked through the demo in a cloud browser.',
    device: 'Desktop computer, Google Chrome in a cloud browser. This was not a real-phone test.',
    tasks: 'The replacement workflow, training and overlap restrictions, assigning an open shift, till training, and the dashboard and rota layout.',
    worked: [
      'Priya requested Wednesday cover from Seán. Seán accepted and the manager approved.',
      "Wednesday's rota then showed Seán in place of Priya.",
      'A second open cover request for the same shift was not available.',
      'Missing till training blocked Aoife from Thursday till cover.',
      'Overlapping shifts blocked Grace, Seán and Priya.',
      "Assigning Saturday's open floor shift to Mateus worked.",
      "Confirming and undoing till training updated Aoife's till readiness.",
      'No obvious overlap or misaligned columns on the dashboard or rota.',
    ],
    problems: 'All three issues listed under Changes made below.',
    date: CONFIRMED,
  },
  {
    title: 'Builder testing on iPhone 16',
    testerType: 'Builder testing by Gerard, who built Rosta. Not independent or external user testing.',
    device: 'iPhone 16, in Safari and in Google Chrome.',
    tasks: [
      'Loading and portrait layout',
      'Navigation and one-handed use',
      'Landscape layout',
      'Sending a cover request',
      'Duplicate-request prevention',
      'Colleague acceptance and manager approval',
      'Manager rejection',
      'Missing-training restrictions',
      'Overlapping-shift restrictions',
      'Training changing eligibility',
      'Premature final sign-off',
      "Home's week consistency",
      'Guided scenario week selection',
      'Forms and the on-screen keyboard',
      'Persistence after refresh',
      'Restoring sample data',
    ],
    worked: 'Results for each scenario were not written up here. Screenshots were taken during testing.',
    problems: 'The same three issues as the desktop testing, in both Safari and Chrome.',
    date: CONFIRMED,
  },
]

/** What changed after testing, kept separate from what has been checked and what still needs checking. */
export interface TestChange {
  issue: string
  original: string
  change: string
  verified: string
  retested: string
}

const RETESTED = 'Retested successfully on 28 October 2026 in desktop cloud Chrome and on an iPhone 16 using Safari and Google Chrome.'

export const TEST_CHANGES: TestChange[] = [
  {
    issue: 'Final induction sign-off',
    original: 'Manager sign-off was accepted while till training was incomplete, and stayed in place after till training was undone.',
    change:
      'Sign-off now needs every other induction task to be complete. Until then the button is disabled and says what is missing, and the same rule is checked when the change is saved. Undoing a task removes the sign-off and asks for a fresh one. Saved sign-offs with tasks outstanding are removed with a notice. Shift eligibility still depends only on the training each shift needs.',
    verified:
      'Sign-off is blocked until the required training is complete. Undoing required training removes the final sign-off and a fresh sign-off is needed. Automated tests also confirm floor and till eligibility are unchanged.',
    retested: RETESTED,
  },
  {
    issue: 'Home mixing different weeks',
    original: 'After browsing to 16 to 22 November in My shifts, Home said "2 shifts coming up this week" but showed Monday 9 November as the next shift.',
    change:
      "Home now takes the current week from the fixed demo clock, Monday 9 November 2026 at 07:00, not from the week being browsed. The count and the next-shift card use the same meaning of upcoming. When nothing is coming up, Home says so.",
    verified:
      "Browsing another week no longer makes Home's current-week count and next-shift date refer to different weeks. Automated tests also cover browsing backwards, switching persona and the empty state.",
    retested: RETESTED,
  },
  {
    issue: 'Guided scenarios keeping the wrong week',
    original: 'Starting "Missing training" after browsing to 16 to 22 November left My shifts on that week, so the Thursday 12 November shift was not shown.',
    change:
      "Each Start button now switches persona, returns to the sample week and opens the scenario's screen: the cover request for the employee scenarios, and Aoife's record in Team for the manager one. Demo changes are kept. If a scenario's starting conditions have changed, it says so and offers Reset sample data.",
    verified:
      'Starting a scenario now selects the required sample week and opens the relevant screen or record. Automated tests also check the message shown when starting conditions have changed.',
    retested: RETESTED,
  },
]

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
