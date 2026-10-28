import { taskById } from '../data/catalogue'
import type { DemoState, TaskId } from '../models/types'
import { evaluateCandidate, isOpenRequest } from './eligibility'
import type { Result } from './requests'
import { hasStarted } from './scheduling'
import { describeSignOffBlocker, hasCompletedTask, SIGN_OFF_TASK, signOffPrerequisitesMissing } from './training'

/** Marks an induction task complete. Manager-confirmed tasks need manager mode. */
export function completeTask(state: DemoState, employeeId: string, taskId: TaskId, actor: 'employee' | 'manager', at: string): Result {
  const task = taskById(taskId)
  if (!state.employees.some((e) => e.id === employeeId)) return { ok: false, error: 'Employee not found.' }
  if (task.completedBy === 'manager' && actor !== 'manager') {
    return { ok: false, error: `${task.title} has to be confirmed by a manager.` }
  }
  if (hasCompletedTask(employeeId, taskId, state.training)) return { ok: false, error: 'Already completed.' }
  if (taskId === SIGN_OFF_TASK) {
    const missing = signOffPrerequisitesMissing(employeeId, state.training)
    if (missing.length > 0) return { ok: false, error: `Manager sign-off is not available yet. ${describeSignOffBlocker(missing)}` }
  }
  return {
    ok: true,
    state: { ...state, training: [...state.training, { employeeId, taskId, completedAt: at, confirmedBy: actor }] },
    message: actor === 'manager' ? `${task.title} confirmed.` : `${task.title} done.`,
  }
}

/**
 * Manager reverses a task, e.g. if it was confirmed by mistake. Undoing any
 * other task also withdraws the final sign-off, which then has to be given again.
 */
export function undoTask(state: DemoState, employeeId: string, taskId: TaskId, actor: 'employee' | 'manager'): Result {
  const record = state.training.find((r) => r.employeeId === employeeId && r.taskId === taskId)
  if (!record) return { ok: false, error: 'Not completed yet.' }
  if (actor !== 'manager' && record.confirmedBy === 'manager') return { ok: false, error: 'Only a manager can undo this.' }
  const signOff = state.training.find((r) => r.employeeId === employeeId && r.taskId === SIGN_OFF_TASK)
  const withdrawSignOff = taskId !== SIGN_OFF_TASK && signOff !== undefined
  return {
    ok: true,
    state: { ...state, training: state.training.filter((r) => r !== record && !(withdrawSignOff && r === signOff)) },
    message: withdrawSignOff
      ? `${taskById(taskId).title} marked as not done. Manager sign-off removed: a fresh sign-off is needed once every task is complete.`
      : `${taskById(taskId).title} marked as not done.`,
  }
}

/** Manager assigns a shift directly from the rota, with the same eligibility rules as replacements. */
export function assignShift(state: DemoState, shiftId: string, employeeId: string, now: string): Result {
  const shift = state.shifts.find((s) => s.id === shiftId)
  const employee = state.employees.find((e) => e.id === employeeId)
  if (!shift || !employee) return { ok: false, error: 'Shift or employee not found.' }
  if (hasStarted(shift, now)) return { ok: false, error: 'This shift has already started.' }
  if (state.requests.some((r) => r.shiftId === shift.id && isOpenRequest(r))) {
    return { ok: false, error: 'Resolve the open replacement request for this shift first.' }
  }
  const check = evaluateCandidate(state, shift, employee)
  if (!check.eligible) return { ok: false, error: `${employee.name} cannot take this shift.`, reasons: check.reasons }

  const wasOpen = shift.employeeId === null
  return {
    ok: true,
    state: {
      ...state,
      shifts: state.shifts.map((s) => (s.id === shift.id ? { ...s, employeeId, status: wasOpen ? 'scheduled' : s.status } : s)),
    },
    message: `${employee.name.split(' ')[0]} assigned.`,
  }
}
