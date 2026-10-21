import { defineConfig, devices } from '@playwright/test'

// Tests run against a production build served under a repository-style
// subpath, which is how GitHub Pages hosts a project site.
const BASE_PATH = '/rosta/'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:4173${BASE_PATH}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'], defaultBrowserType: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npx vite build --logLevel warn && npx vite preview --port 4173 --strictPort`,
    env: { BASE_PATH },
    url: `http://localhost:4173${BASE_PATH}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
