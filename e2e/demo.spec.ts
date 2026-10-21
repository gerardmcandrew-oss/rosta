import { expect, test, type Page } from '@playwright/test'

const PERSONA_KEY = 'rosta.demo.persona.v1'

async function openDemoAs(page: Page, persona: { mode: 'manager' } | { mode: 'employee'; employeeId: string }, hash = '') {
  await page.goto('demo/')
  await page.evaluate(([k, p]) => localStorage.setItem(k, JSON.stringify(p)), [PERSONA_KEY, persona] as const)
  await page.goto(`demo/${hash ? `#${hash}` : ''}`)
  // A hash-only navigation does not reload the app, so reload to pick up the stored persona.
  await page.reload()
}

/** Switch persona through the real UI, as a tester would. */
async function switchTo(page: Page, label: string) {
  await page.getByTestId('persona-button').filter({ visible: true }).click()
  const dialog = page.getByRole('dialog', { name: 'View the demo as' })
  await dialog.getByRole('button', { name: new RegExp(`^${label}`) }).click()
  await expect(dialog).toBeHidden()
}

async function nav(page: Page, name: string | RegExp) {
  await page.getByRole('navigation', { name: 'Demo sections' }).filter({ visible: true }).getByRole('button', { name }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('demo/')
  await page.evaluate(() => localStorage.clear())
})

test('landing page opens the working demo in one click', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('New starters ready.')
  await page.getByRole('link', { name: /Try the demo/ }).filter({ visible: true }).first().click()
  await expect(page).toHaveURL(/\/rosta\/demo\/$/)
  await expect(page.getByText(/fictional business and sample data/i).filter({ visible: true }).first()).toBeVisible()
})

test('Scenario A: request, accept, approve, rota updates and persists', async ({ page }) => {
  await openDemoAs(page, { mode: 'employee', employeeId: 'e05' }, 'shifts')
  const card = page.getByTestId('my-s-1102')
  await card.getByRole('button', { name: 'Request cover' }).click()
  const sheet = page.getByRole('dialog', { name: 'Request cover' })
  await sheet.getByText('Seán Ó Briain').click()
  await sheet.getByRole('button', { name: 'Send request' }).click()
  await expect(page.getByText('Request sent to Seán.')).toBeVisible()
  await expect(card).toContainText('Cover requested from Seán')

  await switchTo(page, 'Seán')
  await nav(page, /Requests/)
  const request = page.getByTestId('request-r-005').first()
  await expect(request).toContainText('Pending colleague response')
  await request.getByRole('button', { name: 'Accept' }).click()
  await expect(page.getByText('Accepted. A manager will review it next.')).toBeVisible()

  await switchTo(page, 'Manager')
  await nav(page, /Requests/)
  const managerCard = page.getByTestId('request-r-005')
  await managerCard.getByRole('button', { name: 'Approve' }).click()
  await expect(page.getByText('Approved. Seán is now on the rota.')).toBeVisible()

  await page.reload()
  await switchTo(page, 'Seán')
  await nav(page, 'My shifts')
  await expect(page.getByTestId('my-s-1102')).toContainText('Covering for Priya')
})

test('Scenarios B and C: blocked colleagues show the real reasons', async ({ page }) => {
  await openDemoAs(page, { mode: 'employee', employeeId: 'e07' }, 'shifts')
  await page.getByTestId('my-s-1205').getByRole('button', { name: 'Request cover' }).click()
  const sheet = page.getByRole('dialog', { name: 'Request cover' })
  await expect(sheet.getByTestId('ineligible-e12')).toContainText('Till training not completed')
  await expect(sheet.getByTestId('ineligible-e08')).toContainText('Already working 07:30 to 12:00 that day')
  // Blocked colleagues cannot be selected at all
  await expect(sheet.getByRole('radio', { name: /Aoife/ })).toHaveCount(0)
})

test('Scenario D: confirming training makes a new starter eligible', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'team')
  const aoife = page.getByTestId('team-e12')
  await aoife.getByTestId('task-till-training').getByRole('button', { name: /Confirm as manager/ }).click()
  await expect(aoife.getByTestId('task-till-training')).toContainText('Confirmed by manager')

  await switchTo(page, 'Ciara')
  await nav(page, 'My shifts')
  await page.getByTestId('my-s-1205').getByRole('button', { name: 'Request cover' }).click()
  const sheet = page.getByRole('dialog', { name: 'Request cover' })
  await expect(sheet.getByTestId('ineligible-e12')).toHaveCount(0)
  await expect(sheet.getByText('Aoife Kelly')).toBeVisible()
})

test('approval is blocked until the colleague accepts', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'requests')
  await page.getByRole('tab', { name: /With colleague/ }).click()
  await expect(page.getByTestId('request-r-004').getByRole('button', { name: 'Approve' })).toBeDisabled()
})

test('rejecting leaves the rota unchanged', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'requests')
  await page.getByTestId('request-r-003').getByRole('button', { name: 'Reject' }).click()
  await expect(page.getByText('Request rejected. The rota has not changed.')).toBeVisible()
  await page.getByRole('tab', { name: /History/ }).click()
  await expect(page.getByTestId('request-r-003')).toContainText('Rejected')
})

test('employees cannot confirm manager-only tasks', async ({ page }) => {
  await openDemoAs(page, { mode: 'employee', employeeId: 'e13' }, 'induction')
  await expect(page.getByTestId('task-till-training')).toContainText('Needs a manager')
  await page.getByTestId('task-workplace-intro').getByRole('button', { name: /Mark as done/ }).click()
  await expect(page.getByTestId('task-workplace-intro')).toContainText('Completed')
  await page.reload()
  await expect(page.getByTestId('task-workplace-intro')).toContainText('Completed')
})

test('reset restores the sample data after confirmation', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'requests')
  await page.getByTestId('request-r-003').getByRole('button', { name: 'Approve' }).click()
  await expect(page.getByText(/Approved/)).toBeVisible()
  await page.getByRole('button', { name: 'Reset sample data' }).filter({ visible: true }).first().click()
  await page.getByRole('dialog', { name: 'Reset sample data?' }).getByRole('button', { name: 'Reset sample data' }).click()
  await expect(page.getByTestId('request-r-003')).toContainText('Pending manager approval')
})

test('malformed stored data falls back to the sample week', async ({ page }) => {
  await page.goto('demo/')
  await page.evaluate(() => localStorage.setItem('rosta.demo.state.v1', '{broken'))
  await page.reload()
  await expect(page.getByText('could not be read')).toBeVisible()
  await expect(page.getByText('Good morning, Niamh')).toBeVisible()
})

test('week navigation and return to sample week', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'rota')
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.getByText('16 Nov to 22 Nov 2026')).toBeVisible()
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.getByText('No shifts scheduled this week')).toBeVisible()
  await page.getByRole('button', { name: 'Return to sample week' }).click()
  await expect(page.getByText('9 Nov to 15 Nov 2026')).toBeVisible()
})
