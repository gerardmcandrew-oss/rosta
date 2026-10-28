import { createSampleState } from '../data/sampleData'
import type { DemoState, Persona } from '../models/types'
import { reconcileSignOffs } from '../rules/training'

export const STATE_KEY = 'rosta.demo.state.v1'
export const PERSONA_KEY = 'rosta.demo.persona.v1'

/** Minimal storage interface so the logic can be tested without a browser. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function browserStore(): KeyValueStore | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isString = (v: unknown): v is string => typeof v === 'string'

/** Structural check of stored data. Anything that fails is discarded rather than trusted. */
export function isDemoState(value: unknown): value is DemoState {
  if (!isObject(value)) return false
  const { employees, shifts, requests, training, viewWeek } = value
  return (
    Array.isArray(employees) &&
    employees.every((e) => isObject(e) && isString(e.id) && isString(e.name) && Array.isArray(e.availability) && Array.isArray(e.competencies)) &&
    Array.isArray(shifts) &&
    shifts.every((s) => isObject(s) && isString(s.id) && isString(s.date) && isString(s.start) && isString(s.end) && Array.isArray(s.requiredSkills) && (s.employeeId === null || isString(s.employeeId))) &&
    Array.isArray(requests) &&
    requests.every((r) => isObject(r) && isString(r.id) && isString(r.shiftId) && isString(r.status) && Array.isArray(r.history)) &&
    Array.isArray(training) &&
    training.every((t) => isObject(t) && isString(t.employeeId) && isString(t.taskId)) &&
    isString(viewWeek) &&
    /^\d{4}-\d{2}-\d{2}$/.test(viewWeek)
  )
}

export interface LoadResult {
  state: DemoState
  /** True when stored data existed but could not be read and was replaced. */
  recovered: boolean
  /** Employees whose saved manager sign-off was withdrawn because induction tasks are outstanding. */
  revokedSignOffs: string[]
}

export function loadState(store: KeyValueStore | null = browserStore()): LoadResult {
  const sample = (recovered = false): LoadResult => ({ state: createSampleState(), recovered, revokedSignOffs: [] })
  if (!store) return sample()
  let raw: string | null = null
  try {
    raw = store.getItem(STATE_KEY)
  } catch {
    return sample()
  }
  if (raw === null) return sample()
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isDemoState(parsed)) {
      // Data saved before the sign-off rule existed may hold a sign-off with tasks still outstanding.
      const { training, revoked } = reconcileSignOffs(parsed.training)
      return { state: revoked.length > 0 ? { ...parsed, training } : parsed, recovered: false, revokedSignOffs: revoked }
    }
  } catch {
    // fall through to recovery
  }
  return sample(true)
}

export function saveState(state: DemoState, store: KeyValueStore | null = browserStore()): boolean {
  if (!store) return false
  try {
    store.setItem(STATE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function resetState(store: KeyValueStore | null = browserStore()): DemoState {
  const fresh = createSampleState()
  saveState(fresh, store)
  return fresh
}

export function loadPersona(employeeIds: string[], store: KeyValueStore | null = browserStore()): Persona {
  try {
    const parsed: unknown = JSON.parse(store?.getItem(PERSONA_KEY) ?? 'null')
    if (isObject(parsed) && parsed.mode === 'manager') return { mode: 'manager' }
    if (isObject(parsed) && parsed.mode === 'employee' && isString(parsed.employeeId) && employeeIds.includes(parsed.employeeId)) {
      return { mode: 'employee', employeeId: parsed.employeeId }
    }
  } catch {
    // ignore and use the default
  }
  return { mode: 'manager' }
}

export function savePersona(persona: Persona, store: KeyValueStore | null = browserStore()): void {
  try {
    store?.setItem(PERSONA_KEY, JSON.stringify(persona))
  } catch {
    // Persona is a convenience; losing it is harmless.
  }
}
