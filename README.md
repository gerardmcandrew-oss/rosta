# Rosta

**From first day to every shift.**

Rosta is a college prototype of an employee induction and shift management tool for independent Irish cafés with roughly 5 to 25 staff. It connects induction records to shift eligibility: someone who has not completed till training cannot be offered a till shift.

The project has two parts, both static and served from GitHub Pages:

| Path | What it is |
| --- | --- |
| `/` | Landing page: problem, customer, solution, requirements, competitors, pricing assumptions, behind the build, early-access form |
| `/demo/` | Working demo: manager and employee modes running on a fictional café, Harbour Lane Café, Dublin |

Everything in the demo is **fictional business and sample data**. Prices are **illustrative assumptions**. No testimonials or customer numbers are claimed. The landing page's Testing evidence covers AI-assisted desktop testing and the builder's own iPhone testing only; neither is independent user testing.

## Quick start

Requires Node.js 20 or later (developed on Node 24 LTS).

```bash
npm install
npm run dev          # http://localhost:5173/ and http://localhost:5173/demo/
npm test             # Vitest unit tests for the business rules
npx playwright install chromium
npm run test:e2e     # Playwright browser tests (builds and serves under /rosta/)
npm run build        # type-check and production build into dist/
```

## What works in the demo

- **Persona switcher**: Manager (Niamh) or any of 12 fictional employees. This is a demonstration feature, not a login.
- **Shift replacement workflow**: an employee picks a shift, sees who can cover (and why others cannot), sends a request; the colleague accepts or declines; the manager approves or rejects; the rota updates.
- **Eligibility rules** checked on request, on acceptance and again on approval: active status, core induction, required skills, availability, overlapping shifts, overlapping pending commitments, not the original assignee, shift not already reassigned or started.
- **Induction**: six tasks per person. Employees complete self-service tasks; till training and manager sign-off need manager mode. The final sign-off is only available once every other task is complete, and undoing a task withdraws it.
- **Weekly rota**: grid on desktop, day cards on phones, week navigation, "Return to sample week", manager assignment of open shifts using the same rules.
- **Dashboard metrics** calculated from the records: staff, upcoming shifts, pending requests, coverage, induction progress, people needing training.
- **Persistence** in `localStorage` under versioned keys, with safe recovery from malformed data and a confirmed "Reset sample data" button.

Planned or not included: staff administration, shift creation, notifications, two-way swaps, accounts, multi-device sync and payments. See the "Prototype limitations" table on the landing page.

## Demo scenarios

Open "Things to try" in the demo for guided steps. Each Start button switches persona, returns to the sample week and opens the shift or staff record the scenario uses.

| Scenario | How to see it |
| --- | --- |
| A. Successful replacement | As Priya, request cover for Wed 11 Nov, pick Seán. As Seán, accept. As Manager, approve. |
| B. Missing training | As Ciara, request cover for Thu 12 Nov till shift. Aoife: "Till training not completed". |
| C. Scheduling conflict | Same sheet. Grace: "Already working 07:30 to 12:00 that day". |
| D. Training changes eligibility | As Manager, Team, Aoife, confirm Till training. Repeat B: Aoife can now cover. |

The demo clock is fixed at Monday 9 November 2026, 07:00, so the sample week keeps working whenever the demo is opened.

## Project structure

```
index.html                 Landing page entry
demo/index.html            Demo entry (separate page, works on refresh)
src/
  models/types.ts          Data model
  data/                    Catalogue (tasks, skills), sample data, landing page content
  rules/                   Business logic: training, scheduling, eligibility, requests, actions, metrics
  services/storage.ts      localStorage persistence and validation
  utils/                   Date maths, asset paths
  components/              Shared UI (buttons, sheets, progress, logo)
  demo/                    Demo state store and demo-specific components
  pages/landing/           Landing page sections
  pages/demo/              Demo shell, manager and employee views
  tests/                   Vitest unit tests
e2e/                       Playwright browser tests
public/images/             photography/, product/, illustrations/, branding/
assets-src/photography/    Original licensed photos (inputs to npm run images)
scripts/                   Screenshot capture and photo optimisation
```

## Regenerating images

```bash
npm run images                    # assets-src/photography -> public/images/photography (WebP, 640/1024/1600)
npm run dev & npm run screenshots # real demo screenshots -> public/images/product
```

## Documentation

- [TESTING.md](TESTING.md): automated test results and how to record external user testing
- [DEPLOYMENT.md](DEPLOYMENT.md): publishing to GitHub Pages
- [CREDITS.md](CREDITS.md): photography, sources and licences

## Naming

"Rosta" is a working name for a college prototype. It is not checked for commercial availability and is not affiliated with any company using a similar name. The logo and visual identity are original.
