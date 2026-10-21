import { Inbox } from 'lucide-react'
import { useState } from 'react'
import type { RequestStatus } from '../../../models/types'
import { EmptyState, SectionHeader } from '../../../components/ui'
import { RequestCard } from '../../../demo/components/RequestCard'
import { useDemo } from '../../../demo/store'

const FILTERS: { id: string; label: string; statuses: RequestStatus[] }[] = [
  { id: 'approval', label: 'Needs approval', statuses: ['pending-manager'] },
  { id: 'colleague', label: 'With colleague', statuses: ['pending-colleague'] },
  { id: 'closed', label: 'History', statuses: ['approved', 'rejected', 'declined', 'cancelled'] },
]

export function ManagerRequests() {
  const { state } = useDemo()
  const [filter, setFilter] = useState('approval')
  const active = FILTERS.find((f) => f.id === filter)!
  const list = state.requests
    .filter((r) => active.statuses.includes(r.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <SectionHeader
        title="Shift requests"
        description="Approve only once the colleague has accepted. Every check runs again when you approve."
      />
      <div role="tablist" aria-label="Filter requests" className="mb-5 inline-flex w-full rounded-2xl border border-line bg-white p-1 shadow-card sm:w-auto">
        {FILTERS.map((f) => {
          const count = state.requests.filter((r) => f.statuses.includes(r.status)).length
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`flex min-h-10 min-w-0 flex-1 flex-wrap items-center justify-center gap-x-1.5 rounded-xl px-2 py-1 text-[0.8rem] leading-tight font-semibold transition sm:flex-none sm:px-3 sm:text-sm ${
                filter === f.id ? 'bg-navy text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {f.label}
              <span className={`tabular rounded-full px-1.5 text-xs ${filter === f.id ? 'bg-lime text-navy' : 'bg-paper-200'}`}>{count}</span>
            </button>
          )
        })}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Inbox className="size-6" />} title="Nothing here">
          {filter === 'approval' ? 'Requests appear here once the colleague asked has accepted.' : 'No requests in this list.'}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <RequestCard key={r.id} request={r} view={filter === 'closed' ? 'history' : 'manager'} />
          ))}
        </div>
      )}
    </div>
  )
}
