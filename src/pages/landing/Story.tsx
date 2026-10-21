import { ClipboardList, MessagesSquare, Sheet as SheetIcon, UserCheck, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { asset, Photo } from '../../utils/assets'

export function SectionIntro({ eyebrow, title, children, align = 'left', id }: { eyebrow: string; title: ReactNode; children?: ReactNode; align?: 'left' | 'center'; id?: string }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl leading-tight font-bold tracking-[-0.025em] text-balance sm:text-[2.6rem]">
        {title}
      </h2>
      {children && <div className="mt-4 text-lg leading-relaxed text-pretty text-muted">{children}</div>}
    </div>
  )
}

const PAINS = [
  {
    icon: SheetIcon,
    title: 'The rota lives in a spreadsheet',
    body: 'One person edits it. Everyone else gets a screenshot that is out of date by Wednesday.',
  },
  {
    icon: MessagesSquare,
    title: 'Swaps happen in the group chat',
    body: '"Can anyone take my Saturday?" gets buried under twenty other messages, and the manager has to piece together who agreed to what.',
  },
  {
    icon: ClipboardList,
    title: 'Training is on a paper checklist',
    body: 'When a new starter offers to cover a till shift, nobody can easily check whether they have actually been trained on the till.',
  },
]

export function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionIntro id="problem-heading" eyebrow="The problem" title="Small teams, scattered information">
              Small café managers often juggle WhatsApp messages, spreadsheets, verbal approvals and paper checklists. That makes it hard to know who is working,
              whether a replacement is suitable and whether a new employee is ready.
            </SectionIntro>
            <ul className="mt-10 space-y-6">
              {PAINS.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-navy shadow-card ring-1 ring-line">
                    <p.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 text-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative">
            <div className="overflow-hidden rounded-[1.75rem] shadow-float">
              <Photo name="counter" sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3.4] h-auto w-full object-cover" />
            </div>
            <blockquote className="relative -mt-16 ml-4 max-w-sm rounded-2xl bg-navy p-5 text-paper shadow-float sm:-mt-20 sm:ml-[-2rem] lg:ml-[-3.5rem]">
              <p className="text-[1.05rem] leading-relaxed">
                "Our rota is in a spreadsheet, shift changes happen in WhatsApp, and I still have to check whether a new starter is ready to work a shift."
              </p>
              <footer className="mt-3 text-xs font-medium text-lime">Illustrative customer scenario. Not a verified customer quotation.</footer>
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  )
}

export function Audience() {
  return (
    <section aria-labelledby="audience-heading" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="audience-heading" eyebrow="Who it is for" title="Independent Irish cafés with 5 to 25 staff">
          Teams without an HR department or a rota administrator. Usually a mix of experienced baristas, part-time students and new starters. The owner or
          manager decides and pays. Everyone else uses it on their phone.
        </SectionIntro>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-[1.75rem] border border-line bg-paper">
            <Photo name="tablet" sizes="(min-width: 1024px) 600px, 100vw" className="aspect-[16/8] h-auto w-full object-cover object-[50%_30%]" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-navy text-lime">
                  <UserCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">For the manager</h3>
                  <p className="text-sm text-muted">Pays for Rosta. Owns the rota.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-[0.95rem]">
                <li>See which new starters still need training, and confirm it in one tap.</li>
                <li>Approve a swap knowing the colleague is trained, available and not double-booked.</li>
                <li>Keep a record of who changed what, instead of scrolling back through chats.</li>
              </ul>
            </div>
          </article>
          <article className="overflow-hidden rounded-[1.75rem] border border-line bg-paper">
            <Photo name="team-counter" sizes="(min-width: 1024px) 600px, 100vw" className="aspect-[16/8] h-auto w-full object-cover" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-lime text-navy">
                  <Smartphone className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">For the team</h3>
                  <p className="text-sm text-muted">Baristas, till and floor staff, supervisors and new starters.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-[0.95rem]">
                <li>Check your next shift on your phone in a few seconds.</li>
                <li>Ask a specific colleague to cover, and see straight away who can.</li>
                <li>Work through your induction and see which shifts you are ready for.</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  {
    image: 'step-team',
    title: 'Set up your team',
    body: 'The manager keeps staff records, roles, the skills each shift needs and the induction tasks. The demo uses a preloaded fictional team.',
  },
  {
    image: 'step-induction',
    title: 'Get everyone ready',
    body: 'New employees work through induction tasks. Managers see progress and confirm training that has to happen in person, like the till.',
  },
  {
    image: 'step-shifts',
    title: 'Manage shift changes',
    body: 'Staff request cover from an eligible colleague. The colleague accepts, the manager approves, and the rota updates itself.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="how-heading" eyebrow="How it works" title="Three steps, one place" align="center">
          Induction and shift eligibility are connected, so a rota change is only offered to people who are ready for it.
        </SectionIntro>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="group card overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:shadow-float">
              <img src={asset(`images/illustrations/${s.image}.svg`)} alt="" width={320} height={200} loading="lazy" className="h-auto w-full rounded-2xl" />
              <div className="px-3 pt-5 pb-4">
                <p className="tabular text-sm font-semibold text-muted">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

