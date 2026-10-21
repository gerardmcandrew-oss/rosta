import { createSampleState, DEMO_NOW } from '../data/sampleData'
import type { DemoState, Shift } from '../models/types'

export const NOW = DEMO_NOW
export const AT = '2026-11-09T07:05:00.000Z'

export const fresh = (): DemoState => createSampleState()

export function shift(state: DemoState, id: string): Shift {
  const found = state.shifts.find((s) => s.id === id)
  if (!found) throw new Error(`No shift ${id}`)
  return found
}

export function employee(state: DemoState, id: string) {
  const found = state.employees.find((e) => e.id === id)
  if (!found) throw new Error(`No employee ${id}`)
  return found
}

/** Unwraps a successful result or fails the test with the error. */
export function ok<T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> {
  if (!result.ok) throw new Error(`Expected success, got: ${JSON.stringify(result)}`)
  return result as Extract<T, { ok: true }>
}

export class MemoryStore {
  data = new Map<string, string>()
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
}
