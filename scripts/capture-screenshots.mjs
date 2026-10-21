// Captures real screenshots of the running demo for the landing page.
// Usage: npm run dev (in another terminal), then npm run screenshots [baseUrl]
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const BASE = (process.argv[2] ?? 'http://localhost:5173/').replace(/\/?$/, '/')
const OUT = 'public/images/product'
const PERSONA_KEY = 'rosta.demo.persona.v1'
const STATE_KEY = 'rosta.demo.state.v1'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

async function open({ width, height, persona, hash }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  await page.goto(`${BASE}demo/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ([pk, sk, p]) => {
      localStorage.removeItem(sk)
      localStorage.setItem(pk, JSON.stringify(p))
    },
    [PERSONA_KEY, STATE_KEY, persona],
  )
  await page.goto(`${BASE}demo/#${hash}`, { waitUntil: 'networkidle' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  return page
}

async function save(page, name, options = {}) {
  const png = await page.screenshot({ ...options, animations: 'disabled' })
  const info = await sharp(png).webp({ quality: 82 }).toFile(`${OUT}/${name}.webp`)
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`)
  await page.close()
}

const manager = { mode: 'manager' }

// Desktop manager dashboard
await save(await open({ width: 1440, height: 900, persona: manager, hash: 'overview' }), 'dashboard-desktop')

// Weekly rota grid
await save(await open({ width: 1440, height: 900, persona: manager, hash: 'rota' }), 'rota-desktop')

// Onboarding checklist for a new starter (Aoife is expanded by default)
{
  const page = await open({ width: 1280, height: 1000, persona: manager, hash: 'team' })
  await save(page, 'onboarding', { clip: await page.getByTestId('team-e12').boundingBox() })
}

// Mobile employee dashboard
await save(await open({ width: 390, height: 844, persona: { mode: 'employee', employeeId: 'e05' }, hash: 'home' }), 'mobile-employee')

// Mobile manager approval
await save(await open({ width: 390, height: 844, persona: manager, hash: 'requests' }), 'mobile-approval')

// Training eligibility: Ciara asks for cover on the Thursday till shift
{
  const page = await open({ width: 390, height: 844, persona: { mode: 'employee', employeeId: 'e07' }, hash: 'shifts' })
  await page.getByTestId('my-s-1205').getByRole('button', { name: 'Request cover' }).click()
  await page.waitForTimeout(500)
  await page.getByTestId('ineligible-e12').scrollIntoViewIfNeeded()
  await save(page, 'mobile-eligibility')
}

// Same check on desktop, cropped to the dialog
{
  const page = await open({ width: 1280, height: 1000, persona: { mode: 'employee', employeeId: 'e07' }, hash: 'shifts' })
  await page.getByTestId('my-s-1205').getByRole('button', { name: 'Request cover' }).click()
  await page.waitForTimeout(500)
  await save(page, 'eligibility-dialog', { clip: await page.locator('dialog[open]').boundingBox() })
}

await browser.close()
