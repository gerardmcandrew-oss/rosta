import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'lime' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-paper hover:bg-navy-800 shadow-sm',
  lime: 'bg-lime text-navy hover:bg-lime-300 shadow-sm',
  secondary: 'bg-white text-ink border border-line hover:border-slate/50 hover:bg-paper',
  ghost: 'text-ink hover:bg-paper-200',
  danger: 'bg-white text-bad border border-bad/25 hover:bg-bad-bg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-[0.95rem]', lg: 'h-13 px-6 text-base' }
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export type Tone = 'ok' | 'warn' | 'info' | 'bad' | 'neutral' | 'lime'

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  info: 'bg-info-bg text-info',
  bad: 'bg-bad-bg text-bad',
  neutral: 'bg-paper-200 text-muted',
  lime: 'bg-lime text-navy',
}

export function Pill({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

const AVATAR_COLOURS = ['#E9E3D3', '#DDE7F0', '#E4EBD9', '#F0E0DA', '#E3DFF0', '#DCEDEA']

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  const colour = AVATAR_COLOURS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLOURS.length]
  const sizes = { sm: 'size-7 text-[0.65rem]', md: 'size-9 text-xs', lg: 'size-12 text-sm' }
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-navy ${sizes[size]}`}
      style={{ background: colour }}
    >
      {initials}
    </span>
  )
}

export function ProgressBar({ value, label, tone = 'navy' }: { value: number; label: string; tone?: 'navy' | 'lime' }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full ${tone === 'lime' ? 'bg-white/15' : 'bg-paper-200'}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone === 'lime' ? 'bg-lime' : 'bg-navy'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function ProgressRing({ value, size = 64, label }: { value: number; size?: number; label: string }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="tabular absolute inset-0 grid place-items-center text-sm font-bold">{value}%</span>
    </div>
  )
}

/**
 * Accessible modal built on the native <dialog> element, which provides
 * focus trapping, Escape to close and inert background content. On phones
 * it presents as a bottom sheet so actions stay within thumb reach.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-white p-0 text-ink shadow-float open:animate-rise sm:m-auto sm:max-h-[86vh] sm:max-w-lg sm:rounded-[1.75rem]"
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {title}
              </h2>
              {description && <div className="mt-1 text-sm text-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-paper-200"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">{children}</div>
          {footer && <div className="border-t border-line bg-paper/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-paper-300 px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-paper-200 text-slate">{icon}</span>
      <p className="mt-3 font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  )
}

export function SectionHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
