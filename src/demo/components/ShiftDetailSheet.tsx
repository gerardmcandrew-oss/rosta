import { ArrowLeftRight, CheckCircle2, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ROLE_LABELS, SKILLS } from '../../data/catalogue'
import { assignmentIssues, isOpenRequest, rankCandidates } from '../../rules/eligibility'
import { hasStarted } from '../../rules/scheduling'
import { formatDay } from '../../utils/date'
import { Avatar, Button, Pill, Sheet } from '../../components/ui'
import { useDemo } from '../store'
import { ReasonList, RequestStatusPill, RoleTag, ShiftTime } from './common'

/** Manager view of a single shift: who is on it, whether they still qualify, and who else could take it. */
export function ShiftDetailSheet({ shiftId, onClose }: { shiftId: string | null; onClose: () => void }) {
  const { state, now, persona, assign } = useDemo()
  const [showCandidates, setShowCandidates] = useState(false)
  const shift = state.shifts.find((s) => s.id === shiftId) ?? null

  const candidates = useMemo(() => (shift ? rankCandidates(state, shift) : []), [state, shift])
  if (!shift) return null

  const person = state.employees.find((e) => e.id === shift.employeeId)
  const original = state.employees.find((e) => e.id === shift.originalEmployeeId)
  const issues = assignmentIssues(state, shift)
  const openRequest = state.requests.find((r) => r.shiftId === shift.id && isOpenRequest(r))
  const started = hasStarted(shift, now)
  const close = () => {
    setShowCandidates(false)
    onClose()
  }

  return (
    <Sheet
      open
      onClose={close}
      title={formatDay(shift.date)}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <RoleTag role={shift.role} />
          <ShiftTime shift={shift} />
        </span>
      }
    >
      <div className="rounded-2xl bg-paper p-4">
        {person ? (
          <div className="flex items-center gap-3">
            <Avatar name={person.name} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold">{person.name}</p>
              <p className="text-sm text-muted">{ROLE_LABELS[person.role]}</p>
            </div>
          </div>
        ) : (
          <p className="font-semibold text-warn">Open shift: nobody assigned yet</p>
        )}
        {original && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-info">
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            Covering for {original.name} after an approved request
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted">Needs:</span>
          {shift.requiredSkills.map((s) => (
            <Pill key={s}>{SKILLS[s].label}</Pill>
          ))}
        </div>
        {person &&
          (issues.length === 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ok">
              <CheckCircle2 className="size-4" aria-hidden="true" /> Meets every requirement for this shift
            </p>
          ) : (
            <ReasonList reasons={issues} className="mt-3" />
          ))}
      </div>

      {openRequest && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line p-3 text-sm">
          <span>Replacement request open</span>
          <RequestStatusPill status={openRequest.status} />
        </div>
      )}

      {!started && !openRequest && persona.mode === 'manager' && (
        <div className="mt-5">
          {!showCandidates ? (
            <Button variant="secondary" className="w-full" onClick={() => setShowCandidates(true)}>
              <UserPlus className="size-4" aria-hidden="true" />
              {person ? 'Change who is working' : 'Assign someone'}
            </Button>
          ) : (
            <div>
              <h3 className="text-sm font-semibold">Choose a team member</h3>
              <p className="text-xs text-muted">Only people who pass every check can be assigned.</p>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                {candidates.map(({ employee, eligible, reasons }) => (
                  <li key={employee.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar name={employee.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${eligible ? '' : 'text-ink/70'}`}>{employee.name}</p>
                      {!eligible && <ReasonList reasons={reasons} className="mt-0.5" />}
                    </div>
                    {eligible && (
                      <Button size="sm" onClick={() => assign(shift.id, employee.id).ok && close()}>
                        Assign
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {started && <p className="mt-4 text-sm text-muted">This shift has started, so it can no longer be changed.</p>}
    </Sheet>
  )
}
