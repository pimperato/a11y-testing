import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    // Target the prebuilt server started by `webServer` below. Providing `host`
    // tells @nuxt/test-utils NOT to build a Nuxt server per worker — that
    // per-worker build was the main CI time sink.
    nuxt: {
      host: 'http://localhost:3000',
    },
  },
  // Serves the built app once for all workers. Requires `nuxt build` (or
  // `pnpm build`) to have produced .output/ first — locally and in CI.
  webServer: {
    command: 'node .output/server/index.mjs',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
