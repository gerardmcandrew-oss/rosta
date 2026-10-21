import type { ClockTime, ISODate } from '../models/types'

// Dates are handled as calendar strings and converted through UTC so that
// daylight-saving changes and the viewer's time zone never shift a day.

export function parseISODate(date: ISODate): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) throw new Error(`Invalid date: ${date}`)
  const [, y, m, d] = match
  const result = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
  if (result.getUTCMonth() !== Number(m) - 1) throw new Error(`Invalid date: ${date}`)
  return result
}

export function toISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = parseISODate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return toISODate(d)
}

/** Weekday where Monday is 0 and Sunday is 6. */
export function weekdayIndex(date: ISODate): number {
  return (parseISODate(date).getUTCDay() + 6) % 7
}

export function startOfWeek(date: ISODate): ISODate {
  return addDays(date, -weekdayIndex(date))
}

export function weekDays(weekStart: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function minutesOfDay(time: ClockTime): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  if (!match) throw new Error(`Invalid time: ${time}`)
  return Number(match[1]) * 60 + Number(match[2])
}

export function durationHours(start: ClockTime, end: ClockTime): number {
  return (minutesOfDay(end) - minutesOfDay(start)) / 60
}

/** Half-open intervals: a shift ending at 14:00 does not overlap one starting at 14:00. */
export function timesOverlap(aStart: ClockTime, aEnd: ClockTime, bStart: ClockTime, bEnd: ClockTime): boolean {
  return minutesOfDay(aStart) < minutesOfDay(bEnd) && minutesOfDay(bStart) < minutesOfDay(aEnd)
}

/** Comparable key for a date and time, e.g. "2026-11-09T07:30". */
export function dateTimeKey(date: ISODate, time: ClockTime): string {
  return `${date}T${time}`
}

const dayFormat = new Intl.DateTimeFormat('en-IE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const shortDayFormat = new Intl.DateTimeFormat('en-IE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat('en-IE', { weekday: 'short', timeZone: 'UTC' })
const dayNumberFormat = new Intl.DateTimeFormat('en-IE', { day: 'numeric', timeZone: 'UTC' })
const dayMonthFormat = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const rangeFormat = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const formatDay = (date: ISODate) => dayFormat.format(parseISODate(date))
export const formatShortDay = (date: ISODate) => shortDayFormat.format(parseISODate(date))
export const formatWeekday = (date: ISODate) => weekdayFormat.format(parseISODate(date))
export const formatDayNumber = (date: ISODate) => dayNumberFormat.format(parseISODate(date))

export function formatWeekRange(weekStart: ISODate): string {
  return `${dayMonthFormat.format(parseISODate(weekStart))} to ${rangeFormat.format(parseISODate(addDays(weekStart, 6)))}`
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-IE', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Dublin',
  }).format(d)
}
