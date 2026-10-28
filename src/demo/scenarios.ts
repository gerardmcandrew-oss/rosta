import type { DemoState, Persona } from '../models/types'
import { evaluateCandidate } from '../rules/eligibility'
import { shiftRequestBlocker } from '../rules/requests'
import { conflictingShifts } from '../rules/scheduling'
import { hasCompletedTask } from '../rules/training'

/** A guided walkthrough from "Things to try". Every scenario runs in the sample week. */
export interface Scenario {
  id: 'A' | 'B' | 'C' | 'D'
  title: string
  persona: Persona
  personaLabel: string
  steps: string[]
  /** The screen Start opens. */
  tab: 'shifts' | 'team'
  /** For employee scenarios: the shift whose cover request Start opens. */
  shiftId?: string
  /** For manager scenarios: the team record Start expands. */
  employeeId?: string
  /** Explains how the sample data has moved on since the scenario was written, or null when it still applies. */
  changed: (state: DemoState, now: string) => string | null
}

const PRIYA = 'e05'
const SEAN = 'e04'
const CIARA = 'e07'
const GRACE = 'e08'
const AOIFE = 'e12'

function requestBlocker(state: DemoState, shiftId: string, employeeId: string, now: string, owner: string): string | null {
  const shift = state.shifts.find((s) => s.id === shiftId)
  if (!shift) return 'The sample shift for this scenario is missing.'
  const blocker = shiftRequestBlocker(state, shift, employeeId, now)
  return blocker && `${owner} shift has changed. ${blocker}`
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'A',
    title: 'Successful replacement',
    persona: { mode: 'employee', employeeId: PRIYA },
    personaLabel: 'Start as Priya',
    steps: [
      "Start opens Priya's cover request for Wednesday 11 November (07:30 to 15:00).",
      'Pick Seán Ó Briain and send the request.',
      'Switch to Seán, open Requests and accept.',
      'Switch to Manager and approve. Wednesday on the rota now shows Seán.',
    ],
    tab: 'shifts',
    shiftId: 's-1102',
    changed: (state, now) => {
      const blocker = requestBlocker(state, 's-1102', PRIYA, now, "Priya's Wednesday")
      if (blocker) return blocker
      const shift = state.shifts.find((s) => s.id === 's-1102')!
      const sean = state.employees.find((e) => e.id === SEAN)
      const check = sean && evaluateCandidate(state, shift, sean)
      return check && !check.eligible ? `Seán can no longer cover Wednesday: ${check.reasons[0]!.message.toLowerCase()}.` : null
    },
  },
  {
    id: 'B',
    title: 'Missing training',
    persona: { mode: 'employee', employeeId: CIARA },
    personaLabel: 'Start as Ciara',
    steps: [
      "Start opens Ciara's cover request for the Thursday 12 November till shift (11:00 to 17:00).",
      'Aoife Kelly, a new starter, is listed under Cannot cover because till training is not complete.',
    ],
    tab: 'shifts',
    shiftId: 's-1205',
    changed: (state, now) =>
      requestBlocker(state, 's-1205', CIARA, now, "Ciara's Thursday") ??
      (hasCompletedTask(AOIFE, 'till-training', state.training)
        ? "Aoife's till training has already been confirmed, so she now appears under Can cover."
        : null),
  },
  {
    id: 'C',
    title: 'Scheduling conflict',
    persona: { mode: 'employee', employeeId: CIARA },
    personaLabel: 'Start as Ciara',
    steps: [
      "Start opens the same Thursday 12 November till request as Ciara.",
      'Grace Okafor is blocked because she already works 07:30 to 12:00 that day. Seán and Priya are blocked for the same reason.',
    ],
    tab: 'shifts',
    shiftId: 's-1205',
    changed: (state, now) => {
      const blocker = requestBlocker(state, 's-1205', CIARA, now, "Ciara's Thursday")
      if (blocker) return blocker
      const shift = state.shifts.find((s) => s.id === 's-1205')!
      return conflictingShifts(GRACE, shift, state.shifts).length === 0 ? 'Grace no longer has an overlapping shift on Thursday.' : null
    },
  },
  {
    id: 'D',
    title: 'Training changes eligibility',
    persona: { mode: 'manager' },
    personaLabel: 'Start as Manager',
    steps: [
      "Start opens Aoife Kelly's record in Team. Choose Confirm as manager on Till training.",
      'Switch to Ciara and request cover on Thursday 12 November again. Aoife now appears under Can cover.',
    ],
    tab: 'team',
    employeeId: AOIFE,
    changed: (state) =>
      hasCompletedTask(AOIFE, 'till-training', state.training) ? "Aoife's till training has already been confirmed." : null,
  },
]
