import { describe, expect, it } from 'vitest'
import { completeTask } from '../rules/actions'
import { evaluateCandidate, rankCandidates } from '../rules/eligibility'
import { conflictingShifts, isAvailable } from '../rules/scheduling'
import { checkSkill, inductionProgress } from '../rules/training'
import { AT, employee, fresh, ok, shift } from './helpers'

const codes = (r: { reasons: { code: string }[] }) => r.reasons.map((x) => x.code)

describe('availability', () => {
  it('requires a window covering the whole shift', () => {
    const s = fresh()
    const hannah = employee(s, 'e10') // Fridays 12:00 to 18:00 only
    expect(isAvailable(hannah, { date: '2026-11-13', start: '12:00', end: '17:00' })).toBe(true)
    expect(isAvailable(hannah, { date: '2026-11-13', start: '10:00', end: '16:00' })).toBe(false)
    expect(isAvailable(hannah, { date: '2026-11-12', start: '12:00', end: '17:00' })).toBe(false)
  })
})

describe('shift overlaps', () => {
  it('finds a clashing shift on the same day', () => {
    const s = fresh()
    const clashes = conflictingShifts('e08', shift(s, 's-1205'), s.shifts) // Grace 07:30-12:00 vs 11:00-17:00
    expect(clashes.map((c) => c.id)).toEqual(['s-1204'])
  })

  it('ignores adjacent shifts', () => {
    const s = fresh()
    const target = { ...shift(s, 's-1205'), start: '12:00' }
    expect(conflictingShifts('e08', target, s.shifts)).toEqual([])
  })
})

describe('training eligibility', () => {
  it('does not treat overall induction percentage as proof of every skill', () => {
    const s = fresh()
    const aoife = employee(s, 'e12')
    expect(inductionProgress('e12', s.training).percent).toBe(67)
    expect(checkSkill(aoife, 'floor', s.training).ok).toBe(true)
    expect(checkSkill(aoife, 'till', s.training)).toMatchObject({ ok: false, missingTasks: ['till-training'] })
  })

  it('requires a recorded competency for barista shifts', () => {
    const s = fresh()
    expect(checkSkill(employee(s, 'e07'), 'barista', s.training)).toMatchObject({ ok: false, missingCompetency: true })
    expect(checkSkill(employee(s, 'e04'), 'barista', s.training).ok).toBe(true)
  })

  it('blocks employees whose core induction is incomplete', () => {
    const s = fresh()
    const result = evaluateCandidate(s, shift(s, 's-1407'), employee(s, 'e13'))
    expect(result.eligible).toBe(false)
    expect(codes(result)).toContain('core-induction')
  })
})

describe('Scenario B: missing training', () => {
  it('prevents a new starter covering a till shift and explains why', () => {
    const s = fresh()
    const result = evaluateCandidate(s, shift(s, 's-1205'), employee(s, 'e12'))
    expect(result.eligible).toBe(false)
    expect(codes(result)).toEqual(['missing-skill'])
    expect(result.reasons[0]!.message).toMatch(/Till training not completed/)
  })
})

describe('Scenario C: scheduling conflict', () => {
  it('detects that a proposed colleague is already working', () => {
    const s = fresh()
    const result = evaluateCandidate(s, shift(s, 's-1205'), employee(s, 'e08'))
    expect(result.eligible).toBe(false)
    expect(codes(result)).toEqual(['overlap'])
    expect(result.reasons[0]!.message).toBe('Already working 07:30 to 12:00 that day')
  })
})

describe('Scenario D: training changes eligibility', () => {
  it('makes a new starter eligible once a manager confirms till training', () => {
    const before = fresh()
    expect(evaluateCandidate(before, shift(before, 's-1205'), employee(before, 'e12')).eligible).toBe(false)

    const after = ok(completeTask(before, 'e12', 'till-training', 'manager', AT)).state
    expect(evaluateCandidate(after, shift(after, 's-1205'), employee(after, 'e12')).eligible).toBe(true)
  })
})

describe('other eligibility conditions', () => {
  it('excludes staff on leave', () => {
    const s = fresh()
    expect(codes(evaluateCandidate(s, shift(s, 's-1205'), employee(s, 'e11')))).toEqual(['inactive'])
  })

  it('excludes the original assignee', () => {
    const s = fresh()
    expect(codes(evaluateCandidate(s, shift(s, 's-1205'), employee(s, 'e07')))).toContain('same-person')
  })

  it('reports every failing condition, not just the first', () => {
    const s = fresh()
    const result = evaluateCandidate(s, shift(s, 's-1205'), employee(s, 'e10')) // Hannah: no till, not available Thursday
    expect(codes(result)).toEqual(['missing-skill', 'unavailable'])
  })

  it('ranks eligible candidates first', () => {
    const s = fresh()
    const ranked = rankCandidates(s, shift(s, 's-1205'))
    const eligible = ranked.filter((r) => r.eligible).map((r) => r.employee.id)
    expect(eligible.sort()).toEqual(['e01', 'e06'])
    expect(ranked[0]!.eligible).toBe(true)
    expect(ranked.some((r) => r.employee.id === 'e07')).toBe(false)
  })
})
