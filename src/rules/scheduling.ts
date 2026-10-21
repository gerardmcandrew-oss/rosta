import type { Employee, Shift } from '../models/types'
import { dateTimeKey, minutesOfDay, timesOverlap, weekdayIndex } from '../utils/date'

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
