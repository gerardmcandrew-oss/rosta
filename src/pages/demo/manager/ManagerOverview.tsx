import { ArrowRight, CalendarDays, CircleDashed, ClipboardCheck, GraduationCap, Inbox, ShieldCheck, Users } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { ROLE_LABELS } from '../../../data/catalogue'
import { computeMetrics } from '../../../rules/metrics'
import { sortShifts } from '../../../rules/scheduling'
import { inductionProgress } from '../../../rules/training'
import { formatShortDay } from '../../../utils/date'
import { Avatar, ProgressBar } from '../../../components/ui'
import { RequestCard } from '../../../demo/components/RequestCard'
import { RoleTag, ShiftTime, WeekNav } from '../../../demo/components/common'
import { useDemo } from '../../../demo/store'
import type { ManagerTab } from '../DemoApp'

function Metric({ icon, label, value, detail, accent = false, testId }: { icon: ReactNode; label: string; value: ReactNode; detail: ReactNode; accent?: boolean; testId: string }) {
  return (
    <div className={`card p-4 sm:p-5 ${accent ? '!border-navy !bg-navy text-paper' : ''}`} data-testid={testId}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${accent ? 'text-paper/75' : 'text-muted'}`}>
        <span className={`grid size-8 place-items-center rounded-lg ${accent ? 'bg-lime text-navy' : 'bg-paper-200 text-navy'}`}>{icon}</span>
        {label}
      </div>
      <p className="tabular mt-3 text-3xl font-bold tracking-tight sm:text-[2.1rem]">{value}</p>
      <p className={`mt-1 text-xs ${accent ? 'text-paper/70' : 'text-muted'}`}>{detail}</p>
    </div>
  )
}

export function ManagerOverview({ go, onShift }: { go: (tab: ManagerTab) => void; onShift: (id: string) => void }) {
  const { state, now } = useDemo()
  const m = useMemo(() => computeMetrics(state, state.viewWeek, now), [state, now])
  const awaiting = state.requests.filter((r) => r.status === 'pending-manager')
  const openShifts = sortShifts(state.shifts.filter((s) => s.employeeId === null && s.date >= state.viewWeek))
  const learners = state.employees
    .filter((e) => e.status === 'active')
    .map((e) => ({ e, p: inductionProgress(e.id, state.training) }))
    .filter(({ p }) => p.completed < p.total)
    .sort((a, b) => a.p.percent - b.p.percent)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Monday morning</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Good morning, Niamh</h1>
          <p className="mt-1 text-muted">
            {m.awaitingManager > 0
              ? `${m.awaitingManager} shift change${m.awaitingManager === 1 ? '' : 's'} waiting for your decision.`
              : 'No shift changes are waiting for you.'}
          </p>
        </div>
        <WeekNav />
      </div>

      <section aria-label="This week at a glance" className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Metric testId="m-requests" accent icon={<Inbox className="size-4" />} label="Requests" value={m.pendingRequests} detail={`${m.awaitingManager} need your approval`} />
        <Metric testId="m-staff" icon={<Users className="size-4" />} label="Team" value={m.activeStaff} detail={`active · ${m.staffOnLeave} on leave`} />
        <Metric testId="m-shifts" icon={<CalendarDays className="size-4" />} label="Upcoming" value={m.upcomingShifts} detail={`of ${m.weekShifts} shifts this week`} />
        <Metric testId="m-coverage" icon={<ShieldCheck className="size-4" />} label="Coverage" value={`${m.coveragePercent}%`} detail={`${m.coveredShifts} of ${m.weekShifts} filled by trained staff`} />
        <Metric testId="m-induction" icon={<GraduationCap className="size-4" />} label="Induction" value={`${m.teamInductionPercent}%`} detail="of team tasks complete" />
        <Metric testId="m-training" icon={<ClipboardCheck className="size-4" />} label="Need training" value={m.employeesNeedingTraining} detail="with tasks outstanding" />
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_1fr]">
        <section aria-labelledby="awaiting-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="awaiting-heading" className="text-lg font-bold tracking-tight">Waiting for your approval</h2>
            <button type="button" onClick={() => go('requests')} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
              All requests <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          {awaiting.length === 0 ? (
            <div className="card flex items-center gap-3 p-5 text-sm text-muted">
              <ShieldCheck className="size-5 text-ok" aria-hidden="true" />
              You are all caught up. New requests appear here once a colleague accepts.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {awaiting.map((r) => (
                <RequestCard key={r.id} request={r} view="manager" />
              ))}
            </div>
          )}

          {openShifts.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-bold tracking-tight">Open shifts</h2>
              <div className="space-y-2">
                {openShifts.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onShift(s.id)}
                    className="card flex w-full items-center gap-3 border-dashed p-3.5 text-left transition hover:border-slate/50"
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-warn-bg text-warn">
                      <CircleDashed className="size-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{formatShortDay(s.date)}</span>
                      <span className="block text-sm">
                        <ShiftTime shift={s} />
                      </span>
                    </span>
                    <RoleTag role={s.role} />
                    <span className="hidden text-sm font-semibold sm:inline">Assign</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="induction-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="induction-heading" className="text-lg font-bold tracking-tight">Induction in progress</h2>
            <button type="button" onClick={() => go('team')} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
              Team <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="card divide-y divide-line">
            {learners.length === 0 && <p className="p-5 text-sm text-muted">Everyone has finished induction.</p>}
            {learners.map(({ e, p }) => (
              <button key={e.id} type="button" onClick={() => go('team')} className="flex w-full items-center gap-3 p-4 text-left hover:bg-paper/60">
                <Avatar name={e.name} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{e.name}</span>
                    <span className="tabular text-sm font-semibold">{p.completed}/{p.total}</span>
                  </span>
                  <span className="mb-2 block text-xs text-muted">{ROLE_LABELS[e.role]}</span>
                  <ProgressBar value={p.percent} label={`${e.name} induction progress`} />
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
