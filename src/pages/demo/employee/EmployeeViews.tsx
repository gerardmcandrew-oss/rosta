import { ArrowLeftRight, BellRing, CalendarCheck2, CalendarX2, CheckCircle2, Clock, GraduationCap, Inbox, Users } from 'lucide-react'
import { useState } from 'react'
import { taskById } from '../../../data/catalogue'
import type { Employee, Shift } from '../../../models/types'
import { isOpenRequest } from '../../../rules/eligibility'
import { shiftRequestBlocker } from '../../../rules/requests'
import { hasStarted, sortShifts } from '../../../rules/scheduling'
import { inductionProgress } from '../../../rules/training'
import { addDays, formatDay, formatShortDay } from '../../../utils/date'
import { Button, EmptyState, ProgressBar, ProgressRing, SectionHeader } from '../../../components/ui'
import { InductionChecklist, SkillReadiness } from '../../../demo/components/Induction'
import { RequestCard } from '../../../demo/components/RequestCard'
import { RotaBoard } from '../../../demo/components/RotaBoard'
import { RoleTag, ShiftTime, WeekNav } from '../../../demo/components/common'
import { firstName, useDemo } from '../../../demo/store'
import type { EmployeeTab } from '../DemoApp'

function useMine(employee: Employee) {
  const { state, now } = useDemo()
  const shifts = sortShifts(state.shifts.filter((s) => s.employeeId === employee.id))
  const upcoming = shifts.filter((s) => !hasStarted(s, now))
  const incoming = state.requests.filter((r) => r.proposedId === employee.id && r.status === 'pending-colleague')
  const mine = state.requests.filter((r) => r.requesterId === employee.id && isOpenRequest(r))
  const history = state.requests
    .filter((r) => (r.requesterId === employee.id || r.proposedId === employee.id) && !isOpenRequest(r))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const awaitingOthers = state.requests.filter((r) => r.proposedId === employee.id && r.status === 'pending-manager')
  return { shifts, upcoming, incoming, mine, history, awaitingOthers }
}

export function EmployeeHome({ employee, go, onRequest }: { employee: Employee; go: (tab: EmployeeTab) => void; onRequest: (s: Shift) => void }) {
  const { state, now } = useDemo()
  const { upcoming, incoming, mine } = useMine(employee)
  const progress = inductionProgress(employee.id, state.training)
  const next = upcoming[0]
  const nextSelfTask = progress.outstanding.map(taskById).find((t) => t.completedBy === 'employee')
  const weekEnd = addDays(state.viewWeek, 6)
  const weekCount = upcoming.filter((s) => s.date >= state.viewWeek && s.date <= weekEnd).length

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="eyebrow">Harbour Lane Café</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Hi {firstName(employee)}</h1>
        <p className="mt-1 text-muted">
          {weekCount > 0 ? `You have ${weekCount} shift${weekCount === 1 ? '' : 's'} coming up this week.` : 'No more shifts for you this week.'}
        </p>
      </div>

      {incoming.length > 0 && (
        <section aria-labelledby="action-heading" className="space-y-3">
          <h2 id="action-heading" className="flex items-center gap-2 text-sm font-bold">
            <BellRing className="size-4 text-warn" aria-hidden="true" />
            Needs your answer
          </h2>
          {incoming.map((r) => (
            <RequestCard key={r.id} request={r} view="incoming" />
          ))}
        </section>
      )}

      <section aria-labelledby="next-heading" className="relative overflow-hidden rounded-[1.75rem] bg-navy p-5 text-paper shadow-float sm:p-6" data-testid="next-shift">
        <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-lime/10 blur-2xl" aria-hidden="true" />
        <h2 id="next-heading" className="text-xs font-semibold tracking-[0.14em] text-paper/60 uppercase">
          Next shift
        </h2>
        {next ? (
          <>
            <p className="mt-2 text-2xl font-bold tracking-tight">{formatDay(next.date)}</p>
            <p className="mt-1 text-lg text-paper/85">
              <span className="tabular">
                {next.start} to {next.end}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RoleTag role={next.role} className="!bg-paper !text-navy" />
              {next.status === 'reassigned' && (
                <span className="inline-flex items-center gap-1 text-xs text-paper/70">
                  <ArrowLeftRight className="size-3.5" aria-hidden="true" /> You are covering this one
                </span>
              )}
            </div>
            <div className="on-dark mt-5 flex flex-wrap gap-2">
              <Button variant="lime" onClick={() => go('shifts')}>
                <CalendarCheck2 className="size-4" aria-hidden="true" /> My week
              </Button>
              {!shiftRequestBlocker(state, next, employee.id, now) && (
                <Button variant="ghost" className="!text-paper hover:!bg-white/10" onClick={() => onRequest(next)}>
                  Can't make it?
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-lg text-paper/80">Nothing scheduled.</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => go('induction')} className="card flex items-center gap-4 p-4 text-left transition hover:border-slate/50">
          <span className="text-navy">
            <ProgressRing value={progress.percent} size={56} label="Your induction" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Induction</span>
            <span className="block text-sm text-muted">
              {progress.outstanding.length === 0 ? 'All tasks complete' : nextSelfTask ? `Next: ${nextSelfTask.title}` : 'Waiting on a manager'}
            </span>
          </span>
        </button>
        <button type="button" onClick={() => go('requests')} className="card flex items-center gap-4 p-4 text-left transition hover:border-slate/50">
          <span className="grid size-14 place-items-center rounded-2xl bg-paper-200 text-navy">
            <Inbox className="size-6" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">Requests</span>
            <span className="block text-sm text-muted">
              {mine.length > 0 ? `${mine.length} of yours in progress` : incoming.length > 0 ? `${incoming.length} waiting for you` : 'Nothing open'}
            </span>
          </span>
        </button>
      </div>

      {mine.length > 0 && (
        <section aria-labelledby="mine-heading">
          <h2 id="mine-heading" className="mb-3 text-sm font-bold">
            Your requests
          </h2>
          <div className="space-y-3">
            {mine.map((r) => (
              <RequestCard key={r.id} request={r} view="mine" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function MyShiftCard({ shift, employee, onRequest }: { shift: Shift; employee: Employee; onRequest: (s: Shift) => void }) {
  const { state, now } = useDemo()
  const blocker = shiftRequestBlocker(state, shift, employee.id, now)
  const openRequest = state.requests.find((r) => r.shiftId === shift.id && isOpenRequest(r))
  const original = state.employees.find((e) => e.id === shift.originalEmployeeId)
  return (
    <li className="card p-4" data-testid={`my-${shift.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{formatShortDay(shift.date)}</p>
          <p className="mt-0.5 text-[0.95rem]">
            <ShiftTime shift={shift} />
          </p>
        </div>
        <RoleTag role={shift.role} />
      </div>
      {original && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-info">
          <ArrowLeftRight className="size-3.5" aria-hidden="true" /> Covering for {firstName(original)}
        </p>
      )}
      <div className="mt-3">
        {openRequest ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-warn">
            <Clock className="size-4" aria-hidden="true" />
            Cover requested from {firstName(state.employees.find((e) => e.id === openRequest.proposedId))}
          </p>
        ) : blocker ? (
          <p className="text-xs text-muted">{blocker}</p>
        ) : (
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => onRequest(shift)}>
            <CalendarX2 className="size-4" aria-hidden="true" />
            Request cover
          </Button>
        )}
      </div>
    </li>
  )
}

export function EmployeeShifts({ employee, onRequest, onShift }: { employee: Employee; onRequest: (s: Shift) => void; onShift: (s: Shift) => void }) {
  const { state } = useDemo()
  const [view, setView] = useState<'mine' | 'team'>('mine')
  const weekEnd = addDays(state.viewWeek, 6)
  const mine = useMine(employee).shifts.filter((s) => s.date >= state.viewWeek && s.date <= weekEnd)

  return (
    <div className={view === 'mine' ? 'mx-auto max-w-2xl' : ''}>
      <SectionHeader title={view === 'mine' ? 'My shifts' : 'Team rota'} action={<WeekNav />} />
      <div role="tablist" aria-label="Rota view" className="mb-4 grid grid-cols-2 rounded-2xl border border-line bg-white p-1 shadow-card sm:inline-grid">
        {(
          [
            ['mine', 'Mine', CalendarCheck2],
            ['team', 'Whole team', Users],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold ${view === id ? 'bg-navy text-paper' : 'text-muted'}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      {view === 'mine' ? (
        mine.length === 0 ? (
          <EmptyState icon={<CalendarCheck2 className="size-6" />} title="No shifts this week">
            Try another week, or return to the sample week.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {mine.map((s) => (
              <MyShiftCard key={s.id} shift={s} employee={employee} onRequest={onRequest} />
            ))}
          </ul>
        )
      ) : (
        <RotaBoard highlightId={employee.id} onSelect={(s) => (s.employeeId === employee.id ? onRequest(s) : onShift(s))} />
      )}
    </div>
  )
}

export function EmployeeRequests({ employee }: { employee: Employee }) {
  const { incoming, mine, history, awaitingOthers } = useMine(employee)
  const sections = [
    { title: 'Waiting for your answer', items: incoming, view: 'incoming' as const, empty: 'Nobody has asked you to cover a shift.' },
    { title: 'Your requests', items: mine, view: 'mine' as const, empty: 'Request cover from the My shifts tab.' },
    { title: 'You agreed to cover', items: awaitingOthers, view: 'history' as const, empty: null },
    { title: 'History', items: history, view: 'history' as const, empty: 'Closed requests appear here.' },
  ]
  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <SectionHeader title="Requests" description="Swapping shifts here replaces the group chat. The manager has the final say." />
      {sections.map(
        (s) =>
          (s.items.length > 0 || s.empty) && (
            <section key={s.title} aria-label={s.title}>
              <h2 className="mb-3 text-sm font-bold">
                {s.title} <span className="tabular font-semibold text-muted">({s.items.length})</span>
              </h2>
              {s.items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-paper-300 px-4 py-5 text-sm text-muted">{s.empty}</p>
              ) : (
                <div className="space-y-3">
                  {s.items.map((r) => (
                    <RequestCard key={r.id} request={r} view={s.view} />
                  ))}
                </div>
              )}
            </section>
          ),
      )}
    </div>
  )
}

export function EmployeeInduction({ employee }: { employee: Employee }) {
  const { state } = useDemo()
  const p = inductionProgress(employee.id, state.training)
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card flex items-center gap-5 p-5">
        <span className="text-navy">
          <ProgressRing value={p.percent} size={76} label="Your induction" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight">Your induction</h1>
          <p className="text-sm text-muted">
            {p.completed} of {p.total} tasks done.{' '}
            {p.outstanding.length === 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-ok">
                <CheckCircle2 className="size-4" aria-hidden="true" /> Complete
              </span>
            ) : (
              'Manager tasks are confirmed in person.'
            )}
          </p>
          <div className="mt-3">
            <ProgressBar value={p.percent} label="Induction progress" />
          </div>
        </div>
      </div>
      <section aria-labelledby="ready-heading" className="card px-5 py-3">
        <h2 id="ready-heading" className="flex items-center gap-2 pt-1 text-sm font-bold">
          <GraduationCap className="size-4" aria-hidden="true" /> Shifts you can cover
        </h2>
        <SkillReadiness employee={employee} />
      </section>
      <section aria-labelledby="tasks-heading">
        <h2 id="tasks-heading" className="mb-3 flex items-center justify-between text-sm font-bold">
          Checklist
          <span className="text-xs font-medium text-muted">Internal tasks, not accredited certificates</span>
        </h2>
        <InductionChecklist employee={employee} />
      </section>
    </div>
  )
}

