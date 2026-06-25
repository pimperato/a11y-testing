import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@nuxt/test-utils/playwright";

test("examples page has at least one h1", async ({ page, goto }) => {
  await goto("/missing-h1", { waitUntil: "hydration" });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
