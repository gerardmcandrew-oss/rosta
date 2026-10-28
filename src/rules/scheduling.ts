import type { Employee, Shift } from '../models/types'
import { addDays, dateTimeKey, minutesOfDay, startOfWeek, timesOverlap, weekdayIndex } from '../utils/date'

export function shiftsOverlap(a: Pick<Shift, 'date' | 'start' | 'end'>, b: Pick<Shift, 'date' | 'start' | 'end'>): boolean {
  return a.date === b.date && timesOverlap(a.start, a.end, b.start, b.end)
}

/** Shifts already held by the employee that would clash with the given shift. */
export function conflictingShifts(employeeId: string, shift: Shift, shifts: Shift[]): Shift[] {
  return shifts.filter((s) => s.id !== shift.id && s.employeeId === employeeId && shiftsOverlap(s, shift))
}

/** True when one availability window on that weekday covers the whole shift. */
export function isAvailable(employee: Employee, shift: Pick<Shift, 'date' | 'start' | 'end'>): boolean {
  const weekday = weekdayIndex(shift.date)
  const start = minutesOfDay(shift.start)
  const end = minutesOfDay(shift.end)
  return employee.availability.some(
    (w) => w.weekday === weekday && minutesOfDay(w.from) <= start && minutesOfDay(w.to) >= end,
  )
}

export function hasStarted(shift: Pick<Shift, 'date' | 'start'>, now: string): boolean {
  return dateTimeKey(shift.date, shift.start) <= now
}

export function sortShifts<T extends Pick<Shift, 'date' | 'start'>>(shifts: T[]): T[] {
  return [...shifts].sort((a, b) => dateTimeKey(a.date, a.start).localeCompare(dateTimeKey(b.date, b.start)))
}

export function isValidShiftTime(shift: Pick<Shift, 'start' | 'end'>): boolean {
  try {
    return minutesOfDay(shift.start) < minutesOfDay(shift.end)
  } catch {
    return false
  }
}

/** Monday of the week containing the demo clock, whatever week is being browsed. */
export function currentWeekStart(now: string): string {
  return startOfWeek(now.slice(0, 10))
}

export interface UpcomingSummary {
  /** The employee's next shift that has not started, in any week. */
  next: Shift | undefined
  /** How many of their shifts that have not started fall in the current week. */
  thisWeek: number
}

/** What the employee home screen shows. Both figures use the demo clock and the same meaning of upcoming. */
export function upcomingSummary(employeeId: string, shifts: Shift[], now: string): UpcomingSummary {
  const upcoming = sortShifts(shifts.filter((s) => s.employeeId === employeeId && !hasStarted(s, now)))
  const weekStart = currentWeekStart(now)
  const weekEnd = addDays(weekStart, 6)
  return { next: upcoming[0], thisWeek: upcoming.filter((s) => s.date >= weekStart && s.date <= weekEnd).length }
}
