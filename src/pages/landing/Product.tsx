import { ArrowUpRight, CalendarDays, CheckCircle2, GraduationCap, Inbox, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { REQUIREMENTS, type FeatureStatus } from '../../data/siteContent'
import { DEMO_URL, Screenshot } from '../../utils/assets'
import { SectionIntro } from './Story'

export function StatusBadge({ status }: { status: FeatureStatus }) {
  const tone =
    status === 'Working in demo' ? 'bg-ok-bg text-ok' : status === 'Planned' ? 'bg-info-bg text-info' : 'bg-paper-200 text-muted'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tone}`}>
      {status === 'Working in demo' && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
      {status}
    </span>
  )
}

function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.2rem] bg-navy p-2 shadow-float ${className}`}>
      <div className="overflow-hidden rounded-[1.75rem]">{children}</div>
    </div>
  )
}

interface FeatureRow {
  icon: LucideIcon
  eyebrow: string
  title: string
  body: string
  points: string[]
  visual: ReactNode
}

const FEATURES: FeatureRow[] = [
  {
    icon: Inbox,
    eyebrow: 'Shift requests',
    title: 'Ask the right person, not the whole group',
    body: 'An employee picks a shift they cannot work. Rosta lists the colleagues who could take it, and explains why everyone else cannot.',
    points: ['Request goes to one named colleague', 'They accept or decline in the app', 'Status and history on every request'],
    visual: (
      <div className="flex items-end justify-center gap-4 sm:gap-6">
        <PhoneFrame className="w-[46%] max-w-[15rem]">
          <Screenshot name="mobile-employee" width={780} height={1688} alt="Employee home screen showing the next shift with a Can't make it button" className="h-auto w-full" />
        </PhoneFrame>
        <PhoneFrame className="mb-10 w-[46%] max-w-[15rem]">
          <Screenshot
            name="mobile-eligibility"
            width={780}
            height={1688}
            alt="Request cover sheet listing two colleagues who can cover and others who cannot, with reasons"
            className="h-auto w-full"
          />
        </PhoneFrame>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Training eligibility',
    title: 'Ready for the floor is not the same as ready for the till',
    body: 'Ready for one role does not mean ready for every role. A new starter might be ready for floor service while still needing practical till training. Rosta checks the training and recorded experience required for each shift before listing eligible replacements.',
    points: [
      'Core induction tasks first, then the training each shift needs',
      'Barista and supervisor shifts also need experience recorded by a manager',
      'Availability and clashing shifts are checked separately',
      'Every reason shown in plain language',
    ],
    visual: (
      <div className="mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-float">
        <Screenshot
          name="eligibility-dialog"
          width={1024}
          height={1720}
          alt="Eligibility check for a Thursday till shift. Aoife Kelly: till training not completed. Grace Okafor: already working 07:30 to 12:00"
          className="h-auto w-full"
        />
      </div>
    ),
  },
  {
    icon: UserCheck,
    eyebrow: 'Manager approvals',
    title: 'Approve with one thumb',
    body: 'Approval only unlocks once the colleague has accepted. At that moment Rosta runs every check again, in case anything changed since the request was made.',
    points: ['Big, clear Approve and Reject buttons', 'Duplicate approvals are blocked', 'Rejected requests never touch the rota'],
    visual: (
      <div className="flex justify-center">
        <PhoneFrame className="w-[62%] max-w-[17rem]">
          <Screenshot name="mobile-approval" width={780} height={1688} alt="Manager requests screen on a phone with a request ready to approve or reject" className="h-auto w-full" />
        </PhoneFrame>
      </div>
    ),
  },
  {
    icon: GraduationCap,
    eyebrow: 'Induction tracking',
    title: 'Every new starter, one checklist',
    body: 'Staff work through a sample checklist of six induction tasks, ticking off the self-service ones. A manager confirms practical till training and gives the final sign-off, which needs every other task complete. Overall induction progress and shift readiness are different. Staff may be ready for some work before their full induction is signed off.',
    points: ['Progress worked out from completed tasks', 'Manager-only tasks stay locked for staff', 'A sample internal checklist, not an accredited qualification'],
    visual: (
      <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-float">
        <Screenshot
          name="onboarding"
          width={1856}
          height={1470}
          alt="A new starter's induction checklist with four of six tasks done, and a list of which shift types she can cover"
          className="h-auto w-full"
        />
      </div>
    ),
  },
  {
    icon: CalendarDays,
    eyebrow: 'Weekly rota',
    title: 'The whole week at a glance',
    body: 'A clear grid on a laptop, and day-by-day cards on a phone. Open shifts, covered shifts and pending requests are marked. Managers can assign only people who pass every check.',
    points: ['Week-by-week navigation', 'Open shifts highlighted', 'Overlapping assignments prevented'],
    visual: (
      <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-float">
        <Screenshot
          name="rota-desktop"
          width={2880}
          height={1800}
          alt="Weekly rota grid for Harbour Lane Café with one row per team member and coloured shift chips for supervisor, barista, till and floor"
          className="h-auto w-full"
        />
      </div>
    ),
  },
]

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="features-heading" eyebrow="Features" title="Built around the swap that goes wrong" align="center">
          Every screenshot below is from the working demo, running on sample data.
        </SectionIntro>
        <div className="mt-16 space-y-20 sm:space-y-28">
          {FEATURES.map((f, i) => (
            <article key={f.eyebrow} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                  <span className="grid size-8 place-items-center rounded-lg bg-lime">
                    <f.icon className="size-4" aria-hidden="true" />
                  </span>
                  {f.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">{f.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted">{f.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <StatusBadge status="Working in demo" />
                </div>
              </div>
              <div className={`rounded-[2rem] bg-paper p-5 sm:p-8 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>{f.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const TRY_LIST = [
  'Request cover as Priya and see who is eligible',
  'Accept as Seán, then approve as the manager',
  'Watch a new starter get blocked from a till shift',
  'Confirm her till training and see the result change',
]

export function DemoPreview() {
  return (
    <section aria-labelledby="demo-heading" className="on-dark relative isolate overflow-hidden bg-navy py-20 text-paper sm:py-28">
      <div aria-hidden="true" className="absolute right-[-10rem] bottom-[-14rem] -z-10 size-[36rem] rounded-full bg-lime/[0.06] blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-paper/55 uppercase">Product demonstration</p>
          <h2 id="demo-heading" className="mt-3 text-3xl leading-tight font-bold tracking-[-0.025em] sm:text-[2.6rem]">
            Try it on your phone
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-paper/70">
            The demo is a working app, not a mock-up. Switch between the manager and any of twelve fictional staff at Harbour Lane Café.
          </p>
          <ol className="mt-8 space-y-3">
            {TRY_LIST.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="tabular grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-xs font-bold text-lime">{i + 1}</span>
                <span className="text-paper/85">{t}</span>
              </li>
            ))}
          </ol>
          <a
            href={DEMO_URL}
            className="mt-10 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 font-semibold text-navy transition hover:-translate-y-px hover:bg-lime-300 sm:w-auto"
          >
            Try the working demo <ArrowUpRight className="size-5" aria-hidden="true" />
          </a>
          <p className="mt-4 text-sm text-paper/50">Changes are saved in your browser only. You can reset the sample data at any time.</p>
        </div>
        <a
          href={DEMO_URL}
          className="group block overflow-hidden rounded-2xl ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-lime/40"
          aria-label="Open the working demo"
        >
          <Screenshot name="rota-desktop" width={2880} height={1800} alt="" className="block h-auto w-full transition duration-500 group-hover:scale-[1.015]" />
        </a>
      </div>
    </section>
  )
}

export function Requirements() {
  return (
    <section id="requirements" aria-labelledby="req-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="req-heading" eyebrow="Requirements" title="Six things a café needs it to do">
          Written before the build, and checked against the demo. Each one can be tried in the working app.
        </SectionIntro>

        {/* Table from md up, stacked cards on phones */}
        <div className="card mt-12 hidden overflow-hidden md:block">
          <table className="w-full text-left">
            <caption className="sr-only">Customer requirements and how Rosta addresses them</caption>
            <thead className="border-b border-line bg-paper/70 text-sm">
              <tr>
                <th scope="col" className="w-16 px-5 py-3.5 font-semibold text-muted">
                  ID
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-muted">
                  Requirement
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold text-muted">
                  How Rosta addresses it
                </th>
                <th scope="col" className="w-44 px-5 py-3.5 font-semibold text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {REQUIREMENTS.map((r) => (
                <tr key={r.id} className="align-top">
                  <th scope="row" className="tabular px-5 py-4 font-bold">
                    {r.id}
                  </th>
                  <td className="px-5 py-4 font-medium">{r.need}</td>
                  <td className="px-5 py-4 text-muted">
                    {r.howRosta}
                    {r.planned && <span className="mt-1 block text-sm text-info">Planned: {r.planned}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-10 space-y-3 md:hidden">
          {REQUIREMENTS.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="tabular font-bold">{r.id}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 font-semibold">{r.need}</p>
              <p className="mt-1.5 text-sm text-muted">{r.howRosta}</p>
              {r.planned && <p className="mt-1.5 text-sm text-info">Planned: {r.planned}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
