import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@nuxt/test-utils/playwright'

const PAGES_DIR = fileURLToPath(new URL('../app/pages', import.meta.url))

// Walk app/pages recursively and map each .vue file to its Nuxt route.
//   app/pages/index.vue            -> /
//   app/pages/missing-h1.vue       -> /missing-h1
//   app/pages/examples/image-alt.vue -> /examples/image-alt
function discoverRoutes(dir: string, base = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return discoverRoutes(join(dir, entry.name), `${base}/${entry.name}`)
    }
    if (!entry.name.endsWith('.vue')) return []
    const name = entry.name.replace(/\.vue$/, '')
    return [name === 'index' ? base || '/' : `${base}/${name}`]
  })
}

const routes = discoverRoutes(PAGES_DIR)

// Plain-English message per axe rule, so a non-coder reading the CI report sees
// "There is a missing h1 tag!" instead of rule ids. Anything not listed falls
// back to axe's own help text.
const FRIENDLY: Record<string, string> = {
  'page-has-heading-one': 'There is a missing h1 tag!',
  'heading-order': 'The headings skip a level (e.g. h1 jumps to h3)!',
  'image-alt': 'An image is missing its alt text!',
  'button-name': 'A button has no readable name!',
  'link-name': 'A link has no readable text!',
  label: 'A form field is missing a label!',
  'color-contrast': 'Some text is too low-contrast to read!',
  'aria-roles': 'An element uses an invalid ARIA role!',
  'aria-valid-attr-value': 'An ARIA attribute has an invalid value!',
  'frame-title': 'An iframe is missing a title!',
  list: 'A list contains something other than list items!',
  'nested-interactive': 'Interactive controls are nested inside each other!',
  tabindex: 'An element uses a positive tabindex!',
}

const explain = (id: string, help: string) => FRIENDLY[id] ?? `${id} — ${help}`

// One test per page — each gets its own name, pass/fail and report entry.
for (const route of routes) {
  test(`a11y: ${route}`, async ({ page, goto }) => {
    await goto(route, { waitUntil: 'hydration' })

    const { violations } = await new AxeBuilder({ page })
      // The Nuxt DevTools overlay isn't part of the app — don't scan it.
      .exclude('#nuxt-devtools-anchor')
      .exclude('nuxt-devtools-frame')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze()

    // Assert on the human-readable list (not the raw axe objects) so BOTH the
    // headline error and the expected/received diff stay in plain English.
    const problems = violations.map((v) => explain(v.id, v.help))
    expect(problems, problems.join('\n')).toEqual([])
  })
}
