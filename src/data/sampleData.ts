// Harbour Lane Café, Dublin. Fictional business and sample data.
// Every person, shift and request below is invented for the demonstration.

import type { AvailabilityWindow, DemoState, Employee, Shift, ShiftRequest, SkillId, TaskId, TrainingRecord } from '../models/types'
import { ONBOARDING_TASKS } from './catalogue'

export const CAFE_NAME = 'Harbour Lane Café'
export const CAFE_LOCATION = 'Dublin'

/** The fixed demonstration week: Monday 9 to Sunday 15 November 2026. */
export const SAMPLE_WEEK = '2026-11-09'
/** The demo clock. "Now" is always this moment so the sample week stays usable. */
export const DEMO_NOW = '2026-11-09T07:00'
/** The same moment as a real timestamp (Dublin is on UTC in November). */
export const DEMO_NOW_ISO = '2026-11-09T07:00:00.000Z'

const days = (weekdays: number[], from = '07:00', to = '18:00'): AvailabilityWindow[] =>
  weekdays.map((weekday) => ({ weekday, from, to }))

const MON_FRI = [0, 1, 2, 3, 4]

function employee(
  id: string,
  name: string,
  role: Employee['role'],
  competencies: SkillId[],
  availability: AvailabilityWindow[],
  extra: Partial<Employee> = {},
): Employee {
  return { id, name, role, status: 'active', startDate: '2024-03-04', competencies, availability, contractedHours: 30, ...extra }
}

export const SAMPLE_EMPLOYEES: Employee[] = [
  employee('e01', 'Niamh Gallagher', 'manager', ['supervisor', 'barista'], days(MON_FRI), { startDate: '2021-05-10', contractedHours: 39 }),
  employee('e02', 'Darragh Byrne', 'supervisor', ['supervisor', 'barista'], days([0, 1, 2, 5, 6]), { startDate: '2022-08-15', contractedHours: 38 }),
  employee('e03', 'Chiara Rossi', 'supervisor', ['supervisor', 'barista'], days([2, 3, 4, 5, 6]), { startDate: '2023-02-01', contractedHours: 38 }),
  employee('e04', 'Seán Ó Briain', 'barista', ['barista'], days([0, 1, 2, 3, 4, 5]), { startDate: '2023-09-18' }),
  employee('e05', 'Priya Nair', 'barista', ['barista'], days(MON_FRI), { startDate: '2024-01-08' }),
  employee('e06', 'Tomasz Kowalski', 'barista', ['barista'], days([1, 2, 3, 4, 5, 6]), { startDate: '2024-06-03' }),
  employee('e07', 'Ciara Doyle', 'till', [], days(MON_FRI), { startDate: '2024-04-22', contractedHours: 25 }),
  employee('e08', 'Grace Okafor', 'till', [], days([0, 2, 3, 4, 5]), { startDate: '2025-01-13', contractedHours: 25 }),
  employee('e09', 'Mateus Silva', 'floor', [], days([0, 1, 2, 3, 4, 5]), { startDate: '2025-03-10', contractedHours: 24 }),
  employee('e10', 'Hannah Murphy', 'floor', [], [{ weekday: 4, from: '12:00', to: '18:00' }, ...days([5, 6])], {
    startDate: '2025-06-02',
    contractedHours: 16,
  }),
  employee('e11', 'Liam Fitzgerald', 'floor', [], days(MON_FRI), { status: 'on-leave', startDate: '2024-09-09', contractedHours: 20 }),
  employee('e12', 'Aoife Kelly', 'new-starter', [], days([1, 3, 4, 5]), { startDate: '2026-11-02', contractedHours: 20 }),
  employee('e13', 'Yusuf Demir', 'new-starter', [], days(MON_FRI), { startDate: '2026-11-09', contractedHours: 20 }),
]

const ALL_TASKS = ONBOARDING_TASKS.map((t) => t.id)
const SELF_TASKS: TaskId[] = ['handbook', 'workplace-intro', 'food-safety', 'customer-service']

function completed(employeeId: string, taskIds: TaskId[], date: string): TrainingRecord[] {
  return taskIds.map((taskId) => ({
    employeeId,
    taskId,
    completedAt: `${date}T10:00:00.000Z`,
    confirmedBy: ONBOARDING_TASKS.find((t) => t.id === taskId)!.completedBy,
  }))
}

export const SAMPLE_TRAINING: TrainingRecord[] = [
  ...completed('e01', ALL_TASKS, '2021-05-24'),
  ...completed('e02', ALL_TASKS, '2022-08-29'),
  ...completed('e03', ALL_TASKS, '2023-02-15'),
  ...completed('e04', ALL_TASKS, '2023-10-02'),
  ...completed('e05', ALL_TASKS, '2024-01-22'),
  ...completed('e06', ALL_TASKS, '2024-06-17'),
  ...completed('e07', ALL_TASKS, '2024-05-06'),
  ...completed('e08', ALL_TASKS, '2025-01-27'),
  // Floor team: trained for floor service but not yet on the till, so the
  // final manager sign-off is still to come.
  ...completed('e09', SELF_TASKS, '2025-03-24'),
  ...completed('e10', SELF_TASKS, '2025-06-16'),
  ...completed('e11', ALL_TASKS, '2024-09-23'),
  // New starters at different stages.
  ...completed('e12', ['handbook', 'workplace-intro', 'food-safety', 'customer-service'], '2026-11-04'),
  ...completed('e13', ['handbook'], '2026-11-06'),
]

type ShiftRow = [id: string, date: string, role: Shift['role'], start: string, end: string, employeeId: string | null]

const REQUIRED: Record<Shift['role'], SkillId[]> = {
  supervisor: ['supervisor'],
  barista: ['barista'],
  till: ['till'],
  floor: ['floor'],
}

const SHIFT_ROWS: ShiftRow[] = [
  // Monday 9 November
  ['s-0901', '2026-11-09', 'supervisor', '07:00', '15:00', 'e02'],
  ['s-0902', '2026-11-09', 'barista', '07:30', '15:00', 'e04'],
  ['s-0903', '2026-11-09', 'barista', '10:00', '17:00', 'e05'],
  ['s-0904', '2026-11-09', 'till', '07:30', '13:30', 'e07'],
  ['s-0905', '2026-11-09', 'floor', '11:00', '17:00', 'e09'],
  // Tuesday 10 November
  ['s-1001', '2026-11-10', 'supervisor', '07:00', '15:00', 'e02'],
  ['s-1002', '2026-11-10', 'barista', '07:30', '15:00', 'e04'],
  ['s-1003', '2026-11-10', 'barista', '10:00', '17:00', 'e05'],
  ['s-1004', '2026-11-10', 'till', '08:00', '14:00', 'e07'],
  ['s-1005', '2026-11-10', 'floor', '10:00', '16:00', 'e12'],
  ['s-1006', '2026-11-10', 'floor', '12:00', '17:00', 'e09'],
  // Wednesday 11 November
  ['s-1101', '2026-11-11', 'supervisor', '07:00', '15:00', 'e03'],
  ['s-1102', '2026-11-11', 'barista', '07:30', '15:00', 'e05'],
  ['s-1103', '2026-11-11', 'barista', '09:00', '17:00', 'e06'],
  ['s-1104', '2026-11-11', 'till', '07:30', '13:30', 'e08'],
  ['s-1105', '2026-11-11', 'till', '12:00', '17:00', 'e07'],
  ['s-1106', '2026-11-11', 'floor', '10:00', '16:00', 'e09'],
  // Thursday 12 November
  ['s-1201', '2026-11-12', 'supervisor', '07:00', '15:00', 'e03'],
  ['s-1202', '2026-11-12', 'barista', '07:30', '15:00', 'e04'],
  ['s-1203', '2026-11-12', 'barista', '09:00', '17:00', 'e05'],
  ['s-1204', '2026-11-12', 'till', '07:30', '12:00', 'e08'],
  ['s-1205', '2026-11-12', 'till', '11:00', '17:00', 'e07'],
  ['s-1206', '2026-11-12', 'floor', '10:00', '16:00', 'e09'],
  // Friday 13 November
  ['s-1301', '2026-11-13', 'supervisor', '07:00', '15:00', 'e03'],
  ['s-1302', '2026-11-13', 'barista', '07:30', '15:00', 'e06'],
  ['s-1303', '2026-11-13', 'barista', '10:00', '17:00', 'e04'],
  ['s-1304', '2026-11-13', 'till', '07:30', '13:30', 'e07'],
  ['s-1305', '2026-11-13', 'till', '12:00', '17:00', 'e08'],
  ['s-1306', '2026-11-13', 'floor', '12:00', '17:00', 'e09'],
  ['s-1307', '2026-11-13', 'floor', '10:00', '16:00', 'e12'],
  // Saturday 14 November
  ['s-1401', '2026-11-14', 'supervisor', '08:00', '16:00', 'e02'],
  ['s-1402', '2026-11-14', 'barista', '08:30', '16:30', 'e06'],
  ['s-1403', '2026-11-14', 'barista', '10:00', '17:00', 'e04'],
  ['s-1404', '2026-11-14', 'till', '08:30', '14:30', 'e08'],
  ['s-1405', '2026-11-14', 'floor', '09:00', '15:00', 'e10'],
  ['s-1406', '2026-11-14', 'floor', '11:00', '17:00', 'e12'],
  ['s-1407', '2026-11-14', 'floor', '10:00', '16:00', null],
  // Sunday 15 November
  ['s-1501', '2026-11-15', 'supervisor', '09:00', '16:00', 'e03'],
  ['s-1502', '2026-11-15', 'barista', '09:30', '16:00', 'e06'],
  ['s-1503', '2026-11-15', 'till', '09:30', '16:00', 'e02'],
  ['s-1504', '2026-11-15', 'floor', '10:00', '16:00', 'e10'],
  // Monday 16 and Tuesday 17 November (following week, partly planned)
  ['s-1601', '2026-11-16', 'supervisor', '07:00', '15:00', 'e02'],
  ['s-1602', '2026-11-16', 'barista', '07:30', '15:00', 'e04'],
  ['s-1603', '2026-11-16', 'till', '07:30', '13:30', 'e07'],
  ['s-1604', '2026-11-16', 'floor', '11:00', '17:00', 'e09'],
  ['s-1701', '2026-11-17', 'supervisor', '07:00', '15:00', 'e02'],
  ['s-1702', '2026-11-17', 'barista', '07:30', '15:00', 'e06'],
  ['s-1703', '2026-11-17', 'till', '08:00', '14:00', 'e07'],
  ['s-1704', '2026-11-17', 'floor', '10:00', '16:00', 'e12'],
]

export const SAMPLE_SHIFTS: Shift[] = SHIFT_ROWS.map(([id, date, role, start, end, employeeId]) => ({
  id,
  employeeId,
  date,
  start,
  end,
  role,
  requiredSkills: REQUIRED[role],
  status: employeeId ? 'scheduled' : 'open',
}))

// Tuesday's early barista shift was Tomasz's until an approved replacement moved it to Seán.
const tuesdayBarista = SAMPLE_SHIFTS.find((s) => s.id === 's-1002')!
tuesdayBarista.status = 'reassigned'
tuesdayBarista.originalEmployeeId = 'e06'

export const SAMPLE_REQUESTS: ShiftRequest[] = [
  {
    id: 'r-001',
    shiftId: 's-1002',
    requesterId: 'e06',
    proposedId: 'e04',
    reason: 'College exam on Tuesday morning.',
    status: 'approved',
    createdAt: '2026-11-04T18:20:00.000Z',
    history: [
      { at: '2026-11-04T18:20:00.000Z', status: 'pending-colleague', actorId: 'e06' },
      { at: '2026-11-04T19:05:00.000Z', status: 'pending-manager', actorId: 'e04' },
      { at: '2026-11-05T08:40:00.000Z', status: 'approved', actorId: 'e01' },
    ],
  },
  {
    id: 'r-002',
    shiftId: 's-0904',
    requesterId: 'e07',
    proposedId: 'e08',
    reason: 'Dentist appointment.',
    status: 'declined',
    createdAt: '2026-11-06T12:10:00.000Z',
    history: [
      { at: '2026-11-06T12:10:00.000Z', status: 'pending-colleague', actorId: 'e07' },
      { at: '2026-11-06T16:45:00.000Z', status: 'declined', actorId: 'e08', note: 'Sorry, I have lectures on Monday.' },
    ],
  },
  {
    id: 'r-003',
    shiftId: 's-1306',
    requesterId: 'e09',
    proposedId: 'e10',
    reason: 'Family visiting for the weekend.',
    status: 'pending-manager',
    createdAt: '2026-11-07T10:30:00.000Z',
    history: [
      { at: '2026-11-07T10:30:00.000Z', status: 'pending-colleague', actorId: 'e09' },
      { at: '2026-11-07T13:15:00.000Z', status: 'pending-manager', actorId: 'e10', note: 'Happy to take it.' },
    ],
  },
  {
    id: 'r-004',
    shiftId: 's-1401',
    requesterId: 'e02',
    proposedId: 'e03',
    reason: 'Wedding in Galway.',
    status: 'pending-colleague',
    createdAt: '2026-11-08T20:00:00.000Z',
    history: [{ at: '2026-11-08T20:00:00.000Z', status: 'pending-colleague', actorId: 'e02' }],
  },
]

export function createSampleState(): DemoState {
  return structuredClone({
    employees: SAMPLE_EMPLOYEES,
    shifts: SAMPLE_SHIFTS,
    requests: SAMPLE_REQUESTS,
    training: SAMPLE_TRAINING,
    viewWeek: SAMPLE_WEEK,
  })
}
