import { expect, test } from '@playwright/test'

test('early-access form validates locally and sends nothing', async ({ page }) => {
  const outbound: string[] = []
  await page.goto('./')
  page.on('request', (r) => {
    if (!['image', 'font', 'stylesheet', 'script'].includes(r.resourceType())) outbound.push(`${r.method()} ${r.url()}`)
  })
  const form = page.locator('#early-access')
  await form.getByRole('button', { name: 'Join the early-access list' }).click()
  await expect(form.getByText('Enter your name.')).toBeVisible()
  await form.getByLabel('Your name').fill('Test Person')
  await form.getByLabel('Work email').fill('not-an-email')
  await form.getByRole('button', { name: 'Join the early-access list' }).click()
  await expect(form.getByText(/Enter an email address/)).toBeVisible()
  await form.getByLabel('Work email').fill('test@example.ie')
  await form.getByLabel(/How many people/).selectOption('5 to 12')
  await form.getByRole('button', { name: 'Join the early-access list' }).click()
  await expect(form.getByRole('status')).toContainText('no registration has been submitted')
  expect(outbound).toEqual([])
})

test('honesty labels are present', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByText('Illustrative customer scenario. Not a verified customer quotation.')).toBeVisible()
  await expect(page.getByText('Illustrative pricing assumptions for a college prototype. No subscriptions are available.')).toBeVisible()
  await expect(page.getByTestId('testing-status')).toContainText('Neither is independent user testing')
  await expect(page.getByText('External user testing pending.')).toHaveCount(0)
  await expect(page.getByTestId('test-changes').getByText(/Retest on an iPhone in Safari and Chrome/)).toHaveCount(3)
  await expect(page.getByText('Links and descriptions checked on 21 October 2026.').first()).toBeVisible()
})

test('no images are broken', async ({ page }) => {
  await page.goto('./')
  for (let y = 0; y < 26000; y += 700) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(40)
  }
  await page.waitForLoadState('networkidle')
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src))
  expect(broken).toEqual([])
})

for (const width of [320, 375, 390, 393, 430, 768, 1024, 1440]) {
  test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['./', 'demo/', 'demo/#rota', 'demo/#requests', 'demo/#team']) {
      await page.goto(path)
      await page.waitForTimeout(150)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0)
    }
  })
}
