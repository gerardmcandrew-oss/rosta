interface LogoProps {
  tone?: 'dark' | 'light'
  className?: string
  showWordmark?: boolean
}

/**
 * The Rosta mark: a rounded tile holding three rota bars, the last one
 * ticked off in lime. It reads as "a week of shifts, sorted".
 */
export function LogoMark({ className = 'size-8', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const tile = tone === 'dark' ? '#0B1220' : '#F8F7F3'
  const bars = tone === 'dark' ? '#F8F7F3' : '#0B1220'
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={tile} />
      <rect x="7" y="8" width="13" height="3.2" rx="1.6" fill={bars} opacity="0.55" />
      <rect x="7" y="14.4" width="18" height="3.2" rx="1.6" fill={bars} opacity="0.8" />
      <rect x="7" y="20.8" width="9" height="3.2" rx="1.6" fill={bars} />
      <circle cx="22.4" cy="22.4" r="3.6" fill="#C9F36B" />
      <path d="m20.9 22.5 1.1 1.1 2-2.2" fill="none" stroke="#0B1220" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ tone = 'dark', className = '', showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark tone={tone === 'dark' ? 'light' : 'dark'} />
      {showWordmark && (
        <span className={`text-[1.2rem] font-bold tracking-[-0.03em] ${tone === 'dark' ? 'text-paper' : 'text-navy'}`}>rosta</span>
      )}
    </span>
  )
}
