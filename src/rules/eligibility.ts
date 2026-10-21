import { taskById } from '../data/catalogue'
import type { DemoState, Employee, Shift, ShiftRequest } from '../models/types'
import { conflictingShifts, isAvailable, shiftsOverlap } from './scheduling'
import { checkSkill, describeSkillGap, missingCoreTasks } from './training'

export type IneligibilityCode =
  | 'same-person'
  | 'inactive'
  | 'core-induction'
  | 'missing-skill'
  | 'unavailable'
  | 'overlap'
  | 'overlap-pending'

export interface IneligibilityReason {
  code: IneligibilityCode
  message: string
}

export interface CandidateResult {
  employee: Employee
  eligible: boolean
  reasons: IneligibilityReason[]
}

export const OPEN_STATUSES: ShiftRequest['status'][] = ['pending-colleague', 'pending-manager']
export const isOpenRequest = (r: ShiftRequest) => OPEN_STATUSES.includes(r.status)

/**
 * Checks whether an employee could take a shift. Every condition is
 * evaluated so the interface can show all the reasons, not just the first.
 * `ignoreRequestId` excludes a request from the pending-commitment check,
 * which is needed when revalidating that same request.
 */
export function evaluateCandidate(
  state: DemoState,
  shift: Shift,
  employee: Employee,
  options: { ignoreRequestId?: string } = {},
): CandidateResult {
  const reasons: IneligibilityReason[] = []

  if (shift.employeeId === employee.id) {
    reasons.push({ code: 'same-person', message: 'Already assigned to this shift' })
  }
  if (employee.status !== 'active') {
    reasons.push({ code: 'inactive', message: 'On leave and not taking shifts' })
  }

  const core = missingCoreTasks(employee.id, state.training)
  if (core.length > 0) {
    reasons.push({
      code: 'core-induction',
      message: `Core induction incomplete: ${core.map((id) => taskById(id).title.toLowerCase()).join(', ')}`,
    })
  }

  for (const skill of shift.requiredSkills) {
    const check = checkSkill(employee, skill, state.training)
    if (!check.ok) reasons.push({ code: 'missing-skill', message: describeSkillGap(check) })
  }

  if (!isAvailable(employee, shift)) {
    reasons.push({ code: 'unavailable', message: 'Not available at this time' })
  }

  for (const clash of conflictingShifts(employee.id, shift, state.shifts)) {
    reasons.push({ code: 'overlap', message: `Already working ${clash.start} to ${clash.end} that day` })
  }

  // Someone who has already agreed to cover an overlapping shift should not be double-booked.
  const pendingClash = state.requests.find((r) => {
    if (r.id === options.ignoreRequestId || r.status !== 'pending-manager' || r.proposedId !== employee.id) return false
    const other = state.shifts.find((s) => s.id === r.shiftId)
    return other !== undefined && other.id !== shift.id && shiftsOverlap(other, shift)
  })
  if (pendingClash) {
    reasons.push({ code: 'overlap-pending', message: 'Has agreed to cover an overlapping shift awaiting approval' })
  }

  return { employee, eligible: reasons.length === 0, reasons }
}

/** All other employees, eligible ones first, then alphabetical. */
export function rankCandidates(state: DemoState, shift: Shift): CandidateResult[] {
  return state.employees
    .filter((e) => e.id !== shift.employeeId)
    .map((e) => evaluateCandidate(state, shift, e))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.employee.name.localeCompare(b.employee.name))
}

/** Whether the assigned employee currently meets every requirement for their own shift. */
export function assignmentIssues(state: DemoState, shift: Shift): IneligibilityReason[] {
  if (!shift.employeeId) return []
  const employee = state.employees.find((e) => e.id === shift.employeeId)
  if (!employee) return [{ code: 'inactive', message: 'Assigned employee not found' }]
  return evaluateCandidate(state, { ...shift, employeeId: null }, employee).reasons
}
