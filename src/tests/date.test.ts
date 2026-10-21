import { describe, expect, it } from 'vitest'
import { addDays, durationHours, formatWeekRange, parseISODate, startOfWeek, timesOverlap, weekDays, weekdayIndex } from '../utils/date'

describe('date calculations', () => {
  it('finds the Monday of a week', () => {
    expect(startOfWeek('2026-11-09')).toBe('2026-11-09')
    expect(startOfWeek('2026-11-12')).toBe('2026-11-09')
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09')
    expect(startOfWeek('2026-11-16')).toBe('2026-11-16')
  })

  it('treats Monday as weekday 0 and Sunday as 6', () => {
    expect(weekdayIndex('2026-11-09')).toBe(0)
    expect(weekdayIndex('2026-11-15')).toBe(6)
  })

  it('moves across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04')
    expect(addDays('2026-11-09', -7)).toBe('2026-11-02')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('is not affected by daylight saving changes', () => {
    // Irish clocks went back on 25 October 2026.
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25')
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
    expect(weekDays('2026-10-19')).toHaveLength(7)
    expect(weekDays('2026-10-19')[6]).toBe('2026-10-25')
  })

  it('rejects invalid dates', () => {
    expect(() => parseISODate('2026-02-30')).toThrow()
    expect(() => parseISODate('09/11/2026')).toThrow()
  })

  it('treats adjacent times as not overlapping', () => {
    expect(timesOverlap('07:30', '11:00', '11:00', '17:00')).toBe(false)
    expect(timesOverlap('11:00', '17:00', '07:30', '11:00')).toBe(false)
  })

  it('detects overlapping and contained times', () => {
    expect(timesOverlap('07:30', '12:00', '11:00', '17:00')).toBe(true)
    expect(timesOverlap('09:00', '17:00', '10:00', '12:00')).toBe(true)
    expect(timesOverlap('10:00', '12:00', '10:00', '12:00')).toBe(true)
  })

  it('calculates shift length and week labels', () => {
    expect(durationHours('07:30', '15:00')).toBe(7.5)
    expect(formatWeekRange('2026-11-09')).toBe('9 Nov to 15 Nov 2026')
  })
})
