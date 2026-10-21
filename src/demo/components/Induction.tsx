import { Check, CheckCircle2, Lock, ShieldCheck, Undo2, XCircle } from 'lucide-react'
import { ONBOARDING_TASKS, SKILLS, taskById } from '../../data/catalogue'
import type { Employee, SkillId } from '../../models/types'
import { checkSkill, completedTaskIds, describeSkillGap, missingCoreTasks } from '../../rules/training'
import { formatTimestamp } from '../../utils/date'
import { Button } from '../../components/ui'
import { useDemo } from '../store'

/**
 * The six induction tasks for one person. Employees tick off self-service
 * tasks; manager-confirmed ones stay locked unless the demo is in manager mode.
 */
export function InductionChecklist({ employee }: { employee: Employee }) {
  const { state, persona, complete, undo } = useDemo()
  const done = completedTaskIds(employee.id, state.training)
  const isManager = persona.mode === 'manager'

  return (
    <ol className="space-y-2">
      {ONBOARDING_TASKS.map((task, i) => {
        const record = state.training.find((r) => r.employeeId === employee.id && r.taskId === task.id)
        const isDone = done.has(task.id)
        const canComplete = !isDone && (task.completedBy === 'employee' || isManager)
        return (
          <li
            key={task.id}
            data-testid={`task-${task.id}`}
            className={`flex gap-3 rounded-2xl border p-3.5 transition ${isDone ? 'border-transparent bg-ok-bg/60' : 'border-line bg-white'}`}
          >
            <span
              className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                isDone ? 'animate-pop bg-ok text-white' : 'border-2 border-paper-300 text-muted'
              }`}
              aria-hidden="true"
            >
              {isDone ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {task.title}
                <span className="sr-only">{isDone ? ' (completed)' : ' (not completed)'}</span>
              </p>
              <p className="mt-0.5 text-sm text-muted">{task.description}</p>
              {isDone && record ? (
                <p className="mt-1.5 text-xs font-medium text-ok">
                  {record.confirmedBy === 'manager' ? 'Confirmed by manager' : 'Completed'} · {formatTimestamp(record.completedAt)}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted">
                  About {task.estimatedMinutes} min · {task.completedBy === 'manager' ? 'Manager confirms' : 'Self-service'}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {canComplete && (
                  <Button size="sm" variant={task.completedBy === 'manager' ? 'primary' : 'secondary'} onClick={() => complete(employee.id, task.id)}>
                    <Check className="size-4" aria-hidden="true" />
                    {task.completedBy === 'manager' ? 'Confirm as manager' : 'Mark as done'}
                    <span className="sr-only">: {task.title}</span>
                  </Button>
                )}
                {!isDone && !canComplete && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper-200 px-2.5 py-1.5 text-xs font-semibold text-muted">
                    <Lock className="size-3.5" aria-hidden="true" />
                    Needs a manager
                  </span>
                )}
                {isDone && isManager && (
                  <Button size="sm" variant="ghost" onClick={() => undo(employee.id, task.id)}>
                    <Undo2 className="size-4" aria-hidden="true" />
                    Undo
                    <span className="sr-only">: {task.title}</span>
                  </Button>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** What this person can independently cover, based on structured training data. */
export function SkillReadiness({ employee, compact = false }: { employee: Employee; compact?: boolean }) {
  const { state } = useDemo()
  const coreMissing = missingCoreTasks(employee.id, state.training)
  // Core induction gates every shift, so a skill only counts as ready once it is done too.
  const checks = (Object.keys(SKILLS) as SkillId[]).map((s) => {
    const check = checkSkill(employee, s, state.training)
    return { ...check, ok: check.ok && coreMissing.length === 0 }
  })
  const gap = (c: (typeof checks)[number]) =>
    c.missingTasks.length > 0 || c.missingCompetency
      ? describeSkillGap(c)
      : `Finish core induction first: ${coreMissing.map((id) => taskById(id).title.toLowerCase()).join(', ')}`

  if (compact) {
    return (
      <ul className="flex flex-wrap gap-1.5" aria-label="Shift readiness">
        {checks.map((c) => (
          <li
            key={c.skill}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${c.ok ? 'bg-ok-bg text-ok' : 'bg-paper-200 text-muted line-through decoration-slate/50'}`}
          >
            {c.ok ? <ShieldCheck className="size-3" aria-hidden="true" /> : null}
            {SKILLS[c.skill].label}
            <span className="sr-only">{c.ok ? ': ready' : ': not ready'}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="divide-y divide-line">
      {checks.map((c) => (
        <li key={c.skill} className="flex items-start gap-3 py-2.5" data-testid={`skill-${c.skill}`}>
          {c.ok ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-slate" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {SKILLS[c.skill].label} shifts <span className="sr-only">{c.ok ? 'ready' : 'not ready'}</span>
            </p>
            <p className="text-xs text-muted">{c.ok ? 'Ready to cover independently' : gap(c)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
