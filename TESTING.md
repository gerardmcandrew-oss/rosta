# Testing

## Automated tests

### Unit tests (Vitest)

`npm test` runs 57 tests in `src/tests/` against the business rules directly.

| File | Covers |
| --- | --- |
| `date.test.ts` | Week start, weekday index, month/year/leap-year rollover, daylight saving (25 Oct 2026), invalid dates, adjacent vs overlapping times, week labels |
| `eligibility.test.ts` | Availability windows, overlap detection, adjacent shifts, skill vs overall induction %, competencies, core induction, Scenarios B, C and D, staff on leave, original assignee, multiple reasons, candidate ranking |
| `requests.test.ts` | Request creation, rota unchanged on request, ineligible colleague, someone else's shift, duplicate open requests, started shifts, already reassigned shifts, Scenario A end to end, who may respond, decline, invalid transitions, approval before acceptance, duplicate approval, revalidation at approval, training changed after request, double-booking via two acceptances, rejection, cancellation, manager assignment, self-service vs manager tasks |
| `metrics-storage.test.ts` | Sample data minimums and integrity, dashboard metrics derived from records and updating after actions, empty weeks, localStorage round trip, malformed JSON, wrong shape, storage that throws, versioned keys, persona restore, sample data reset |

**Last run: 21 October 2026. 4 files, 57 tests, all passed.**

### Browser tests (Playwright)

`npm run test:e2e` builds the site with `BASE_PATH=/rosta/`, serves it as GitHub Pages would, and runs 21 tests in two projects: an iPhone 15 viewport (Chromium with mobile emulation) and desktop Chrome at 1440 × 900.

- The landing page opens the working demo in one click.
- Scenario A, through the UI: request, switch persona, accept, approve, reload, see the change persisted.
- Scenarios B and C: blocked colleagues show the real reasons and cannot be selected.
- Scenario D: a manager confirms till training and the new starter becomes eligible.
- Approval is disabled while waiting for the colleague. Rejection leaves the rota alone.
- Employees cannot confirm manager-only tasks. Self-service tasks persist after refresh.
- Reset with confirmation restores the sample data.
- Malformed stored data shows a notice and loads the sample week.
- Week navigation and "Return to sample week" work.
- The early-access form validates locally and makes no network requests.
- Honesty labels are present, including the Testing evidence note that none of the testing is independent customer validation.
- No image fails to load.
- No horizontal scrolling at 320, 375, 390, 393, 430, 768, 1024 and 1440 px on the landing page and four demo views.

**Last run: 21 October 2026. 42 test runs (21 tests × 2 projects), all passed.**

The first run found a real defect: at 320 px the request filter tabs overflowed by 20 px. That was fixed and the run repeated. It also found three problems in the tests themselves, which were fixed too.

**What the automated tests do not cover:** real Safari or Firefox (only Chromium was run), real phones, screen readers, and how understandable the product is to someone new. That is what external testing is for.

## External user testing

The assignment needs testing by at least one person who did not build Rosta. **No independent testing has happened yet.** The landing page's "Testing evidence" section records the testing so far: AI-assisted testing in a cloud desktop Chrome browser, and builder testing by Gerard on an iPhone 16 (Safari and Chrome). Both found three issues. They were fixed and, on 28 October 2026, retested successfully in desktop cloud Chrome and on an iPhone 16 in Safari and Google Chrome. The post-fix retest covered those three scenarios only. After the fixes, a family member who was not involved in building Rosta walked through the replacement workflow on an iPhone 17 (browser and date not recorded) and reported no problems. That is feedback from another user, not independent customer validation.

### Test script

Give the tester a phone and the landing page URL. Do not explain the product first.

1. Open the landing page on a phone.
2. Find and open the demo.
3. Switch between manager and employee.
4. Find an upcoming shift.
5. Request a replacement.
6. Try to select an untrained colleague.
7. Try to select someone already scheduled.
8. Accept a valid request as the colleague.
9. Approve the request as manager.
10. Confirm the rota has changed.
11. Refresh and confirm the changes persist.
12. Complete an induction task.
13. See whether eligibility changes.
14. Reset the sample data.
15. Explain anything that was confusing.

Write down what they do and say, especially where they hesitate. Do not help unless they are completely stuck, and note it if you do.

### Recording template

Copy one block per session.

```
Tester type:          (e.g. café owner, part-time barista, classmate with no hospitality background)
Device and browser:   (e.g. iPhone 13, Safari 18)
Test date:
Tasks attempted:      (numbers from the script above)
What worked:
What broke or caused confusion:
Changes made as a result:
```

### Adding findings to the landing page

Add each real session to `TEST_SESSIONS` in `src/data/siteContent.ts`:

```ts
export const TEST_SESSIONS: TestSession[] = [
  {
    title: '...',
    testerType: '...',
    device: '...',
    tasks: '...',      // or a list: ['...', '...']
    worked: '...',
    problems: '...',
    date: '...',       // 'Date not recorded' if unknown
  },
]
```

Each entry appears as a card in the "Testing evidence" section on the landing page. Fixes go in `TEST_CHANGES`, keeping the original result, the change, what was verified and the retest separate. Record only what actually happened, and never label builder, AI-assisted or family-member testing as independent customer validation.
