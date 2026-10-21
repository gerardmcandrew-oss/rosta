import { Check, ChevronDown, Send, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ROLE_LABELS } from '../../data/catalogue'
import type { Shift } from '../../models/types'
import { rankCandidates } from '../../rules/eligibility'
import { formatDay } from '../../utils/date'
import { Avatar, Button, Sheet } from '../../components/ui'
import { useDemo } from '../store'
import { ReasonList, RoleTag, ShiftTime } from './common'

/**
 * Step 2 and 3 of the replacement workflow: show who could cover, explain
 * why everyone else cannot, then send the request to the chosen colleague.
 */
export function CoverRequestSheet({ shift, onClose }: { shift: Shift | null; onClose: () => void }) {
  const { state, requestCover } = useDemo()
  const [selected, setSelected] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [showIneligible, setShowIneligible] = useState(true)

  useEffect(() => {
    setSelected(null)
    setReason('')
  }, [shift?.id])

  const candidates = useMemo(() => (shift ? rankCandidates(state, shift) : []), [state, shift])
  const eligible = candidates.filter((c) => c.eligible)
  const ineligible = candidates.filter((c) => !c.eligible)

  const submit = () => {
    if (!shift || !selected) return
    if (requestCover({ shiftId: shift.id, proposedId: selected, reason }).ok) onClose()
  }

  return (
    <Sheet
      open={shift !== null}
      onClose={onClose}
      title="Request cover"
      description={
        shift && (
          <span className="flex flex-wrap items-center gap-2">
            <RoleTag role={shift.role} />
            <span className="font-semibold text-ink">{formatDay(shift.date)}</span>
            <ShiftTime shift={shift} />
          </span>
        )
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button variant="primary" size="lg" className="w-full sm:w-auto" disabled={!selected} onClick={submit}>
            <Send className="size-4" aria-hidden="true" />
            Send request
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-ok" aria-hidden="true" />
          Can cover ({eligible.length})
        </legend>
        <p className="mt-1 text-xs text-muted">Checked against training, availability and other shifts right now.</p>
        {eligible.length === 0 ? (
          <p className="mt-3 rounded-xl bg-warn-bg px-3 py-2.5 text-sm text-warn">
            Nobody can cover this shift at the moment. Speak to a manager.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {eligible.map(({ employee }) => {
              const checked = selected === employee.id
              return (
                <label
                  key={employee.id}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                    checked ? 'border-navy bg-navy/[0.03] ring-1 ring-navy' : 'border-line hover:border-slate/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={employee.id}
                    checked={checked}
                    onChange={() => setSelected(employee.id)}
                    className="sr-only"
                  />
                  <Avatar name={employee.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{employee.name}</span>
                    <span className="block text-xs text-muted">{ROLE_LABELS[employee.role]} · Free, trained and available</span>
                  </span>
                  <span
                    className={`grid size-6 place-items-center rounded-full border-2 transition ${checked ? 'border-navy bg-navy text-lime' : 'border-paper-300'}`}
                    aria-hidden="true"
                  >
                    {checked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </fieldset>

      {ineligible.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowIneligible((v) => !v)}
            aria-expanded={showIneligible}
            className="flex w-full items-center justify-between rounded-lg py-1 text-left text-sm font-semibold"
          >
            Cannot cover ({ineligible.length})
            <ChevronDown className={`size-4 text-muted transition ${showIneligible ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {showIneligible && (
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line" data-testid="ineligible-list">
              {ineligible.map(({ employee, reasons }) => (
                <li key={employee.id} className="flex gap-3 px-3 py-2.5" data-testid={`ineligible-${employee.id}`}>
                  <span className="opacity-60">
                    <Avatar name={employee.name} size="sm" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink/80">{employee.name}</p>
                    <ReasonList reasons={reasons} className="mt-0.5" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="cover-reason" className="text-sm font-semibold">
          Note for your colleague <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="cover-reason"
          value={reason}
          maxLength={160}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="For example: hospital appointment"
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-base placeholder:text-slate focus:border-navy focus:outline-none"
        />
      </div>
    </Sheet>
  )
}
