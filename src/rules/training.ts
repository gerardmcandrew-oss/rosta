import { CORE_TASKS, ONBOARDING_TASKS, SKILLS, taskById } from '../data/catalogue'
import type { Employee, SkillId, TaskId, TrainingRecord } from '../models/types'

export function completedTaskIds(employeeId: string, training: TrainingRecord[]): Set<TaskId> {
  return new Set(training.filter((r) => r.employeeId === employeeId).map((r) => r.taskId))
}

export function hasCompletedTask(employeeId: string, taskId: TaskId, training: TrainingRecord[]): boolean {
  return training.some((r) => r.employeeId === employeeId && r.taskId === taskId)
}

export interface InductionProgress {
  completed: number
  total: number
  percent: number
  outstanding: TaskId[]
}

export function inductionProgress(employeeId: string, training: TrainingRecord[]): InductionProgress {
  const done = completedTaskIds(employeeId, training)
  const outstanding = ONBOARDING_TASKS.map((t) => t.id).filter((id) => !done.has(id))
  const total = ONBOARDING_TASKS.length
  const completed = total - outstanding.length
  return { completed, total, percent: Math.round((completed / total) * 100), outstanding }
}

export function missingCoreTasks(employeeId: string, training: TrainingRecord[]): TaskId[] {
  const done = completedTaskIds(employeeId, training)
  return CORE_TASKS.filter((id) => !done.has(id))
}

export interface SkillCheck {
  skill: SkillId
  ok: boolean
  missingTasks: TaskId[]
  missingCompetency: boolean
}

/**
 * A skill counts only when its induction tasks are complete and, for
 * experience-based skills, a manager has recorded the competency.
 * Overall induction percentage is deliberately not used here.
 */
export function checkSkill(employee: Employee, skill: SkillId, training: TrainingRecord[]): SkillCheck {
  const def = SKILLS[skill]
  const done = completedTaskIds(employee.id, training)
  const missingTasks = def.requiresTasks.filter((id) => !done.has(id))
  const missingCompetency = def.requiresCompetency && !employee.competencies.includes(skill)
  return { skill, ok: missingTasks.length === 0 && !missingCompetency, missingTasks, missingCompetency }
}

export function qualifiedSkills(employee: Employee, training: TrainingRecord[]): SkillId[] {
  return (Object.keys(SKILLS) as SkillId[]).filter((s) => checkSkill(employee, s, training).ok)
}

export function describeSkillGap(check: SkillCheck): string {
  const label = SKILLS[check.skill].label
  if (check.missingTasks.length > 0) {
    return `${taskById(check.missingTasks[0]!).title} not completed (needed for ${label.toLowerCase()} shifts)`
  }
  return `No ${label.toLowerCase()} experience recorded by a manager`
}

export const SIGN_OFF_TASK: TaskId = 'manager-sign-off'

/**
 * The final manager sign-off confirms the whole induction, so every other
 * task has to be complete first. Shift eligibility does not depend on it.
 */
export function signOffPrerequisitesMissing(employeeId: string, training: TrainingRecord[]): TaskId[] {
  const done = completedTaskIds(employeeId, training)
  return ONBOARDING_TASKS.map((t) => t.id).filter((id) => id !== SIGN_OFF_TASK && !done.has(id))
}

export function describeSignOffBlocker(missing: TaskId[]): string {
  return `Complete ${missing.map((id) => taskById(id).title.toLowerCase()).join(', ')} first.`
}

/**
 * Removes sign-offs whose prerequisites are no longer all complete, for
 * example in data saved before the rule existed. Returns who was affected.
 */
export function reconcileSignOffs(training: TrainingRecord[]): { training: TrainingRecord[]; revoked: string[] } {
  const revoked = training
    .filter((r) => r.taskId === SIGN_OFF_TASK && signOffPrerequisitesMissing(r.employeeId, training).length > 0)
    .map((r) => r.employeeId)
  if (revoked.length === 0) return { training, revoked }
  return { training: training.filter((r) => !(r.taskId === SIGN_OFF_TASK && revoked.includes(r.employeeId))), revoked }
}
