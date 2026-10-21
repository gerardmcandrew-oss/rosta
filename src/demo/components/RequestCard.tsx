import { ArrowRight, Check, Clock, X } from 'lucide-react'
import { useState } from 'react'
import type { ShiftRequest } from '../../models/types'
import { evaluateCandidate } from '../../rules/eligibility'
import { STATUS_LABELS } from '../../rules/requests'
import { formatShortDay, formatTimestamp } from '../../utils/date'
import { Avatar, Button } from '../../components/ui'
import { firstName, useDemo } from '../store'
import { ReasonList, RequestStatusPill, RoleTag, ShiftTime } from './common'

type View = 'manager' | 'incoming' | 'mine' | 'history'

/**
 * One replacement request. The actions shown depend on who is looking:
 * the colleague asked can accept or decline, the requester can cancel and
 * the manager can approve or reject.
 */
export function RequestCard({ request, view }: { request: ShiftRequest; view: View }) {
  const { state, approve, reject, respond, cancel } = useDemo()
  const [showHistory, setShowHistory] = useState(false)
  const shift = state.shifts.find((s) => s.id === request.shiftId)
  const requester = state.employees.find((e) => e.id === request.requesterId)
  const proposed = state.employees.find((e) => e.id === request.proposedId)
  if (!shift || !requester || !proposed) return null

  const open = request.status === 'pending-colleague' || request.status === 'pending-manager'
  // Live check so the manager sees whether approval would pass right now.
  const live = open ? evaluateCandidate(state, shift, proposed, { ignoreRequestId: request.id }) : null
  const nameOf = (id: string) => state.employees.find((e) => e.id === id)?.name ?? 'Unknown'

  return (
    <article className="card animate-rise p-4 sm:p-5" data-testid={`request-${request.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RoleTag role={shift.role} />
          <span className="text-sm font-semibold">{formatShortDay(shift.date)}</span>
        </div>
        <RequestStatusPill status={request.status} />
      </div>

      <p className="mt-2 text-[0.95rem] font-semibold">
        <ShiftTime shift={shift} />
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper px-3 py-2.5 text-sm">
        <Avatar name={requester.name} size="sm" />
        <span className="min-w-0 truncate font-semibold">{firstName(requester)}</span>
        <ArrowRight className="size-4 shrink-0 text-slate" aria-label="handing over to" />
        <Avatar name={proposed.name} size="sm" />
        <span className="min-w-0 truncate font-semibold">{firstName(proposed)}</span>
      </div>

      {request.reason && <p className="mt-2 text-sm text-muted">"{request.reason}"</p>}

      {live && !live.eligible && (
        <div className="mt-3 rounded-xl bg-bad-bg px-3 py-2.5">
          <p className="text-xs font-semibold text-bad">{firstName(proposed)} can no longer take this shift:</p>
          <ReasonList reasons={live.reasons} className="mt-1" />
        </div>
      )}

      {view === 'manager' && open && (
        <div className="mt-4 space-y-2">
          {request.status === 'pending-colleague' && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5" aria-hidden="true" />
              Approval unlocks once {firstName(proposed)} accepts.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="danger" size="lg" onClick={() => reject(request.id)}>
              <X className="size-4" aria-hidden="true" />
              Reject
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={request.status !== 'pending-manager'}
              onClick={() => approve(request.id)}
            >
              <Check className="size-4" aria-hidden="true" />
              Approve
            </Button>
          </div>
        </div>
      )}

      {view === 'incoming' && request.status === 'pending-colleague' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={() => respond(request.id, false)}>
            Decline
          </Button>
          <Button variant="primary" size="lg" disabled={live !== null && !live.eligible} onClick={() => respond(request.id, true)}>
            <Check className="size-4" aria-hidden="true" />
            Accept
          </Button>
        </div>
      )}

      {view === 'mine' && open && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => cancel(request.id)}>
            Cancel request
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowHistory((v) => !v)}
        aria-expanded={showHistory}
        className="mt-3 text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
      >
        {showHistory ? 'Hide history' : 'Show history'}
      </button>
      {showHistory && (
        <ol className="mt-2 space-y-2 border-l-2 border-line pl-4">
          {request.history.map((h, i) => (
            <li key={i} className="text-xs">
              <p className="font-semibold">{STATUS_LABELS[h.status]}</p>
              <p className="text-muted">
                {nameOf(h.actorId)} · {formatTimestamp(h.at)}
              </p>
              {h.note && <p className="mt-0.5 text-muted">"{h.note}"</p>}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
