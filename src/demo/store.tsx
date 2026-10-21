import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEMO_NOW, DEMO_NOW_ISO, SAMPLE_WEEK } from '../data/sampleData'
import type { DemoState, Employee, Persona, TaskId } from '../models/types'
import { assignShift, completeTask, undoTask } from '../rules/actions'
import type { IneligibilityReason } from '../rules/eligibility'
import {
  approveRequest,
  cancelRequest,
  createRequest,
  rejectRequest,
  respondToRequest,
  type CreateRequestInput,
  type Result,
} from '../rules/requests'
import { loadPersona, loadState, resetState, savePersona, saveState } from '../services/storage'
import { addDays } from '../utils/date'

export interface Toast {
  id: number
  tone: 'ok' | 'bad'
  title: string
  reasons?: IneligibilityReason[]
}

export type ActionOutcome = { ok: true } | { ok: false; error: string; reasons?: IneligibilityReason[] }

interface DemoContextValue {
  state: DemoState
  persona: Persona
  /** The employee record behind the current persona (the manager in manager mode). */
  actor: Employee
  now: string
  recovered: boolean
  toasts: Toast[]
  dismissToast: (id: number) => void
  setPersona: (p: Persona) => void
  setWeek: (weekStart: string) => void
  shiftWeek: (delta: number) => void
  returnToSampleWeek: () => void
  reset: () => void
  requestCover: (input: Omit<CreateRequestInput, 'requesterId'>) => ActionOutcome
  respond: (requestId: string, accept: boolean, note?: string) => ActionOutcome
  approve: (requestId: string) => ActionOutcome
  reject: (requestId: string, note?: string) => ActionOutcome
  cancel: (requestId: string) => ActionOutcome
  complete: (employeeId: string, taskId: TaskId) => ActionOutcome
  undo: (employeeId: string, taskId: TaskId) => ActionOutcome
  assign: (shiftId: string, employeeId: string) => ActionOutcome
}

const DemoContext = createContext<DemoContextValue | null>(null)

export const MANAGER_ID = 'e01'

/**
 * The demo clock stands still at Monday 07:00 of the sample week. Each new
 * event is stamped a couple of minutes after the latest one so request
 * histories stay in order.
 */
function nextTimestamp(state: DemoState): string {
  const latest = [
    DEMO_NOW_ISO,
    ...state.requests.flatMap((r) => r.history.map((h) => h.at)),
    ...state.training.map((t) => t.completedAt),
  ].reduce((a, b) => (b > a ? b : a))
  const base = Math.max(new Date(latest).getTime(), new Date(DEMO_NOW_ISO).getTime())
  return new Date(base + 2 * 60_000).toISOString()
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [{ state: initial, recovered }] = useState(() => loadState())
  const [state, setState] = useState<DemoState>(initial)
  const [persona, setPersonaState] = useState<Persona>(() => loadPersona(initial.employees.map((e) => e.id)))
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    saveState(state)
  }, [state])

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { ...toast, id }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.tone === 'bad' ? 7000 : 4200)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  /** Runs a rule against the latest state, commits on success and reports the outcome. */
  const run = useCallback(
    (fn: (s: DemoState, at: string) => Result): ActionOutcome => {
      const current = stateRef.current
      const result = fn(current, nextTimestamp(current))
      if (result.ok) {
        stateRef.current = result.state
        setState(result.state)
        pushToast({ tone: 'ok', title: result.message })
        return { ok: true }
      }
      pushToast({ tone: 'bad', title: result.error, reasons: result.reasons })
      return { ok: false, error: result.error, reasons: result.reasons }
    },
    [pushToast],
  )

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p)
    savePersona(p)
  }, [])

  const actorId = persona.mode === 'manager' ? MANAGER_ID : persona.employeeId
  const actor = state.employees.find((e) => e.id === actorId) ?? state.employees[0]!
  const actorRole = persona.mode

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      persona,
      actor,
      now: DEMO_NOW,
      recovered,
      toasts,
      dismissToast,
      setPersona,
      setWeek: (viewWeek) => setState((s) => ({ ...s, viewWeek })),
      shiftWeek: (delta) => setState((s) => ({ ...s, viewWeek: addDays(s.viewWeek, delta * 7) })),
      returnToSampleWeek: () => setState((s) => ({ ...s, viewWeek: SAMPLE_WEEK })),
      reset: () => {
        const fresh = resetState()
        stateRef.current = fresh
        setState(fresh)
        pushToast({ tone: 'ok', title: 'Sample data restored.' })
      },
      requestCover: (input) => run((s, at) => createRequest(s, { ...input, requesterId: actor.id }, at, DEMO_NOW)),
      respond: (id, accept, note) => run((s, at) => respondToRequest(s, id, actor.id, accept, at, note)),
      approve: (id) => run((s, at) => approveRequest(s, id, MANAGER_ID, at, DEMO_NOW)),
      reject: (id, note) => run((s, at) => rejectRequest(s, id, MANAGER_ID, at, note)),
      cancel: (id) => run((s, at) => cancelRequest(s, id, actor.id, at)),
      complete: (employeeId, taskId) =>
        run((s, at) => completeTask(s, employeeId, taskId, actorRole === 'manager' ? 'manager' : 'employee', at)),
      undo: (employeeId, taskId) => run((s) => undoTask(s, employeeId, taskId, actorRole === 'manager' ? 'manager' : 'employee')),
      assign: (shiftId, employeeId) => run((s) => assignShift(s, shiftId, employeeId, DEMO_NOW)),
    }),
    [state, persona, actor, recovered, toasts, dismissToast, setPersona, run, pushToast, actorRole],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider')
  return ctx
}

export function useEmployee(id: string | null | undefined): Employee | undefined {
  const { state } = useDemo()
  return state.employees.find((e) => e.id === id)
}

export const firstName = (e: Employee | undefined) => e?.name.split(' ')[0] ?? 'Unassigned'
