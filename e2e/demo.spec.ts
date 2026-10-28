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

test('final sign-off waits for every induction task and is withdrawn if one is undone', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'team')
  const aoife = page.getByTestId('team-e12')
  const signOff = aoife.getByTestId('task-manager-sign-off')
  await expect(signOff.getByRole('button', { name: /Confirm as manager/ })).toBeDisabled()
  await expect(signOff).toContainText('Complete till training first.')

  await aoife.getByTestId('task-till-training').getByRole('button', { name: /Confirm as manager/ }).click()
  await signOff.getByRole('button', { name: /Confirm as manager/ }).click()
  await expect(signOff).toContainText('Confirmed by manager')

  await aoife.getByTestId('task-till-training').getByRole('button', { name: /Undo/ }).click()
  await expect(page.getByText(/Manager sign-off removed: a fresh sign-off is needed/)).toBeVisible()
  await expect(signOff).not.toContainText('Confirmed by manager')
  await expect(signOff.getByRole('button', { name: /Confirm as manager/ })).toBeDisabled()

  // Redoing till training does not restore the old sign-off.
  await aoife.getByTestId('task-till-training').getByRole('button', { name: /Confirm as manager/ }).click()
  await expect(signOff.getByRole('button', { name: /Confirm as manager/ })).toBeEnabled()
  await expect(signOff).not.toContainText('Confirmed by manager')
})

test('a saved sign-off with tasks outstanding is withdrawn with a notice', async ({ page }) => {
  await page.goto('demo/')
  await page.evaluate(() => {
    const raw = localStorage.getItem('rosta.demo.state.v1')
    const s = raw ? JSON.parse(raw) : null
    s.training.push({ employeeId: 'e12', taskId: 'manager-sign-off', completedAt: '2026-11-09T07:02:00.000Z', confirmedBy: 'manager' })
    localStorage.setItem('rosta.demo.state.v1', JSON.stringify(s))
  })
  await page.reload()
  await expect(page.getByText('Manager sign-off was removed for Aoife Kelly')).toBeVisible()
})

test("Home counts the demo clock's week, not the week browsed in My shifts", async ({ page }) => {
  await openDemoAs(page, { mode: 'employee', employeeId: 'e07' }, 'home')
  await expect(page.getByText('You have 5 shifts coming up this week.')).toBeVisible()
  await nav(page, 'My shifts')
  await expect(page.locator('[data-testid^="my-s-"]')).toHaveCount(5)
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.locator('[data-testid^="my-s-"]')).toHaveCount(2)
  await nav(page, 'Home')
  await expect(page.getByText('You have 5 shifts coming up this week.')).toBeVisible()
  await expect(page.getByTestId('next-shift')).toContainText('Monday, 9 November')

  // Browsing backwards and switching persona keep Home on the current week too.
  await nav(page, 'My shifts')
  await page.getByRole('button', { name: 'Previous week' }).click()
  await page.getByRole('button', { name: 'Previous week' }).click()
  await switchTo(page, 'Priya')
  await nav(page, 'Home')
  await expect(page.getByText('You have 4 shifts coming up this week.')).toBeVisible()
  await expect(page.getByTestId('next-shift')).toContainText('Monday, 9 November')
})

test('Home shows a clear empty state when nothing is upcoming', async ({ page }) => {
  await openDemoAs(page, { mode: 'employee', employeeId: 'e13' }, 'home')
  await expect(page.getByTestId('no-upcoming')).toContainText('No upcoming shifts')
  await expect(page.getByText('No more shifts for you this week.')).toBeVisible()
})

async function startScenario(page: Page, id: string) {
  await page.getByRole('button', { name: 'Things to try' }).filter({ visible: true }).first().click()
  await page.getByTestId(`scenario-${id}`).getByRole('button', { name: /^Start as/ }).click()
}

test('scenario Start opens the sample week and the right record after browsing elsewhere', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'rota')
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.getByText('16 Nov to 22 Nov 2026')).toBeVisible()

  // B: employee scenario, cover request for the Thursday till shift opens directly.
  await startScenario(page, 'B')
  const sheet = page.getByRole('dialog', { name: 'Request cover' })
  await expect(sheet).toContainText('Thursday, 12 November')
  await expect(sheet.getByTestId('ineligible-e12')).toContainText('Till training not completed')
  await sheet.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByText('9 Nov to 15 Nov 2026')).toBeVisible()
  await expect(page.getByTestId('my-s-1205')).toBeVisible()

  // A: browse away as Ciara first, then start as Priya.
  await page.getByRole('button', { name: 'Next week' }).click()
  await startScenario(page, 'A')
  await expect(page.getByRole('dialog', { name: 'Request cover' })).toContainText('Wednesday, 11 November')
  await page.getByRole('dialog', { name: 'Request cover' }).getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByTestId('my-s-1102')).toBeVisible()

  // D: manager scenario, Aoife's record opens in Team.
  await page.getByRole('button', { name: 'Next week' }).click()
  await startScenario(page, 'D')
  await expect(page.getByRole('heading', { name: 'Team and induction' })).toBeVisible()
  await expect(page.getByTestId('team-e12').getByTestId('task-till-training')).toBeVisible()
  await nav(page, 'Rota')
  await expect(page.getByText('9 Nov to 15 Nov 2026')).toBeVisible()
})

test('scenario explains changed conditions and keeps demo changes', async ({ page }) => {
  await openDemoAs(page, { mode: 'manager' }, 'team')
  await page.getByTestId('team-e12').getByTestId('task-till-training').getByRole('button', { name: /Confirm as manager/ }).click()
  await page.getByRole('button', { name: 'Things to try' }).filter({ visible: true }).first().click()
  await expect(page.getByTestId('scenario-B-changed')).toContainText("Aoife's till training has already been confirmed")
  await expect(page.getByTestId('scenario-D-changed')).toBeVisible()
  await expect(page.getByTestId('scenario-A-changed')).toHaveCount(0)
  await page.getByTestId('scenario-B').getByRole('button', { name: 'Reset sample data' }).click()
  await expect(page.getByRole('dialog', { name: 'Reset sample data?' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Reset sample data?' }).getByRole('button', { name: 'Keep my changes' }).click()
  await expect(page.getByTestId('team-e12').getByTestId('task-till-training')).toContainText('Confirmed by manager')
})
