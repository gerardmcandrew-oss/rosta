import { describe, expect, it } from 'vitest'
import { assignShift, completeTask } from '../rules/actions'
import { approveRequest, cancelRequest, createRequest, rejectRequest, respondToRequest } from '../rules/requests'
import { AT, fresh, NOW, ok, shift } from './helpers'

const scenarioA = { shiftId: 's-1102', requesterId: 'e05', proposedId: 'e04', reason: 'Appointment' }

describe('replacement request creation', () => {
  it('creates a request pending colleague response', () => {
    const result = ok(createRequest(fresh(), scenarioA, AT, NOW))
    const request = result.state.requests.at(-1)!
    expect(request).toMatchObject({ id: 'r-005', status: 'pending-colleague', shiftId: 's-1102', proposedId: 'e04' })
    expect(request.history).toHaveLength(1)
  })

  it('does not change the rota when a request is created', () => {
    const s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    expect(shift(s, 's-1102').employeeId).toBe('e05')
  })

  it('refuses an ineligible colleague with reasons', () => {
    const result = createRequest(fresh(), { shiftId: 's-1205', requesterId: 'e07', proposedId: 'e12', reason: '' }, AT, NOW)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reasons?.[0]?.code).toBe('missing-skill')
  })

  it("refuses requests for someone else's shift", () => {
    expect(createRequest(fresh(), { ...scenarioA, requesterId: 'e04' }, AT, NOW).ok).toBe(false)
  })

  it('prevents a second open request for the same shift', () => {
    const s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    const again = createRequest(s, { ...scenarioA, proposedId: 'e01' }, AT, NOW)
    expect(again).toMatchObject({ ok: false, error: 'There is already an open request for this shift.' })
  })

  it('refuses shifts that have started', () => {
    const result = createRequest(fresh(), { shiftId: 's-0901', requesterId: 'e02', proposedId: 'e03', reason: '' }, AT, NOW)
    expect(result).toMatchObject({ ok: false, error: 'This shift has already started.' })
  })

  it('refuses shifts that were already reassigned', () => {
    const result = createRequest(fresh(), { shiftId: 's-1002', requesterId: 'e04', proposedId: 'e01', reason: '' }, AT, NOW)
    expect(result.ok).toBe(false)
  })
})

describe('Scenario A: successful replacement', () => {
  it('moves the shift once the colleague accepts and the manager approves', () => {
    let s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    const id = s.requests.at(-1)!.id
    s = ok(respondToRequest(s, id, 'e04', true, AT)).state
    expect(s.requests.find((r) => r.id === id)!.status).toBe('pending-manager')
    s = ok(approveRequest(s, id, 'e01', AT, NOW)).state
    expect(shift(s, 's-1102')).toMatchObject({ employeeId: 'e04', status: 'reassigned', originalEmployeeId: 'e05' })
    expect(s.requests.find((r) => r.id === id)!.history.map((h) => h.status)).toEqual(['pending-colleague', 'pending-manager', 'approved'])
  })
})

describe('colleague response', () => {
  it('only lets the proposed colleague respond', () => {
    const s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    expect(respondToRequest(s, 'r-005', 'e06', true, AT).ok).toBe(false)
  })

  it('closes a declined request without changing the rota', () => {
    let s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    s = ok(respondToRequest(s, 'r-005', 'e04', false, AT)).state
    expect(s.requests.find((r) => r.id === 'r-005')!.status).toBe('declined')
    expect(shift(s, 's-1102').employeeId).toBe('e05')
    expect(approveRequest(s, 'r-005', 'e01', AT, NOW).ok).toBe(false)
  })

  it('rejects invalid transitions such as accepting twice', () => {
    let s = ok(createRequest(fresh(), scenarioA, AT, NOW)).state
    s = ok(respondToRequest(s, 'r-005', 'e04', true, AT)).state
    expect(respondToRequest(s, 'r-005', 'e04', true, AT).ok).toBe(false)
  })
})

describe('manager approval', () => {
  it('blocks approval until the colleague has accepted', () => {
    const result = approveRequest(fresh(), 'r-004', 'e01', AT, NOW)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.error).toMatch(/Waiting for Chiara/)
  })

  it('prevents duplicate approvals', () => {
    const s = ok(approveRequest(fresh(), 'r-003', 'e01', AT, NOW)).state
    const again = approveRequest(s, 'r-003', 'e01', AT, NOW)
    expect(again).toMatchObject({ ok: false, error: 'This request has already been approved.' })
    expect(s.shifts.filter((x) => x.employeeId === 'e10' && x.date === '2026-11-13')).toHaveLength(1)
  })

  it('revalidates eligibility at approval time', () => {
    // Hannah accepted Mateus's Friday shift. If she is then given an overlapping shift, approval must fail.
    let s = fresh()
    s = { ...s, shifts: [...s.shifts, { ...shift(s, 's-1306'), id: 's-x', employeeId: 'e10', start: '13:00', end: '17:00' }] }
    const result = approveRequest(s, 'r-003', 'e01', AT, NOW)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reasons?.map((r) => r.code)).toContain('overlap')
  })

  it('picks up training completed after the request was created', () => {
    // Request created while eligible, training then removed by direct data change: approval must notice.
    let s = ok(createRequest(fresh(), { shiftId: 's-1205', requesterId: 'e07', proposedId: 'e06', reason: '' }, AT, NOW)).state
    s = ok(respondToRequest(s, 'r-005', 'e06', true, AT)).state
    s = { ...s, training: s.training.filter((t) => !(t.employeeId === 'e06' && t.taskId === 'till-training')) }
    expect(approveRequest(s, 'r-005', 'e01', AT, NOW).ok).toBe(false)
    s = ok(completeTask(s, 'e06', 'till-training', 'manager', AT)).state
    expect(approveRequest(s, 'r-005', 'e01', AT, NOW).ok).toBe(true)
  })

  it('prevents double-booking from two accepted requests', () => {
    // Niamh agrees to cover two overlapping Thursday shifts; only the first can be approved.
    let s = fresh()
    s = ok(createRequest(s, { shiftId: 's-1205', requesterId: 'e07', proposedId: 'e01', reason: '' }, AT, NOW)).state
    s = ok(respondToRequest(s, 'r-005', 'e01', true, AT)).state
    const second = createRequest(s, { shiftId: 's-1206', requesterId: 'e09', proposedId: 'e01', reason: '' }, AT, NOW)
    expect(second.ok).toBe(false)
    if (!second.ok) expect(second.reasons?.map((r) => r.code)).toContain('overlap-pending')
  })
})

describe('rejection and cancellation', () => {
  it('rejects without modifying the rota', () => {
    const before = fresh()
    const s = ok(rejectRequest(before, 'r-003', 'e01', AT, 'Need Mateus on Friday')).state
    expect(s.requests.find((r) => r.id === 'r-003')!.status).toBe('rejected')
    expect(s.shifts).toEqual(before.shifts)
    expect(rejectRequest(s, 'r-003', 'e01', AT).ok).toBe(false)
  })

  it('lets only the requester cancel an open request', () => {
    expect(cancelRequest(fresh(), 'r-004', 'e03', AT).ok).toBe(false)
    const s = ok(cancelRequest(fresh(), 'r-004', 'e02', AT)).state
    expect(s.requests.find((r) => r.id === 'r-004')!.status).toBe('cancelled')
  })
})

describe('manager rota assignment', () => {
  it('fills an open shift with an eligible employee', () => {
    const s = ok(assignShift(fresh(), 's-1407', 'e09', NOW)).state
    expect(shift(s, 's-1407')).toMatchObject({ employeeId: 'e09', status: 'scheduled' })
  })

  it('prevents overlapping or untrained assignments', () => {
    expect(assignShift(fresh(), 's-1407', 'e10', NOW).ok).toBe(false) // already working 09:00-15:00
    expect(assignShift(fresh(), 's-1407', 'e13', NOW).ok).toBe(false) // induction incomplete
  })
})

describe('induction tasks', () => {
  it('lets employees complete self-service tasks only', () => {
    expect(completeTask(fresh(), 'e13', 'workplace-intro', 'employee', AT).ok).toBe(true)
    expect(completeTask(fresh(), 'e13', 'till-training', 'employee', AT).ok).toBe(false)
    expect(completeTask(fresh(), 'e13', 'manager-sign-off', 'employee', AT).ok).toBe(false)
    expect(completeTask(fresh(), 'e13', 'handbook', 'employee', AT).ok).toBe(false) // already done
  })
})
