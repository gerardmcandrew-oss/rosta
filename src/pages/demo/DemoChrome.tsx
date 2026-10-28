import { AlertTriangle, Check, CheckCircle2, RotateCcw, ShieldAlert, UserCog, X } from 'lucide-react'
import { useState } from 'react'
import { ROLE_LABELS } from '../../data/catalogue'
import type { Persona } from '../../models/types'
import { SCENARIOS, type Scenario } from '../../demo/scenarios'
import { Avatar, Button, Sheet } from '../../components/ui'
import { ReasonList } from '../../demo/components/common'
import { MANAGER_ID, useDemo } from '../../demo/store'

/** Persona switcher. A demonstration convenience, not a login. */
export function PersonaSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, persona, setPersona } = useDemo()
  const choose = (p: Persona) => {
    setPersona(p)
    onClose()
  }
  const staff = state.employees.filter((e) => e.id !== MANAGER_ID)
  const current = persona.mode === 'employee' ? persona.employeeId : null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="View the demo as"
      description="Switching persona is a demonstration feature, not a secure login. Everyone shares the same data in this browser."
    >
      <button
        type="button"
        onClick={() => choose({ mode: 'manager' })}
        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${persona.mode === 'manager' ? 'border-navy ring-1 ring-navy' : 'border-line hover:border-slate/50'}`}
      >
        <span className="grid size-10 place-items-center rounded-full bg-navy text-lime">
          <UserCog className="size-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Manager</span>
          <span className="block text-xs text-muted">Niamh Gallagher · approvals, rota, induction sign-off</span>
        </span>
        {persona.mode === 'manager' && <Check className="size-5 text-navy" aria-label="Current" />}
      </button>

      <h3 className="mt-5 mb-2 text-sm font-semibold">Employees</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {staff.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => choose({ mode: 'employee', employeeId: e.id })}
              className={`flex w-full items-center gap-2.5 rounded-2xl border p-2.5 text-left ${current === e.id ? 'border-navy ring-1 ring-navy' : 'border-line hover:border-slate/50'}`}
            >
              <Avatar name={e.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{e.name}</span>
                <span className="block truncate text-xs text-muted">
                  {ROLE_LABELS[e.role]}
                  {e.status === 'on-leave' ? ' · on leave' : ''}
                </span>
              </span>
              {current === e.id && <Check className="size-4 text-navy" aria-label="Current" />}
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

export function GuideSheet({
  open,
  onClose,
  onStart,
  onReset,
}: {
  open: boolean
  onClose: () => void
  onStart: (scenario: Scenario) => void
  onReset: () => void
}) {
  const { state, now } = useDemo()
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Things to try"
      description="Four scenarios. The outcomes come from the eligibility rules running on the sample records. Start switches persona and opens the sample week."
    >
      <ol className="space-y-3">
        {SCENARIOS.map((s) => {
          const changed = s.changed(state, now)
          return (
            <li key={s.id} className="rounded-2xl border border-line p-4" data-testid={`scenario-${s.id}`}>
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-navy text-xs font-bold text-lime">{s.id}</span>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted marker:text-slate">
                {s.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {changed && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-warn-bg p-3 text-sm text-warn" data-testid={`scenario-${s.id}-changed`}>
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    {changed} Your demo changes are kept. To run this scenario as written, reset the sample data first.
                  </p>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => onStart(s)}>
                  {s.personaLabel}
                </Button>
                {changed && (
                  <Button size="sm" variant="ghost" onClick={onReset}>
                    <RotateCcw className="size-4" aria-hidden="true" /> Reset sample data
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-xs text-muted">Tip: use Reset sample data to run a scenario again from the start.</p>
    </Sheet>
  )
}

export function ResetSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { reset } = useDemo()
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reset sample data?"
      description="This removes every change made in this browser: requests, approvals, induction ticks and rota changes."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reset sample data
          </Button>
          <Button variant="ghost" size="lg" onClick={onClose}>
            Keep my changes
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted">The fictional Harbour Lane Café week will be restored exactly as it started.</p>
    </Sheet>
  )
}

export function Toasts() {
  const { toasts, dismissToast } = useDemo()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'bad' ? 'alert' : 'status'}
          className="pointer-events-auto flex w-full max-w-sm animate-toast items-start gap-3 rounded-2xl bg-navy px-4 py-3 text-paper shadow-float"
        >
          {t.tone === 'ok' ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden="true" />
          ) : (
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#ff9fb2]" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{t.title}</p>
            {t.reasons && <ReasonList reasons={t.reasons} className="mt-1 [&_li]:!text-paper/80" />}
          </div>
          <button type="button" onClick={() => dismissToast(t.id)} className="-mr-1 grid size-8 place-items-center rounded-full text-paper/60 hover:bg-white/10" aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function RecoveredNotice() {
  const { state, recovered, revokedSignOffs } = useDemo()
  const [hidden, setHidden] = useState(false)
  if ((!recovered && revokedSignOffs.length === 0) || hidden) return null
  const names = revokedSignOffs.map((id) => state.employees.find((e) => e.id === id)?.name ?? id)
  const who = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
  return (
    <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl bg-warn-bg p-4 text-sm text-warn">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        {recovered
          ? 'Saved demo data in this browser could not be read, so the original sample data has been loaded.'
          : `Manager sign-off was removed for ${who} because some induction tasks are not complete. A fresh sign-off is needed once they are.`}
      </p>
      <button type="button" onClick={() => setHidden(true)} className="font-semibold underline">
        OK
      </button>
    </div>
  )
}

