// @ts-check
import vuejsAccessibility from "eslint-plugin-vuejs-accessibility";
import withNuxt from "./.nuxt/eslint.config.mjs";

// Take only the recommended *rules* — spreading the full flat config would
// override Nuxt's .vue parser and break <script lang="ts"> (TS keywords).
const a11yRules = vuejsAccessibility.configs["flat/recommended"].reduce(
  (rules, config) => ({ ...rules, ...config.rules }),
  {},
);

export default withNuxt(
  // The example pages are intentionally broken a11y fixtures — don't lint them,
  // or `pnpm lint` is red forever. (Remove this to showcase eslint catching them.)
  // { ignores: ['app/pages/examples/**', 'app/pages/missing-h1.vue'] },
  {
    // Accessibility linting for <template> — catches issues in the editor,
    // before they ever reach the Playwright/Axe run.
    files: ["**/*.vue"],
    plugins: { "vuejs-accessibility": vuejsAccessibility },
    rules: a11yRules,
  },
);
