import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { DEMO_URL, Screenshot } from '../../utils/assets'

export function Hero() {
  return (
    <section id="top" className="on-dark relative isolate overflow-hidden bg-navy pt-28 text-paper sm:pt-32 lg:pt-40">
      {/* Restrained backdrop: a faint grid and one soft lime wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div aria-hidden="true" className="absolute top-[-14rem] left-1/2 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-paper/75">
            <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
            For independent cafés in Ireland
          </p>
          <h1 className="mt-6 text-[2.35rem] leading-[1.06] min-[400px]:text-[2.6rem] font-bold tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl">
            <span className="block">New starters ready.</span> <span className="block text-lime">Shift changes sorted.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-paper/70 sm:text-xl">
            Keep café inductions, weekly rotas and staff shift requests together, without chasing messages across group chats.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={DEMO_URL}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-lime px-6 text-base font-semibold text-navy shadow-[0_8px_30px_-8px_rgb(201_243_107/0.5)] transition hover:-translate-y-px hover:bg-lime-300 sm:w-auto"
            >
              Try the demo <ArrowUpRight className="size-5" aria-hidden="true" />
            </a>
            <a
              href="#early-access"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-6 text-base font-semibold text-paper transition hover:border-white/30 hover:bg-white/[0.04] sm:w-auto"
            >
              Join the early-access list <ArrowRight className="size-5" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-5 text-xs text-paper/50">College prototype. The demo runs on a fictional café and sample data.</p>
        </div>

        {/* Product showcase built from real screenshots of the demo */}
        <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="relative hidden sm:block sm:pr-[14%] lg:pr-[17%]">
            <div className="overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-navy-900 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]">
              <div className="flex h-9 items-center gap-1.5 border-b border-white/10 px-4" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="ml-4 h-5 w-56 rounded-md bg-white/[0.06]" />
              </div>
              <Screenshot
                eager
                name="dashboard-desktop"
                width={2880}
                height={1800}
                alt="Rosta manager dashboard for the fictional Harbour Lane Café, showing request, staff, coverage and induction figures, a shift change awaiting approval and induction progress"
                className="block h-auto w-full"
              />
            </div>
          </div>
          <div className="relative mx-auto w-[min(19rem,78%)] sm:absolute sm:right-0 sm:bottom-[-2.5rem] sm:mx-0 sm:w-[30%] lg:w-[26%]">
            <div className="rounded-[2.4rem] bg-[#05080f] p-2.5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.75)] ring-1 ring-white/10">
              <div className="overflow-hidden rounded-[1.9rem]">
                <Screenshot
                  eager
                  name="mobile-eligibility"
                  width={780}
                  height={1688}
                  alt="Rosta on a phone: requesting cover for a till shift. Two colleagues can cover; a new starter is blocked because till training is not complete"
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-16 bg-gradient-to-b from-transparent to-navy sm:h-24" aria-hidden="true" />
    </section>
  )
}
