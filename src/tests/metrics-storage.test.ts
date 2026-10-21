import { describe, expect, it } from 'vitest'
import { createSampleState, SAMPLE_WEEK } from '../data/sampleData'
import { assignShift, completeTask } from '../rules/actions'
import { computeMetrics } from '../rules/metrics'
import { approveRequest } from '../rules/requests'
import { inductionProgress } from '../rules/training'
import { loadPersona, loadState, PERSONA_KEY, resetState, saveState, STATE_KEY } from '../services/storage'
import { AT, fresh, MemoryStore, NOW, ok } from './helpers'

describe('sample data', () => {
  it('meets the minimum record counts', () => {
    const s = fresh()
    expect(s.employees.length).toBeGreaterThanOrEqual(12)
    expect(s.shifts.length).toBeGreaterThanOrEqual(28)
    expect(s.requests).toHaveLength(4)
    expect(new Set(s.employees.map((e) => e.role)).size).toBeGreaterThanOrEqual(6)
  })

  it('has no overlapping assignments and only valid times', () => {
    const s = fresh()
    for (const a of s.shifts) {
      expect(a.start < a.end).toBe(true)
      for (const b of s.shifts) {
        if (a.id >= b.id || !a.employeeId || a.employeeId !== b.employeeId || a.date !== b.date) continue
        expect(a.end <= b.start || b.end <= a.start, `${a.id} overlaps ${b.id}`).toBe(true)
      }
    }
  })
})

describe('dashboard metrics', () => {
  it('derives figures from the records', () => {
    const m = computeMetrics(fresh(), SAMPLE_WEEK, NOW)
    expect(m).toMatchObject({ activeStaff: 12, staffOnLeave: 1, weekShifts: 41, openShifts: 1, pendingRequests: 2, awaitingManager: 1 })
    // Monday's 07:00 supervisor shift has started at the demo clock time.
    expect(m.upcomingShifts).toBe(40)
    expect(m.coveredShifts).toBe(40)
    expect(m.coveragePercent).toBe(98)
  })

  it('updates when the underlying records change', () => {
    let s = fresh()
    s = ok(assignShift(s, 's-1407', 'e09', NOW)).state
    s = ok(approveRequest(s, 'r-003', 'e01', AT, NOW)).state
    const m = computeMetrics(s, SAMPLE_WEEK, NOW)
    expect(m).toMatchObject({ openShifts: 0, coveragePercent: 100, pendingRequests: 1, awaitingManager: 0 })
  })

  it('updates induction progress as tasks are completed', () => {
    let s = fresh()
    const before = computeMetrics(s, SAMPLE_WEEK, NOW).teamInductionPercent
    expect(inductionProgress('e13', s.training)).toMatchObject({ completed: 1, percent: 17 })
    s = ok(completeTask(s, 'e13', 'workplace-intro', 'employee', AT)).state
    expect(inductionProgress('e13', s.training)).toMatchObject({ completed: 2, percent: 33 })
    expect(computeMetrics(s, SAMPLE_WEEK, NOW).teamInductionPercent).toBeGreaterThan(before)
  })

  it('reports an empty week without dividing by zero', () => {
    const m = computeMetrics(fresh(), '2026-12-07', NOW)
    expect(m).toMatchObject({ weekShifts: 0, coveragePercent: 0 })
  })
})

describe('localStorage persistence', () => {
  it('returns sample data when nothing is stored', () => {
    const { state, recovered } = loadState(new MemoryStore())
    expect(state).toEqual(createSampleState())
    expect(recovered).toBe(false)
  })

  it('round-trips saved changes', () => {
    const store = new MemoryStore()
    const changed = ok(approveRequest(fresh(), 'r-003', 'e01', AT, NOW)).state
    expect(saveState(changed, store)).toBe(true)
    expect(loadState(store).state).toEqual(changed)
  })

  it('recovers safely from malformed JSON', () => {
    const store = new MemoryStore()
    store.setItem(STATE_KEY, '{not json')
    const { state, recovered } = loadState(store)
    expect(recovered).toBe(true)
    expect(state.employees).toHaveLength(13)
  })

  it('recovers from valid JSON with the wrong shape', () => {
    const store = new MemoryStore()
    store.setItem(STATE_KEY, JSON.stringify({ employees: 'nope', shifts: [] }))
    expect(loadState(store).recovered).toBe(true)
    store.setItem(STATE_KEY, JSON.stringify({ ...fresh(), shifts: [{ id: 1 }] }))
    expect(loadState(store).recovered).toBe(true)
  })

  it('copes with storage that throws', () => {
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('full') }, removeItem: () => {} }
    expect(loadState(broken).state.shifts.length).toBeGreaterThan(0)
    expect(saveState(fresh(), broken)).toBe(false)
  })

  it('uses a versioned key', () => {
    expect(STATE_KEY).toMatch(/\.v\d+$/)
    expect(PERSONA_KEY).toMatch(/\.v\d+$/)
  })

  it('restores a valid persona and ignores unknown ones', () => {
    const store = new MemoryStore()
    store.setItem(PERSONA_KEY, JSON.stringify({ mode: 'employee', employeeId: 'e05' }))
    expect(loadPersona(['e05'], store)).toEqual({ mode: 'employee', employeeId: 'e05' })
    expect(loadPersona(['e01'], store)).toEqual({ mode: 'manager' })
    store.setItem(PERSONA_KEY, 'garbage')
    expect(loadPersona(['e05'], store)).toEqual({ mode: 'manager' })
  })
})

describe('sample data reset', () => {
  it('replaces stored changes with the original sample week', () => {
    const store = new MemoryStore()
    saveState({ ...ok(approveRequest(fresh(), 'r-003', 'e01', AT, NOW)).state, viewWeek: '2027-01-04' }, store)
    const reset = resetState(store)
    expect(reset).toEqual(createSampleState())
    expect(loadState(store).state).toEqual(createSampleState())
  })

  it('does not share object references with the seed data', () => {
    const a = createSampleState()
    a.shifts[0]!.employeeId = 'changed'
    expect(createSampleState().shifts[0]!.employeeId).not.toBe('changed')
  })
})
