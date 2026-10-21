import { PHOTO_CREDITS, type PhotoName } from '../data/siteContent'

/** Resolves a file in /public against the deployment base path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const DEMO_URL = asset('demo/')

const PHOTO_SIZES: Record<PhotoName, [number, number]> = {
  counter: [1600, 1067],
  'team-counter': [1600, 955],
  tablet: [1600, 900],
  espresso: [1600, 1067],
}

/** Responsive, lazily loaded photograph with intrinsic size set to avoid layout shift. */
export function Photo({ name, sizes, className = '', eager = false }: { name: PhotoName; sizes: string; className?: string; eager?: boolean }) {
  const credit = PHOTO_CREDITS.find((p) => p.file === name)!
  const [w, h] = PHOTO_SIZES[name]
  return (
    <img
      src={asset(`images/photography/${name}-1024.webp`)}
      srcSet={[640, 1024, 1600].map((x) => `${asset(`images/photography/${name}-${x}.webp`)} ${x}w`).join(', ')}
      sizes={sizes}
      width={w}
      height={h}
      alt={credit.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}

/** Real screenshot of the demo application. */
export function Screenshot({ name, alt, width, height, className = '', eager = false }: { name: string; alt: string; width: number; height: number; className?: string; eager?: boolean }) {
  return (
    <img
      src={asset(`images/product/${name}.webp`)}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}
