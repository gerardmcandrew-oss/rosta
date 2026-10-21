import { ArrowLeft, BookOpen, CalendarDays, ChevronsUpDown, GraduationCap, Home, Inbox, LayoutDashboard, RotateCcw, Users, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ROLE_LABELS } from '../../data/catalogue'
import { CAFE_LOCATION, CAFE_NAME } from '../../data/sampleData'
import type { Shift } from '../../models/types'
import { Logo } from '../../components/Logo'
import { Avatar } from '../../components/ui'
import { CoverRequestSheet } from '../../demo/components/CoverRequestSheet'
import { ShiftDetailSheet } from '../../demo/components/ShiftDetailSheet'
import { DemoProvider, useDemo } from '../../demo/store'
import { GuideSheet, PersonaSheet, RecoveredNotice, ResetSheet, Toasts } from './DemoChrome'
import { EmployeeHome, EmployeeInduction, EmployeeRequests, EmployeeShifts } from './employee/EmployeeViews'
import { ManagerOverview } from './manager/ManagerOverview'
import { ManagerRequests } from './manager/ManagerRequests'
import { ManagerRota } from './manager/ManagerRota'
import { ManagerTeam } from './manager/ManagerTeam'

export type ManagerTab = 'overview' | 'rota' | 'requests' | 'team'
export type EmployeeTab = 'home' | 'shifts' | 'requests' | 'induction'
type Tab = ManagerTab | EmployeeTab

interface NavItem {
  id: Tab
  label: string
  icon: LucideIcon
  badge?: number
}

/** Tabs live in the URL hash so refresh and the back button keep your place on static hosting. */
function useHashTab(valid: Tab[], fallback: Tab): [Tab, (t: Tab) => void] {
  const read = () => {
    const h = window.location.hash.replace('#', '') as Tab
    return valid.includes(h) ? h : fallback
  }
  const [tab, setTab] = useState<Tab>(read)
  useEffect(() => {
    const onHash = () => setTab(read())
    window.addEventListener('hashchange', onHash)
    setTab(read())
    return () => window.removeEventListener('hashchange', onHash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid.join(), fallback])
  const go = (t: Tab) => {
    if (t !== tab) window.location.hash = t
    window.scrollTo({ top: 0 })
  }
  return [tab, go]
}

function Shell() {
  const { state, persona, actor } = useDemo()
  const [personaOpen, setPersonaOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [coverShift, setCoverShift] = useState<Shift | null>(null)
  const [detailShift, setDetailShift] = useState<string | null>(null)

  const isManager = persona.mode === 'manager'
  const awaitingManager = state.requests.filter((r) => r.status === 'pending-manager').length
  const incoming = state.requests.filter((r) => r.proposedId === actor.id && r.status === 'pending-colleague').length

  const nav: NavItem[] = isManager
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'rota', label: 'Rota', icon: CalendarDays },
        { id: 'requests', label: 'Requests', icon: Inbox, badge: awaitingManager },
        { id: 'team', label: 'Team', icon: Users },
      ]
    : [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'shifts', label: 'My shifts', icon: CalendarDays },
        { id: 'requests', label: 'Requests', icon: Inbox, badge: incoming },
        { id: 'induction', label: 'Induction', icon: GraduationCap },
      ]
  const [tab, go] = useHashTab(
    nav.map((n) => n.id),
    isManager ? 'overview' : 'home',
  )

  const siteHref = import.meta.env.BASE_URL

  const PersonaButton = ({ dark = false }: { dark?: boolean }) => (
    <button
      type="button"
      onClick={() => setPersonaOpen(true)}
      data-testid="persona-button"
      className={`flex w-full items-center gap-2.5 rounded-2xl p-2 text-left transition ${dark ? 'bg-white/[0.06] hover:bg-white/10' : 'hover:bg-paper-200'}`}
    >
      <Avatar name={actor.name} size={dark ? 'md' : 'sm'} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${dark ? 'text-paper' : ''}`}>{isManager ? 'Manager' : actor.name.split(' ')[0]}</span>
        <span className={`block truncate text-xs ${dark ? 'text-paper/60' : 'text-muted'}`}>
          {isManager ? actor.name : ROLE_LABELS[actor.role]}
        </span>
      </span>
      <ChevronsUpDown className={`size-4 shrink-0 ${dark ? 'text-paper/50' : 'text-muted'}`} aria-hidden="true" />
      <span className="sr-only">Switch persona</span>
    </button>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="on-dark sticky top-0 hidden h-dvh flex-col bg-navy px-4 py-5 text-paper lg:flex">
        <a href={siteHref} className="px-2" aria-label="Rosta home page">
          <Logo tone="dark" />
        </a>
        <div className="mt-6 rounded-2xl border border-white/10 p-3">
          <p className="text-sm font-semibold">
            {CAFE_NAME}, {CAFE_LOCATION}
          </p>
          <p className="mt-0.5 text-xs text-lime">Fictional business and sample data</p>
        </div>
        <div className="mt-4">
          <p className="mb-1.5 px-2 text-[0.68rem] font-semibold tracking-[0.14em] text-paper/45 uppercase">Viewing as</p>
          <PersonaButton dark />
        </div>
        <nav aria-label="Demo sections" className="mt-6 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              aria-current={tab === n.id ? 'page' : undefined}
              className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                tab === n.id ? 'bg-paper text-navy' : 'text-paper/75 hover:bg-white/[0.06] hover:text-paper'
              }`}
            >
              <n.icon className="size-[1.15rem]" aria-hidden="true" />
              <span className="flex-1 text-left">{n.label}</span>
              {!!n.badge && <span className="tabular grid min-w-5 place-items-center rounded-full bg-lime px-1.5 text-xs font-bold text-navy">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4 text-sm">
          <button type="button" onClick={() => setGuideOpen(true)} className="flex h-10 w-full items-center gap-3 rounded-xl px-3 font-semibold text-paper/75 hover:bg-white/[0.06] hover:text-paper">
            <BookOpen className="size-4" aria-hidden="true" /> Things to try
          </button>
          <button type="button" onClick={() => setResetOpen(true)} className="flex h-10 w-full items-center gap-3 rounded-xl px-3 font-semibold text-paper/75 hover:bg-white/[0.06] hover:text-paper">
            <RotateCcw className="size-4" aria-hidden="true" /> Reset sample data
          </button>
          <a href={siteHref} className="flex h-10 items-center gap-3 rounded-xl px-3 font-semibold text-paper/75 hover:bg-white/[0.06] hover:text-paper">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to the website
          </a>
          <p className="px-3 pt-2 text-xs leading-relaxed text-paper/45">Changes are saved in this browser only. They do not sync between devices.</p>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center gap-2 px-4">
            <a href={siteHref} aria-label="Rosta home page" className="shrink-0">
              <Logo tone="light" showWordmark={false} />
            </a>
            <div className="min-w-0 flex-1">
              <PersonaButton />
            </div>
            <button type="button" onClick={() => setGuideOpen(true)} className="grid size-11 place-items-center rounded-xl text-ink hover:bg-paper-200" aria-label="Things to try">
              <BookOpen className="size-5" />
            </button>
            <button type="button" onClick={() => setResetOpen(true)} className="grid size-11 place-items-center rounded-xl text-ink hover:bg-paper-200" aria-label="Reset sample data">
              <RotateCcw className="size-5" />
            </button>
          </div>
        </header>

        <div className="border-b border-line bg-paper-200/60 px-4 py-2 text-center text-[0.72rem] leading-snug text-muted sm:px-6 lg:text-left lg:text-xs">
          <span className="font-semibold text-ink">
            {CAFE_NAME}: fictional business and sample data.
          </span>{' '}
          Demo clock fixed at Monday 9 November 2026, 07:00. Saved in this browser only.
        </div>

        <main id="main" className="mx-auto w-full max-w-[90rem] px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
          <RecoveredNotice />
          <div key={`${persona.mode}-${actor.id}-${tab}`} className="animate-rise">
            {isManager ? (
              <>
                {tab === 'overview' && <ManagerOverview go={go} onShift={setDetailShift} />}
                {tab === 'rota' && <ManagerRota onShift={setDetailShift} />}
                {tab === 'requests' && <ManagerRequests />}
                {tab === 'team' && <ManagerTeam />}
              </>
            ) : (
              <>
                {tab === 'home' && <EmployeeHome employee={actor} go={go} onRequest={setCoverShift} />}
                {tab === 'shifts' && <EmployeeShifts employee={actor} onRequest={setCoverShift} onShift={(s) => setDetailShift(s.id)} />}
                {tab === 'requests' && <EmployeeRequests employee={actor} />}
                {tab === 'induction' && <EmployeeInduction employee={actor} />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav
        aria-label="Demo sections"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              aria-current={tab === n.id ? 'page' : undefined}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition ${tab === n.id ? 'text-navy' : 'text-muted'}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${tab === n.id ? 'bg-lime' : ''}`}>
                <n.icon className="size-5" aria-hidden="true" />
              </span>
              {n.label}
              {!!n.badge && (
                <span className="tabular absolute top-1.5 left-[calc(50%+0.6rem)] grid min-w-[1.1rem] place-items-center rounded-full bg-navy px-1 text-[0.65rem] font-bold text-lime">
                  {n.badge}
                  <span className="sr-only"> waiting</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <PersonaSheet open={personaOpen} onClose={() => setPersonaOpen(false)} />
      <GuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />
      <ResetSheet open={resetOpen} onClose={() => setResetOpen(false)} />
      <CoverRequestSheet shift={coverShift} onClose={() => setCoverShift(null)} />
      <ShiftDetailSheet shiftId={detailShift} onClose={() => setDetailShift(null)} />
      <Toasts />
    </div>
  )
}

export function DemoApp() {
  return (
    <DemoProvider>
      <Shell />
    </DemoProvider>
  )
}
