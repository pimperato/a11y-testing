import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@nuxt/test-utils/playwright'

test('examples page has at least one h1', async ({ page, goto }) => {
  await goto('/examples', { waitUntil: 'hydration' })

  // axe's `page-has-heading-one` rule flags any page lacking a level-one heading.
  const results = await new AxeBuilder({ page })
    .withRules(['page-has-heading-one'])
    .analyze()

  // Fails: examples.vue currently renders no <h1>.
  expect(results.violations).toEqual([])
})
