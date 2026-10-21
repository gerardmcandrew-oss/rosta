import type { DemoState } from '../models/types'
import { addDays, durationHours } from '../utils/date'
import { assignmentIssues, isOpenRequest } from './eligibility'
import { hasStarted } from './scheduling'
import { inductionProgress } from './training'

export interface DashboardMetrics {
  activeStaff: number
  staffOnLeave: number
  weekShifts: number
  upcomingShifts: number
  openShifts: number
  pendingRequests: number
  awaitingManager: number
  teamInductionPercent: number
  inductionsInProgress: number
  employeesNeedingTraining: number
  coveredShifts: number
  coveragePercent: number
  scheduledHours: number
}

/** Every figure is derived from the underlying records for the given week. */
export function computeMetrics(state: DemoState, weekStart: string, now: string): DashboardMetrics {
  const weekEnd = addDays(weekStart, 6)
  const weekShifts = state.shifts.filter((s) => s.date >= weekStart && s.date <= weekEnd)
  const active = state.employees.filter((e) => e.status === 'active')

  const progress = active.map((e) => inductionProgress(e.id, state.training))
  const totalTasks = progress.reduce((n, p) => n + p.total, 0)
  const doneTasks = progress.reduce((n, p) => n + p.completed, 0)

  const covered = weekShifts.filter((s) => s.employeeId !== null && assignmentIssues(state, s).length === 0)
  const open = state.requests.filter(isOpenRequest)

  const hours = weekShifts.reduce((n, s) => n + durationHours(s.start, s.end), 0)

  return {
    activeStaff: active.length,
    staffOnLeave: state.employees.length - active.length,
    weekShifts: weekShifts.length,
    upcomingShifts: weekShifts.filter((s) => !hasStarted(s, now)).length,
    openShifts: weekShifts.filter((s) => s.employeeId === null).length,
    pendingRequests: open.length,
    awaitingManager: open.filter((r) => r.status === 'pending-manager').length,
    teamInductionPercent: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
    inductionsInProgress: progress.filter((p) => p.completed < p.total).length,
    employeesNeedingTraining: progress.filter((p) => p.outstanding.length > 0).length,
    coveredShifts: covered.length,
    coveragePercent: weekShifts.length === 0 ? 0 : Math.round((covered.length / weekShifts.length) * 100),
    scheduledHours: hours,
  }
}
