import { AlertCircle, CalendarClock, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { SHIFT_ROLE_LABELS } from '../../data/catalogue'
import { SAMPLE_WEEK } from '../../data/sampleData'
import type { RequestStatus, Shift } from '../../models/types'
import type { IneligibilityReason } from '../../rules/eligibility'
import { STATUS_LABELS } from '../../rules/requests'
import { durationHours, formatWeekRange } from '../../utils/date'
import { Pill, type Tone } from '../../components/ui'
import { useDemo } from '../store'

export function WeekNav() {
  const { state, shiftWeek, returnToSampleWeek } = useDemo()
  const isSample = state.viewWeek === SAMPLE_WEEK
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-xl border border-line bg-white p-1 shadow-card">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-paper-200 hover:text-ink"
          aria-label="Previous week"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="tabular min-w-[10.5rem] px-1 text-center text-sm font-semibold" aria-live="polite">
          {formatWeekRange(state.viewWeek)}
        </p>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-paper-200 hover:text-ink"
          aria-label="Next week"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      {isSample ? (
        <Pill tone="lime">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          Sample week
        </Pill>
      ) : (
        <button
          type="button"
          onClick={returnToSampleWeek}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-paper-200"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Return to sample week
        </button>
      )}
    </div>
  )
}

const ROLE_TONES: Record<Shift['role'], string> = {
  supervisor: 'bg-navy text-paper',
  barista: 'bg-[#efe4d2] text-[#6b4a1d]',
  till: 'bg-[#dfe9f5] text-[#1f4471]',
  floor: 'bg-[#e3eedb] text-[#35561e]',
}

export function RoleTag({ role, className = '' }: { role: Shift['role']; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase ${ROLE_TONES[role]} ${className}`}>
      {SHIFT_ROLE_LABELS[role]}
    </span>
  )
}

export function ShiftTime({ shift, className = '' }: { shift: Shift; className?: string }) {
  return (
    <span className={`tabular ${className}`}>
      {shift.start} to {shift.end}
      <span className="font-normal text-muted"> · {durationHours(shift.start, shift.end)}h</span>
    </span>
  )
}

export const REQUEST_TONES: Record<RequestStatus, Tone> = {
  'pending-colleague': 'warn',
  'pending-manager': 'info',
  approved: 'ok',
  rejected: 'bad',
  declined: 'neutral',
  cancelled: 'neutral',
}

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  return <Pill tone={REQUEST_TONES[status]}>{STATUS_LABELS[status]}</Pill>
}

export function ReasonList({ reasons, className = '' }: { reasons: IneligibilityReason[]; className?: string }) {
  return (
    <ul className={`space-y-1 ${className}`}>
      {reasons.map((r, i) => (
        <li key={`${r.code}-${i}`} className="flex items-start gap-1.5 text-[0.8rem] leading-snug text-bad">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{r.message}</span>
        </li>
      ))}
    </ul>
  )
}
