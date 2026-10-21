// Converts the licensed source photos in assets-src/photography into
// responsive WebP files in public/images/photography.
import { mkdir, readdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'assets-src/photography'
const OUT = 'public/images/photography'
const WIDTHS = [640, 1024, 1600]

await mkdir(OUT, { recursive: true })
for (const file of await readdir(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue
  const { name } = parse(file)
  for (const width of WIDTHS) {
    const info = await sharp(join(SRC, file)).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(OUT, `${name}-${width}.webp`))
    console.log(`${name}-${width}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`)
  }
}
