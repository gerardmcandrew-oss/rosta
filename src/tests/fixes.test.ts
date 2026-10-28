import { describe, expect, it } from 'vitest'
import { STATE_KEY, loadState } from '../services/storage'
import { SCENARIOS } from '../demo/scenarios'
import { completeTask, undoTask } from '../rules/actions'
import { evaluateCandidate } from '../rules/eligibility'
import { createRequest } from '../rules/requests'
import { currentWeekStart, upcomingSummary } from '../rules/scheduling'
import { hasCompletedTask, reconcileSignOffs, signOffPrerequisitesMissing } from '../rules/training'
import type { DemoState } from '../models/types'
import { AT, employee, fresh, MemoryStore, NOW, ok, shift } from './helpers'

const AOIFE = 'e12'
const signedOff = (s: DemoState, id = AOIFE) => hasCompletedTask(id, 'manager-sign-off', s.training)
const confirmTill = (s: DemoState) => ok(completeTask(s, AOIFE, 'till-training', 'manager', AT)).state

describe('final induction sign-off', () => {
  it('refuses sign-off while till training is incomplete', () => {
    const result = completeTask(fresh(), AOIFE, 'manager-sign-off', 'manager', AT)
    expect(result).toMatchObject({ ok: false, error: 'Manager sign-off is not available yet. Complete till training first.' })
  })

  it('lists every outstanding prerequisite', () => {
    expect(signOffPrerequisitesMissing('e13', fresh().training)).toEqual(['workplace-intro', 'food-safety', 'till-training', 'customer-service'])
  })

  it('allows sign-off once every other task is complete', () => {
    const s = confirmTill(fresh())
    expect(signOffPrerequisitesMissing(AOIFE, s.training)).toEqual([])
    expect(signedOff(ok(completeTask(s, AOIFE, 'manager-sign-off', 'manager', AT)).state)).toBe(true)
  })

  it('withdraws sign-off when a prerequisite is undone, and needs a fresh one after redoing it', () => {
    const signed = ok(completeTask(confirmTill(fresh()), AOIFE, 'manager-sign-off', 'manager', AT)).state
    const undone = ok(undoTask(signed, AOIFE, 'till-training', 'manager'))
    expect(undone.message).toContain('a fresh sign-off is needed')
    expect(signedOff(undone.state)).toBe(false)

    const redone = confirmTill(undone.state)
    expect(signedOff(redone)).toBe(false)
    expect(signedOff(ok(completeTask(redone, AOIFE, 'manager-sign-off', 'manager', AT)).state)).toBe(true)
  })

  it('leaves other tasks alone when the sign-off itself is undone', () => {
    const signed = ok(completeTask(confirmTill(fresh()), AOIFE, 'manager-sign-off', 'manager', AT)).state
    const s = ok(undoTask(signed, AOIFE, 'manager-sign-off', 'manager')).state
    expect(hasCompletedTask(AOIFE, 'till-training', s.training)).toBe(true)
  })

  it('ships sample data with no sign-off ahead of its prerequisites', () => {
    expect(reconcileSignOffs(fresh().training).revoked).toEqual([])
  })

  it('withdraws inconsistent sign-offs found in saved data and reports who', () => {
    const s = fresh()
    s.training.push({ employeeId: AOIFE, taskId: 'manager-sign-off', completedAt: AT, confirmedBy: 'manager' })
    const store = new MemoryStore()
    store.setItem(STATE_KEY, JSON.stringify(s))
    const loaded = loadState(store)
    expect(loaded.revokedSignOffs).toEqual([AOIFE])
    expect(loaded.recovered).toBe(false)
    expect(signedOff(loaded.state)).toBe(false)
    // Everything else in the saved data is kept.
    expect(loaded.state.training).toHaveLength(s.training.length - 1)
  })

  it('keeps shift eligibility independent of the final sign-off', () => {
    const s = fresh()
    // Mateus has floor training but no till training and no sign-off.
    expect(signedOff(s, 'e09')).toBe(false)
    expect(evaluateCandidate(s, shift(s, 's-1407'), employee(s, 'e09')).eligible).toBe(true)
    // Aoife cannot cover a till shift until till training is confirmed, signed off or not.
    expect(evaluateCandidate(s, shift(s, 's-1205'), employee(s, AOIFE)).reasons.map((r) => r.code)).toContain('missing-skill')
    const trained = confirmTill(s)
    expect(evaluateCandidate(trained, shift(trained, 's-1205'), employee(trained, AOIFE)).reasons.map((r) => r.code)).not.toContain('missing-skill')
  })
})

describe('home screen uses the demo clock', () => {
  it("counts Ciara's shifts in the current demo week, not the browsed one", () => {
    // The browsed week is not an input at all: Home now derives the week from the clock.
    expect(currentWeekStart(NOW)).toBe('2026-11-09')
    expect(upcomingSummary('e07', fresh().shifts, NOW).thisWeek).toBe(5)
  })

  it('uses the same meaning of upcoming for the count and the next shift', () => {
    const s = fresh()
    const { next, thisWeek } = upcomingSummary('e07', s.shifts, NOW)
    expect(next).toMatchObject({ id: 's-0904', date: '2026-11-09', start: '07:30' })
    // Darragh's 07:00 Monday shift has started, so it is neither next nor counted.
    const darragh = upcomingSummary('e02', s.shifts, NOW)
    expect(darragh.next?.id).toBe('s-1001')
    expect(thisWeek).toBeGreaterThan(0)
  })

  it('reports nothing upcoming for someone with no future shifts', () => {
    expect(upcomingSummary('e13', fresh().shifts, NOW)).toEqual({ next: undefined, thisWeek: 0 })
  })
})

describe('guided scenarios', () => {
  it('all apply cleanly to fresh sample data', () => {
    for (const s of SCENARIOS) expect(s.changed(fresh(), NOW), s.id).toBeNull()
  })

  it('point at sample-week records', () => {
    const s = fresh()
    for (const sc of SCENARIOS) {
      if (sc.shiftId) expect(shift(s, sc.shiftId).date >= '2026-11-09' && shift(s, sc.shiftId).date <= '2026-11-15').toBe(true)
      if (sc.employeeId) expect(employee(s, sc.employeeId)).toBeDefined()
      expect(sc.shiftId ?? sc.employeeId).toBeDefined()
    }
  })

  it('explain when the starting conditions have changed', () => {
    const [a, b, , d] = SCENARIOS
    const requested = ok(createRequest(fresh(), { shiftId: 's-1102', requesterId: 'e05', proposedId: 'e04', reason: '' }, AT, NOW)).state
    expect(a!.changed(requested, NOW)).toContain('There is already an open request for this shift.')
    const trained = confirmTill(fresh())
    expect(b!.changed(trained, NOW)).toContain('already been confirmed')
    expect(d!.changed(trained, NOW)).toContain('already been confirmed')
  })
})
