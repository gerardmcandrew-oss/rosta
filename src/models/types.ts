/** ISO calendar date, e.g. "2026-11-09". */
export type ISODate = string
/** 24-hour clock time, e.g. "07:30". */
export type ClockTime = string

export type RoleId = 'manager' | 'supervisor' | 'barista' | 'till' | 'floor' | 'new-starter'

/**
 * Skills a shift can require. Some are earned through induction tasks
 * (till, floor) and some are competencies a manager records from
 * experience (barista, supervisor).
 */
export type SkillId = 'barista' | 'till' | 'floor' | 'supervisor'

export type TaskId =
  | 'handbook'
  | 'workplace-intro'
  | 'food-safety'
  | 'till-training'
  | 'customer-service'
  | 'manager-sign-off'

export interface OnboardingTask {
  id: TaskId
  title: string
  description: string
  /** Self-service tasks can be marked complete by the employee. Others need manager mode. */
  completedBy: 'employee' | 'manager'
  estimatedMinutes: number
}

export interface SkillDefinition {
  id: SkillId
  label: string
  /** Induction tasks that must be complete before the skill counts. */
  requiresTasks: TaskId[]
  /** When true the manager must also have recorded the competency on the employee. */
  requiresCompetency: boolean
}

/** A window of availability on a weekday. Weekday 0 is Monday. */
export interface AvailabilityWindow {
  weekday: number
  from: ClockTime
  to: ClockTime
}

export interface Employee {
  id: string
  name: string
  role: RoleId
  status: 'active' | 'on-leave'
  startDate: ISODate
  /** Competencies recorded by a manager, e.g. an experienced barista. */
  competencies: SkillId[]
  availability: AvailabilityWindow[]
  contractedHours: number
}

export interface TrainingRecord {
  employeeId: string
  taskId: TaskId
  completedAt: string
  confirmedBy: 'employee' | 'manager'
}

export type ShiftStatus = 'scheduled' | 'reassigned' | 'open'

export interface Shift {
  id: string
  /** Null when the shift is open and needs someone assigned. */
  employeeId: string | null
  date: ISODate
  start: ClockTime
  end: ClockTime
  role: Exclude<RoleId, 'manager' | 'new-starter'>
  requiredSkills: SkillId[]
  status: ShiftStatus
  /** Set when an approved replacement moved the shift to someone else. */
  originalEmployeeId?: string
}

export type RequestStatus =
  | 'pending-colleague'
  | 'pending-manager'
  | 'approved'
  | 'rejected'
  | 'declined'
  | 'cancelled'

export interface RequestEvent {
  at: string
  status: RequestStatus
  actorId: string
  note?: string
}

export interface ShiftRequest {
  id: string
  shiftId: string
  requesterId: string
  proposedId: string
  reason: string
  status: RequestStatus
  createdAt: string
  history: RequestEvent[]
}

export interface DemoState {
  employees: Employee[]
  shifts: Shift[]
  requests: ShiftRequest[]
  training: TrainingRecord[]
  /** Monday of the week shown in the rota. */
  viewWeek: ISODate
}

export type Persona = { mode: 'manager' } | { mode: 'employee'; employeeId: string }
