import type { DemoState, RequestStatus, Shift, ShiftRequest } from '../models/types'
import { evaluateCandidate, isOpenRequest, type IneligibilityReason } from './eligibility'
import { hasStarted } from './scheduling'

export type Result = { ok: true; state: DemoState; message: string } | { ok: false; error: string; reasons?: IneligibilityReason[] }

const fail = (error: string, reasons?: IneligibilityReason[]): Result => ({ ok: false, error, reasons })

const nameOf = (state: DemoState, id: string | null) => state.employees.find((e) => e.id === id)?.name.split(' ')[0] ?? 'Unknown'

function nextRequestId(requests: ShiftRequest[]): string {
  const max = requests.reduce((n, r) => Math.max(n, Number(r.id.replace(/\D/g, '')) || 0), 0)
  return `r-${String(max + 1).padStart(3, '0')}`
}

function updateRequest(state: DemoState, request: ShiftRequest, status: RequestStatus, actorId: string, at: string, note?: string): DemoState {
  const updated: ShiftRequest = {
    ...request,
    status,
    history: [...request.history, { at, status, actorId, ...(note ? { note } : {}) }],
  }
  return { ...state, requests: state.requests.map((r) => (r.id === request.id ? updated : r)) }
}

/** Reasons a shift cannot currently be offered for replacement by this employee. */
export function shiftRequestBlocker(state: DemoState, shift: Shift, requesterId: string, now: string): string | null {
  if (shift.employeeId !== requesterId) return 'You can only request cover for your own shifts.'
  if (hasStarted(shift, now)) return 'This shift has already started.'
  if (shift.status === 'reassigned') return 'This shift has already been reassigned once. Ask a manager to change it.'
  if (state.requests.some((r) => r.shiftId === shift.id && isOpenRequest(r))) return 'There is already an open request for this shift.'
  return null
}

export interface CreateRequestInput {
  shiftId: string
  requesterId: string
  proposedId: string
  reason: string
}

export function createRequest(state: DemoState, input: CreateRequestInput, at: string, now: string): Result {
  const shift = state.shifts.find((s) => s.id === input.shiftId)
  if (!shift) return fail('Shift not found.')
  const blocker = shiftRequestBlocker(state, shift, input.requesterId, now)
  if (blocker) return fail(blocker)
  const proposed = state.employees.find((e) => e.id === input.proposedId)
  if (!proposed) return fail('Choose a colleague to cover the shift.')

  const check = evaluateCandidate(state, shift, proposed)
  if (!check.eligible) return fail(`${proposed.name} cannot cover this shift.`, check.reasons)

  const request: ShiftRequest = {
    id: nextRequestId(state.requests),
    shiftId: shift.id,
    requesterId: input.requesterId,
    proposedId: proposed.id,
    reason: input.reason.trim(),
    status: 'pending-colleague',
    createdAt: at,
    history: [{ at, status: 'pending-colleague', actorId: input.requesterId }],
  }
  return { ok: true, state: { ...state, requests: [...state.requests, request] }, message: `Request sent to ${nameOf(state, proposed.id)}.` }
}

export function respondToRequest(state: DemoState, requestId: string, actorId: string, accept: boolean, at: string, note?: string): Result {
  const request = state.requests.find((r) => r.id === requestId)
  if (!request) return fail('Request not found.')
  if (request.proposedId !== actorId) return fail('Only the colleague who was asked can respond.')
  if (request.status !== 'pending-colleague') return fail('This request is no longer waiting for your response.')

  if (!accept) {
    return { ok: true, state: updateRequest(state, request, 'declined', actorId, at, note), message: 'Request declined. The rota has not changed.' }
  }

  const shift = state.shifts.find((s) => s.id === request.shiftId)
  const employee = state.employees.find((e) => e.id === actorId)
  if (!shift || !employee) return fail('Shift not found.')
  const check = evaluateCandidate(state, shift, employee, { ignoreRequestId: request.id })
  if (!check.eligible) return fail('You can no longer cover this shift.', check.reasons)

  return {
    ok: true,
    state: updateRequest(state, request, 'pending-manager', actorId, at, note),
    message: 'Accepted. A manager will review it next.',
  }
}

export function approveRequest(state: DemoState, requestId: string, managerId: string, at: string, now: string): Result {
  const request = state.requests.find((r) => r.id === requestId)
  if (!request) return fail('Request not found.')
  if (request.status === 'approved') return fail('This request has already been approved.')
  if (request.status === 'pending-colleague') return fail(`Waiting for ${nameOf(state, request.proposedId)} to accept before it can be approved.`)
  if (request.status !== 'pending-manager') return fail('This request is closed.')

  const shift = state.shifts.find((s) => s.id === request.shiftId)
  const proposed = state.employees.find((e) => e.id === request.proposedId)
  if (!shift || !proposed) return fail('Shift not found.')
  if (shift.employeeId !== request.requesterId) return fail('The shift has changed since this request was made.')
  if (hasStarted(shift, now)) return fail('This shift has already started.')

  // Revalidate everything: training, availability or other shifts may have changed since the request.
  const check = evaluateCandidate(state, shift, proposed, { ignoreRequestId: request.id })
  if (!check.eligible) return fail(`${proposed.name} is no longer eligible for this shift.`, check.reasons)

  const updatedShift: Shift = { ...shift, employeeId: proposed.id, status: 'reassigned', originalEmployeeId: request.requesterId }
  const withRequest = updateRequest(state, request, 'approved', managerId, at)
  return {
    ok: true,
    state: { ...withRequest, shifts: withRequest.shifts.map((s) => (s.id === shift.id ? updatedShift : s)) },
    message: `Approved. ${nameOf(state, proposed.id)} is now on the rota.`,
  }
}

export function rejectRequest(state: DemoState, requestId: string, managerId: string, at: string, note?: string): Result {
  const request = state.requests.find((r) => r.id === requestId)
  if (!request) return fail('Request not found.')
  if (!isOpenRequest(request)) return fail('This request is already closed.')
  return { ok: true, state: updateRequest(state, request, 'rejected', managerId, at, note), message: 'Request rejected. The rota has not changed.' }
}

export function cancelRequest(state: DemoState, requestId: string, actorId: string, at: string): Result {
  const request = state.requests.find((r) => r.id === requestId)
  if (!request) return fail('Request not found.')
  if (request.requesterId !== actorId) return fail('Only the person who asked can cancel this request.')
  if (!isOpenRequest(request)) return fail('This request is already closed.')
  return { ok: true, state: updateRequest(state, request, 'cancelled', actorId, at), message: 'Request cancelled.' }
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  'pending-colleague': 'Pending colleague response',
  'pending-manager': 'Pending manager approval',
  approved: 'Approved',
  rejected: 'Rejected',
  declined: 'Declined by colleague',
  cancelled: 'Cancelled',
}
