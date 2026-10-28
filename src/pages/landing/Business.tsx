import { ArrowRight, ArrowUpRight, Calculator, Check, ClipboardList, Compass, ExternalLink, FlaskConical, Lightbulb, MessagesSquare, Sheet as SheetIcon, Target, UserRound, Users } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Logo } from '../../components/Logo'
import { COMPETITORS, LIMITATIONS, PHOTO_CREDITS, SOURCES_CHECKED, TEST_CHANGES, TEST_SESSIONS, type TestSession } from '../../data/siteContent'
import { asset, DEMO_URL } from '../../utils/assets'
import { StatusBadge } from './Product'
import { SectionIntro } from './Story'

const CURRENT_METHODS = [
  { icon: MessagesSquare, label: 'WhatsApp group chats', note: 'for swaps and last-minute cover' },
  { icon: SheetIcon, label: 'Spreadsheet rotas', note: 'shared as screenshots or printouts' },
  { icon: ClipboardList, label: 'Paper induction checklists', note: 'kept in a folder in the office' },
  { icon: UserRound, label: 'Verbal approvals', note: '"Fine by me" at the counter' },
  { icon: Users, label: 'Separate training records', note: 'if they exist at all' },
]

export function Alternatives() {
  return (
    <section aria-labelledby="alt-heading" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="alt-heading" eyebrow="Existing alternatives" title="How cafés manage today, and what already exists">
          These current methods are our starting assumptions about café workflows. They are not findings from completed interviews.
        </SectionIntro>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CURRENT_METHODS.map((m) => (
            <li key={m.label} className="rounded-2xl border border-line bg-paper p-4">
              <m.icon className="size-5 text-navy" aria-hidden="true" />
              <p className="mt-3 font-semibold">{m.label}</p>
              <p className="mt-0.5 text-sm text-muted">{m.note}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {COMPETITORS.map((c) => (
            <article key={c.name} className="card p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold">{c.name}</h3>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-navy underline-offset-4 hover:underline">
                  {c.url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
              <p className="mt-3 text-muted">{c.summary}</p>
              <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">Sources</p>
              <ul className="mt-2 space-y-1.5">
                {c.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-navy">
                      {s.label} <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">Links and descriptions checked on {SOURCES_CHECKED}.</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-navy p-6 text-paper sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Target className="size-5 text-lime" aria-hidden="true" /> Where Rosta fits
          </h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-paper/75">
            Established platforms already offer scheduling, onboarding and qualified shift replacement. Rosta is not the first to combine them. It explores a
            narrower, simpler experience for one group: small independent cafés that want induction and cover requests in one place without setting up a
            larger workforce system.
          </p>
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  {
    name: 'Starter',
    price: '€0',
    blurb: 'For very small teams getting off spreadsheets.',
    features: ['Up to five employees', 'Basic induction tracking', 'Weekly rota'],
    highlight: false,
  },
  {
    name: 'Team',
    price: '€19',
    blurb: 'For cafés where cover requests happen every week.',
    features: ['Up to 25 employees', 'Shift replacement requests', 'Manager approvals', 'Training-based eligibility'],
    highlight: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="pricing-heading" eyebrow="Pricing" title="Simple monthly plans" align="center" />
        <p className="mx-auto mt-5 max-w-xl rounded-xl bg-warn-bg px-4 py-3 text-center text-sm font-medium text-warn">
          Illustrative pricing assumptions for a college prototype. No subscriptions are available.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`flex flex-col rounded-[1.75rem] p-7 sm:p-8 ${p.highlight ? 'on-dark bg-navy text-paper shadow-float' : 'card'}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {p.highlight && <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold text-navy">Includes cover requests</span>}
              </div>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="tabular text-5xl font-bold tracking-tight">{p.price}</span>
                <span className={p.highlight ? 'text-paper/60' : 'text-muted'}>per month</span>
              </p>
              <p className={`mt-3 ${p.highlight ? 'text-paper/70' : 'text-muted'}`}>{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 size-5 shrink-0 ${p.highlight ? 'text-lime' : 'text-ok'}`} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#early-access"
                className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl font-semibold transition ${
                  p.highlight ? 'bg-lime text-navy hover:bg-lime-300' : 'border border-line bg-white hover:border-slate/50'
                }`}
              >
                Join the early-access list <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const TEST_FIELDS: { key: Exclude<keyof TestSession, 'title' | 'suggestion'>; label: string }[] = [
  { key: 'testerType', label: 'Tester type' },
  { key: 'device', label: 'Device and browser' },
  { key: 'tasks', label: 'Tasks attempted' },
  { key: 'worked', label: 'What worked' },
  { key: 'problems', label: 'What broke or caused confusion' },
  { key: 'changes', label: 'Changes made' },
  { key: 'date', label: 'Test date' },
]

const CHANGE_FIELDS = [
  { key: 'original', label: 'Original result' },
  { key: 'change', label: 'Change made' },
  { key: 'verified', label: 'Verified' },
  { key: 'retested', label: 'Retest' },
] as const

function FieldValue({ value }: { value: string | string[] }) {
  if (typeof value === 'string') return <>{value}</>
  return (
    <ul className="list-disc space-y-1 pl-5 marker:text-slate">
      {value.map((v) => (
        <li key={v}>{v}</li>
      ))}
    </ul>
  )
}

export function BehindTheBuild() {
  const notes = [
    {
      icon: Lightbulb,
      title: 'Initial hypothesis',
      body: 'If induction records and shift eligibility are connected, managers will spend less effort checking whether a replacement is suitable, and staff will be able to arrange cover without a group chat. This is a hypothesis to test, not a result.',
    },
    {
      icon: Users,
      title: 'Customer segment',
      body: 'Independent cafés in Ireland with roughly 5 to 25 staff and no dedicated HR or rota administrator. The owner or manager is the buyer; staff are daily users.',
    },
    {
      icon: ExternalLink,
      title: 'Competitor research',
      body: `Reviewed the public pages of Deputy and Connecteam, linked in the footer and checked on ${SOURCES_CHECKED}. Both already cover qualified shift replacement with optional approval, so Rosta's angle is simplicity for one segment.`,
    },
    {
      icon: Target,
      title: 'Product assumptions',
      body: 'Assumed: staff check rotas on phones; managers want final approval; a few induction tasks map cleanly to shift skills; €0 and €19 are plausible price points. None of this has been validated with customers yet.',
    },
  ]

  return (
    <section id="behind-the-build" aria-labelledby="build-heading" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro id="build-heading" eyebrow="Behind the build" title="How this prototype came together">
          Rosta is a college project. Here is what it is based on, what it assumes, and what it does not do yet.
        </SectionIntro>

        <article className="mt-12 rounded-2xl border border-line bg-paper p-6" data-testid="change-of-direction">
          <h3 className="flex items-center gap-2 font-bold">
            <Compass className="size-5 text-navy" aria-hidden="true" /> Why I changed direction
          </h3>
          <div className="mt-2 max-w-3xl space-y-3 leading-relaxed text-muted">
            <p>
              I originally had a different product idea. Then, one night in my local bar, where I worked around 25 years ago, I overheard staff arranging a
              shift swap. They were still using printed rosters, just as we had back then. The conversation was familiar too: someone agreed to cover, the
              boss needed to approve it, and an updated roster had to be printed.
            </p>
            <p>
              That made me change direction. Rosta grew from a problem I recognised first-hand: the conversation could happen quickly, but getting the
              change approved and reflected on the roster still took extra steps. I chose independent cafés as the initial niche to explore that problem.
            </p>
          </div>
        </article>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {notes.map((n) => (
            <article key={n.title} className="rounded-2xl border border-line bg-paper p-6">
              <h3 className="flex items-center gap-2 font-bold">
                <n.icon className="size-5 text-navy" aria-hidden="true" /> {n.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{n.body}</p>
            </article>
          ))}
        </div>

        <article className="mt-4 rounded-2xl border border-line bg-paper p-6" data-testid="pricing-rationale">
          <h3 className="flex items-center gap-2 font-bold">
            <Calculator className="size-5 text-navy" aria-hidden="true" /> Pricing rationale
          </h3>
          <div className="mt-2 max-w-3xl space-y-3 leading-relaxed text-muted">
            <p>
              €19 per café per month is an initial pricing hypothesis for the Team plan. A flat monthly fee keeps the cost predictable for an owner and
              avoids a separate charge every time someone joins the team. For five staff it works out at €3.80 per employee per month, falling to €0.76 at
              the 25-person limit.
            </p>
            <p>
              The commercial assumption is that reducing the time spent chasing cover, checking training and updating rotas could justify a modest monthly
              cost. For illustration, if a manager's time is valued at €20 per hour, saving roughly one hour a month would cover the subscription. This is a
              break-even example, not a measured saving.
            </p>
            <p>
              The free Starter plan offers a way to try basic induction tracking and the rota. The paid Team plan adds cover requests, approvals and
              training-based eligibility, giving cafés a reason to upgrade when those tasks become a recurring problem.
            </p>
            <p>
              The price has not been validated with café owners. Customer interviews, willingness-to-pay tests and estimates of hosting, support and payment
              costs would be needed before deciding whether €19 is both attractive to customers and commercially sustainable.
            </p>
          </div>
        </article>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <figure className="flex flex-col rounded-2xl border border-line bg-paper p-3 sm:flex-row sm:items-center sm:gap-2">
            <img src={asset('images/illustrations/readiness.svg')} alt="" width={320} height={200} loading="lazy" className="h-auto w-full rounded-xl sm:w-56 sm:shrink-0" />
            <figcaption className="px-2 pt-3 pb-1 text-sm text-muted">
              Training readiness is worked out skill by skill. Someone can be ready for floor service and not yet for the till.
            </figcaption>
          </figure>
          <figure className="flex flex-col rounded-2xl border border-line bg-paper p-3 sm:flex-row sm:items-center sm:gap-2">
            <img src={asset('images/illustrations/approval.svg')} alt="" width={320} height={200} loading="lazy" className="h-auto w-full rounded-xl sm:w-56 sm:shrink-0" />
            <figcaption className="px-2 pt-3 pb-1 text-sm text-muted">
              The manager approves only after the colleague accepts, and every check runs again at that moment.
            </figcaption>
          </figure>
        </div>

        <h3 className="mt-16 text-xl font-bold tracking-tight">Prototype limitations</h3>
        <div className="card mt-4 overflow-hidden">
          <ul className="divide-y divide-line">
            {LIMITATIONS.map((l) => (
              <li key={l.feature} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">
                <span className="sm:w-40 sm:shrink-0">
                  <StatusBadge status={l.status} />
                </span>
                <span className="font-semibold sm:w-96 sm:shrink-0">{l.feature}</span>
                <span className="text-sm text-muted">{l.note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="testing" className="mt-16">
          <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <FlaskConical className="size-5" aria-hidden="true" /> Testing evidence
          </h3>
          <p className="mt-2 max-w-3xl text-muted" data-testid="testing-status">
            Testing included AI-assisted desktop checks, the builder's own testing on an iPhone 16, and a post-fix walkthrough on an iPhone 17 by a family
            member who was not involved in building the demo. This provided feedback from another user, although it was not independent customer
            validation.
          </p>
          <div className="mt-4 space-y-4">
            {TEST_SESSIONS.map((s, i) => (
              <article key={s.title} className="card p-6" data-testid={`test-session-${i + 1}`}>
                <h4 className="font-bold">
                  {i + 1}. {s.title}
                </h4>
                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[12rem_1fr]">
                  {TEST_FIELDS.map((f) => {
                    const value = s[f.key]
                    if (value === undefined) return null
                    return (
                      <div key={f.key} className="contents">
                        <dt className="text-sm font-semibold text-muted">{f.label}</dt>
                        <dd>
                          <FieldValue value={value} />
                          {f.key === 'changes' && s.suggestion && (
                            <div className="mt-3 rounded-xl border border-dashed border-paper-300 bg-paper p-4" data-testid="future-suggestion">
                              <p className="text-sm font-semibold">{s.suggestion.title}</p>
                              <p className="mt-1 text-sm text-muted">{s.suggestion.body}</p>
                            </div>
                          )}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </article>
            ))}
            <article className="card p-6" data-testid="test-changes">
              <h4 className="font-bold">Changes made</h4>
              <p className="mt-1 text-sm text-muted">
                Fixes for the three issues found by testing sources 1 and 2. The post-fix retest covered these three scenarios only; the other mobile tests were not repeated.
              </p>
              <div className="mt-4 divide-y divide-line">
                {TEST_CHANGES.map((c) => (
                  <section key={c.issue} aria-label={c.issue} className="py-4 first:pt-0 last:pb-0">
                    <h5 className="font-semibold">{c.issue}</h5>
                    <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[12rem_1fr]">
                      {CHANGE_FIELDS.map((f) => (
                        <div key={f.key} className="contents">
                          <dt className="text-sm font-semibold text-muted">{f.label}</dt>
                          <dd>{c[f.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

type FormState = { status: 'idle' } | { status: 'error'; errors: Record<string, string> } | { status: 'done'; name: string }

/** Early-access form. Validated in the browser; nothing is sent or stored anywhere. */
export function EarlyAccess() {
  const [state, setState] = useState<FormState>({ status: 'idle' })
  const ids = { name: useId(), email: useId(), size: useId() }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const size = String(data.get('size') ?? '')
    const errors: Record<string, string> = {}
    if (name.length < 2) errors.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter an email address like name@cafe.ie.'
    if (!size) errors.size = 'Choose your team size.'
    if (Object.keys(errors).length > 0) {
      setState({ status: 'error', errors })
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`)
      first?.focus()
      return
    }
    e.currentTarget.reset()
    setState({ status: 'done', name: name.split(' ')[0]! })
  }

  const errors = state.status === 'error' ? state.errors : {}
  const field = 'mt-1.5 block h-12 w-full rounded-xl border bg-white px-3.5 text-base text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime'

  return (
    <section id="early-access" aria-labelledby="ea-heading" className="on-dark relative isolate overflow-hidden bg-navy py-20 text-paper sm:py-28">
      <div aria-hidden="true" className="absolute top-[-12rem] left-[-8rem] -z-10 size-[30rem] rounded-full bg-lime/[0.06] blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-paper/55 uppercase">Early access</p>
          <h2 id="ea-heading" className="mt-3 text-3xl leading-tight font-bold tracking-[-0.025em] text-balance sm:text-[2.6rem]">
            Run a café? Join the early-access list.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-paper/70">
            We would like to hear from independent café owners and managers about how rotas and inductions work for you today.
          </p>
          <p className="mt-6 max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-paper/70">
            This is a demonstration form. Your details are checked in your browser and then cleared. Nothing is sent, saved or shared.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 text-ink shadow-float sm:p-8">
          {state.status === 'done' ? (
            <div role="status" className="animate-rise py-6 text-center">
              <span className="mx-auto grid size-14 animate-pop place-items-center rounded-full bg-lime text-navy">
                <Check className="size-7" strokeWidth={3} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Thanks, {state.name}</h3>
              <p className="mx-auto mt-2 max-w-sm text-muted">
                This is a demonstration, so no registration has been submitted and your details were not stored. Rosta is a college prototype and has no
                real early-access list yet.
              </p>
              <a href={DEMO_URL} className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-paper hover:bg-navy-800">
                Try the demo instead <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <form noValidate onSubmit={submit} aria-describedby="ea-note" className="space-y-5">
              <div>
                <label htmlFor={ids.name} className="text-sm font-semibold">
                  Your name
                </label>
                <input
                  id={ids.name}
                  name="name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${ids.name}-err` : undefined}
                  className={`${field} ${errors.name ? 'border-bad' : 'border-line'}`}
                />
                {errors.name && (
                  <p id={`${ids.name}-err`} className="mt-1.5 text-sm text-bad">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={ids.email} className="text-sm font-semibold">
                  Work email
                </label>
                <input
                  id={ids.email}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@cafe.ie"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${ids.email}-err` : undefined}
                  className={`${field} ${errors.email ? 'border-bad' : 'border-line'}`}
                />
                {errors.email && (
                  <p id={`${ids.email}-err`} className="mt-1.5 text-sm text-bad">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={ids.size} className="text-sm font-semibold">
                  How many people work at your café?
                </label>
                <select
                  id={ids.size}
                  name="size"
                  defaultValue=""
                  aria-invalid={!!errors.size}
                  aria-describedby={errors.size ? `${ids.size}-err` : undefined}
                  className={`${field} ${errors.size ? 'border-bad' : 'border-line'}`}
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  <option>1 to 4</option>
                  <option>5 to 12</option>
                  <option>13 to 25</option>
                  <option>More than 25</option>
                </select>
                {errors.size && (
                  <p id={`${ids.size}-err`} className="mt-1.5 text-sm text-bad">
                    {errors.size}
                  </p>
                )}
              </div>
              <button type="submit" className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-lime font-semibold text-navy transition hover:bg-lime-300">
                Join the early-access list <ArrowRight className="size-5" aria-hidden="true" />
              </button>
              <p id="ea-note" className="text-center text-xs text-muted">
                Demonstration only. No data leaves this page.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-dark border-t border-white/10 bg-navy text-paper/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <Logo tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Rosta is a college prototype exploring induction and shift management for independent Irish cafés. It is not a commercial product. "Rosta" is a
            working name and is not affiliated with any company of the same name.
          </p>
          <a href={DEMO_URL} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lime hover:underline">
            Open the working demo <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-paper">Sources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {COMPETITORS.flatMap((c) => [{ label: c.name, url: c.url }, ...c.sources.map((s) => ({ label: `${c.name}: ${s.label}`, url: s.url }))]).map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-paper hover:underline">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-paper/50">Checked {SOURCES_CHECKED}.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-paper">Image credits</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PHOTO_CREDITS.map((p) => (
              <li key={p.file}>
                Photo by{' '}
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-2 hover:text-paper">
                  {p.creator}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{' '}
                on Unsplash
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-paper/50">Used under the Unsplash License. Product images are screenshots of the Rosta demo. Illustrations and logo are original.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-paper/50 sm:px-6 lg:px-8">
          College prototype. Harbour Lane Café and its staff are fictional. Testing evidence covers AI-assisted desktop checks, builder testing and a family-member walkthrough. It does not establish customer demand, and no customer validation or real sign-ups are claimed.
        </p>
      </div>
    </footer>
  )
}
