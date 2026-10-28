import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ROLE_LABELS } from '../../../data/catalogue'
import { inductionProgress } from '../../../rules/training'
import { Avatar, Pill, ProgressRing, SectionHeader } from '../../../components/ui'
import { InductionChecklist, SkillReadiness } from '../../../demo/components/Induction'
import { useDemo } from '../../../demo/store'

export function ManagerTeam({ focus }: { focus?: { employeeId: string } | null }) {
  const { state } = useDemo()
  const [openId, setOpenId] = useState<string | null>(focus?.employeeId ?? 'e12')

  // A guided scenario can ask for one record to be opened and brought into view.
  useEffect(() => {
    if (!focus) return
    setOpenId(focus.employeeId)
    requestAnimationFrame(() => document.querySelector(`[data-testid="team-${focus.employeeId}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
  }, [focus])

  const people = [...state.employees].sort(
    (a, b) => inductionProgress(a.id, state.training).percent - inductionProgress(b.id, state.training).percent || a.name.localeCompare(b.name),
  )

  return (
    <div>
      <SectionHeader
        title="Team and induction"
        description="Staff records are preloaded sample data. Adding or editing staff is planned, not part of this demo."
      />
      <ul className="space-y-3">
        {people.map((e) => {
          const p = inductionProgress(e.id, state.training)
          const open = openId === e.id
          return (
            <li key={e.id} className="card scroll-mt-20 overflow-hidden" data-testid={`team-${e.id}`}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : e.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-paper/50 sm:gap-4 sm:p-5"
              >
                <Avatar name={e.name} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{e.name}</span>
                    {e.status === 'on-leave' && <Pill tone="neutral">On leave</Pill>}
                    {e.role === 'new-starter' && <Pill tone="lime">New starter</Pill>}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {ROLE_LABELS[e.role]} · {e.contractedHours}h contract
                  </span>
                  <span className="mt-2 hidden sm:block">
                    <SkillReadiness employee={e} compact />
                  </span>
                </span>
                <span className="text-navy">
                  <ProgressRing value={p.percent} size={52} label={`${e.name} induction`} />
                </span>
                <ChevronDown className={`size-5 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {open && (
                <div className="grid animate-rise gap-6 border-t border-line bg-paper/40 p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr]">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Induction checklist</h3>
                    <InductionChecklist employee={e} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">Can cover independently</h3>
                    <p className="mb-2 text-xs text-muted">Worked out from completed tasks and recorded experience, not the overall percentage.</p>
                    <div className="rounded-2xl bg-white px-4 py-1 shadow-card">
                      <SkillReadiness employee={e} />
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
