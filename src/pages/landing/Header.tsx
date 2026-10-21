import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from '../../components/Logo'
import { DEMO_URL } from '../../utils/assets'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#behind-the-build', label: 'Behind the build' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open

  return (
    <header className={`on-dark fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'bg-navy/95 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md' : ''}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <a href="#top" aria-label="Rosta, back to top" className="shrink-0">
          <Logo tone="dark" />
        </a>
        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-paper/70 transition hover:text-paper">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={DEMO_URL}
            className="hidden h-10 items-center gap-1.5 rounded-xl bg-lime px-4 text-sm font-semibold text-navy transition hover:bg-lime-300 sm:inline-flex"
          >
            Try the demo <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-11 place-items-center rounded-xl text-paper hover:bg-white/10 md:hidden"
          >
            {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="animate-rise border-t border-white/10 px-4 pt-2 pb-6 md:hidden">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center border-b border-white/[0.06] text-base font-medium text-paper/85"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={DEMO_URL} className="mt-5 flex h-12 items-center justify-center gap-1.5 rounded-xl bg-lime font-semibold text-navy">
            Try the demo <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  )
}
