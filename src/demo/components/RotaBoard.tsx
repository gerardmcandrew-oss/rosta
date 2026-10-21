import { ArrowLeftRight, CircleDashed, Clock } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { Shift } from '../../models/types'
import { isOpenRequest } from '../../rules/eligibility'
import { sortShifts } from '../../rules/scheduling'
import { addDays, formatDayNumber, formatWeekday, weekDays } from '../../utils/date'
import { Avatar, EmptyState } from '../../components/ui'
import { useDemo } from '../store'
import { RoleTag, ShiftTime } from './common'

interface RotaBoardProps {
  onSelect: (shift: Shift) => void
  /** Highlight this employee's shifts (employee mode). */
  highlightId?: string
}

function useWeekShifts() {
  const { state } = useDemo()
  return useMemo(() => {
    const end = addDays(state.viewWeek, 6)
    return sortShifts(state.shifts.filter((s) => s.date >= state.viewWeek && s.date <= end))
  }, [state.shifts, state.viewWeek])
}

function ShiftFlags({ shift }: { shift: Shift }) {
  const { state } = useDemo()
  const pending = state.requests.some((r) => r.shiftId === shift.id && isOpenRequest(r))
  return (
    <>
      {pending && (
        <span className="inline-flex items-center gap-0.5 text-[0.68rem] font-semibold text-warn" title="Replacement requested">
          <Clock className="size-3" aria-hidden="true" />
          Request open
        </span>
      )}
      {shift.status === 'reassigned' && (
        <span className="inline-flex items-center gap-0.5 text-[0.68rem] font-semibold text-info" title="Covered by replacement">
          <ArrowLeftRight className="size-3" aria-hidden="true" />
          Swapped in
        </span>
      )}
    </>
  )
}

/** Desktop: a classic rota grid with one row per person and one column per day. */
function RotaGrid({ shifts, onSelect, highlightId }: RotaBoardProps & { shifts: Shift[] }) {
  const { state, now } = useDemo()
  const days = weekDays(state.viewWeek)
  const today = now.slice(0, 10)
  const people = state.employees.filter((e) => shifts.some((s) => s.employeeId === e.id))
  const openShifts = shifts.filter((s) => s.employeeId === null)
  const rows: { key: string; label: ReactNode; shifts: Shift[] }[] = [
    ...(openShifts.length
      ? [
          {
            key: 'open',
            label: (
              <span className="flex items-center gap-2 font-semibold text-warn">
                <CircleDashed className="size-5" aria-hidden="true" /> Open shifts
              </span>
            ),
            shifts: openShifts,
          },
        ]
      : []),
    ...people.map((p) => ({
      key: p.id,
      label: (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={p.name} size="sm" />
          <span className="truncate font-semibold">{p.name}</span>
        </span>
      ),
      shifts: shifts.filter((s) => s.employeeId === p.id),
    })),
  ]

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
          <caption className="sr-only">Weekly rota</caption>
          <thead>
            <tr className="border-b border-line bg-paper/70">
              <th scope="col" className="w-48 px-4 py-3 text-left text-xs font-semibold text-muted">
                Team member
              </th>
              {days.map((d) => (
                <th key={d} scope="col" className={`px-2 py-3 text-left text-xs font-semibold ${d === today ? 'text-ink' : 'text-muted'}`}>
                  <span className="inline-flex items-center gap-1.5">
                    {formatWeekday(d)}
                    <span className={`tabular grid size-6 place-items-center rounded-full ${d === today ? 'bg-lime text-navy' : ''}`}>
                      {formatDayNumber(d)}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-b border-line last:border-0 ${row.key === highlightId ? 'bg-lime/15' : ''} ${row.key === 'open' ? 'bg-warn-bg/40' : ''}`}
              >
                <th scope="row" className="px-4 py-2 text-left font-normal">
                  {row.label}
                </th>
                {days.map((d) => (
                  <td key={d} className="px-1.5 py-1.5 align-top">
                    <div className="space-y-1.5">
                      {row.shifts
                        .filter((s) => s.date === d)
                        .map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onSelect(s)}
                            data-testid={`grid-${s.id}`}
                            className="block w-full rounded-xl border border-line bg-white px-2 py-1.5 text-left shadow-[0_1px_0_rgb(11_18_32/0.04)] transition hover:-translate-y-px hover:border-slate/50 hover:shadow-card"
                          >
                            <RoleTag role={s.role} className="!text-[0.6rem]" />
                            <span className="tabular mt-1 block text-xs font-semibold">
                              {s.start}–{s.end}
                            </span>
                            <ShiftFlags shift={s} />
                          </button>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Mobile: pick a day, then read that day's shifts as cards. */
function DayCards({ shifts, onSelect, highlightId }: RotaBoardProps & { shifts: Shift[] }) {
  const { state, now } = useDemo()
  const days = weekDays(state.viewWeek)
  const today = now.slice(0, 10)
  const [picked, setPicked] = useState<string | null>(null)
  const day = picked && days.includes(picked) ? picked : days.includes(today) ? today : days[0]!
  const dayShifts = shifts.filter((s) => s.date === day)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Choose a day">
        {days.map((d) => {
          const count = shifts.filter((s) => s.date === d).length
          const active = d === day
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPicked(d)}
              className={`flex flex-col items-center rounded-2xl py-2 transition ${active ? 'bg-navy text-paper shadow-card' : 'bg-white text-ink'}`}
            >
              <span className={`text-[0.68rem] font-semibold ${active ? 'text-paper/70' : 'text-muted'}`}>{formatWeekday(d)}</span>
              <span className="tabular text-base font-bold">{formatDayNumber(d)}</span>
              <span className={`mt-0.5 size-1.5 rounded-full ${count ? (active ? 'bg-lime' : 'bg-slate/60') : 'bg-transparent'}`} aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="mt-4 space-y-2" role="tabpanel">
        {dayShifts.length === 0 ? (
          <EmptyState icon={<CircleDashed className="size-6" />} title="No shifts this day" />
        ) : (
          dayShifts.map((s) => {
            const person = state.employees.find((e) => e.id === s.employeeId)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                data-testid={`card-${s.id}`}
                className={`card flex w-full items-center gap-3 p-3.5 text-left transition active:scale-[0.99] ${
                  s.employeeId === highlightId ? 'ring-2 ring-lime' : ''
                } ${s.employeeId === null ? 'border-dashed !bg-warn-bg/40' : ''}`}
              >
                {person ? (
                  <Avatar name={person.name} />
                ) : (
                  <span className="grid size-9 place-items-center rounded-full bg-warn-bg text-warn">
                    <CircleDashed className="size-5" aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{person ? person.name : 'Open shift'}</span>
                  <span className="block text-sm">
                    <ShiftTime shift={s} />
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-x-2">
                    <ShiftFlags shift={s} />
                  </span>
                </span>
                <RoleTag role={s.role} />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function RotaBoard(props: RotaBoardProps) {
  const shifts = useWeekShifts()
  if (shifts.length === 0) {
    return (
      <EmptyState icon={<CircleDashed className="size-6" />} title="No shifts scheduled this week">
        The sample rota covers 9 to 17 November 2026. Use "Return to sample week" to go back.
      </EmptyState>
    )
  }
  return (
    <>
      <div className="hidden lg:block">
        <RotaGrid {...props} shifts={shifts} />
      </div>
      <div className="lg:hidden">
        <DayCards {...props} shifts={shifts} />
      </div>
    </>
  )
}

