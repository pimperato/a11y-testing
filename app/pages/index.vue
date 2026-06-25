<script lang="ts" setup>
// Accessibility testing flow — a worked example of how each layer (Playwright + Axe,
// manual tooling, MCP, screen readers) fits together and what each one can/can't catch.
//
// Screenshots are placeholders: drop the real captures into
//   public/screenshots/<id>-console.png   (browser console / dev-tools error)
//   public/screenshots/<id>-cicd.png      (CI/CD pipeline failure)

const AXE_RULES_BASE = "https://dequeuniversity.com/rules/axe/4.12";

interface AxeRule {
  id: string;
  title: string;
  example: string;
}

// What Playwright + Axe DOES catch — each links to its Deque rule page.
const axeRules: AxeRule[] = [
  {
    id: "page-has-heading-one",
    title: "Missing h1",
    example: "A page renders with no top-level <h1>.",
  },
  {
    id: "heading-order",
    title: "Heading hierarchy issues",
    example: "Jumping from <h2> straight to <h4>.",
  },
  {
    id: "aria-roles",
    title: "Incorrect ARIA roles",
    example: 'role="buton" or a role that isn’t valid for the element.',
  },
  {
    id: "aria-valid-attr-value",
    title: "Invalid ARIA attributes",
    example: 'aria-expanded="yep" or aria-labelledby pointing at a missing id.',
  },
  {
    id: "label",
    title: "Missing form labels",
    example: "An <input> with no associated <label>.",
  },
  {
    id: "button-name",
    title: "Missing button names",
    example: "An icon-only <button> with no text or aria-label.",
  },
  {
    id: "link-name",
    title: "Missing link text",
    example: "An <a> wrapping only an icon, no discernible text.",
  },
  {
    id: "image-alt",
    title: "Missing image alt text",
    example: "An <img> with no alt attribute.",
  },
  {
    id: "document-title",
    title: "Missing page title",
    example: "The document has an empty or missing <title>.",
  },
  {
    id: "html-has-lang",
    title: "Missing html lang",
    example: "<html> has no lang attribute.",
  },
  {
    id: "color-contrast",
    title: "Colour contrast failures",
    example: "Grey text on a white background below the 4.5:1 ratio.",
  },
  {
    id: "duplicate-id",
    title: "Duplicate IDs",
    example: 'Two elements share id="email".',
  },
  {
    id: "region",
    title: "Missing landmarks",
    example: "Content sitting outside any <main>/<nav>/<header> landmark.",
  },
];

// What Axe canNOT catch — these need human judgement / a detailed brief.
const doesNotCatch: string[] = [
  "Whether the most appropriate semantic element was chosen",
  "Requirements over quality — does it meet the intent, not just the rule",
  "Poorly labelled or titled components — judged individually",
  "Poorly labelled or titled components — judged across the whole document",
  "Poor screen-reader experience",
  "Page structure, meaning and reading order",
];

const manualOptions = [
  {
    name: "Nuxt A11y plugin",
    href: "https://nuxt.com/modules/a11y",
    note: "In-app dev-time hints while you build.",
  },
  {
    name: "WAVE (Chrome extension)",
    href: "https://chromewebstore.google.com/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh",
    note: "Visual overlay of issues on the live page.",
  },
  {
    name: "axe DevTools (Chrome extension)",
    href: "https://chromewebstore.google.com/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd",
    note: "Same engine as the Playwright tests, run by hand.",
  },
  {
    name: "eslint-plugin-vuejs-accessibility",
    href: "https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/",
    note: "Catches issues in the editor, before commit.",
  },
];

const mcp = {
  name: "Deque axe MCP server",
  href: "https://www.deque.com/axe/mcp-server/",
};

// The two capture types each rule needs a screenshot for.
const captures = [
  { key: "console", label: "Browser console error" },
  { key: "cicd", label: "CI/CD pipeline error" },
];

const ruleHref = (id: string) =>
  `${AXE_RULES_BASE}/${id}?application=playwright`;
const shotPath = (id: string, key: string) => `/screenshots/${id}-${key}.png`;

// Tracks screenshots that 404 so we fall back to the placeholder until the real
// file is dropped into public/screenshots/. Add a file → it just appears.
const missing = reactive(new Set<string>());
const shotKey = (id: string, key: string) => `${id}-${key}`;
</script>

<template>
  <main class="flow">
    <header class="intro">
      <h1>Accessibility testing flow</h1>
      <p>
        How each layer fits together for a change — what the automated tools
        catch, what they don’t, and the manual steps that fill the gap. Each
        rule below has a worked example plus placeholders for the console and
        CI/CD screenshots.
      </p>
    </header>

    <!-- 1. Playwright + Axe -->
    <section aria-labelledby="playwright-h">
      <h2 id="playwright-h">1. Playwright <span class="muted">(Axe)</span></h2>

      <h3>
        What it catches
        <a
          class="rules-link"
          :href="`${AXE_RULES_BASE}/`"
          target="_blank"
          rel="noopener"
        >
          Link to rules →
        </a>
      </h3>

      <ol class="rule-list">
        <li v-for="rule in axeRules" :key="rule.id" class="rule">
          <div class="rule-head">
            <h4>{{ rule.title }}</h4>
            <a :href="ruleHref(rule.id)" target="_blank" rel="noopener">
              <code>{{ rule.id }}</code>
            </a>
          </div>

          <p class="example"><strong>Example:</strong> {{ rule.example }}</p>

          <div class="shots">
            <figure v-for="cap in captures" :key="cap.key" class="shot">
              <!-- Real screenshot if present; placeholder until the file is added. -->
              <img
                v-if="!missing.has(shotKey(rule.id, cap.key))"
                class="shot-img"
                :src="shotPath(rule.id, cap.key)"
                :alt="`${cap.label}: ${rule.title}`"
                loading="lazy"
                @error="missing.add(shotKey(rule.id, cap.key))"
              />
              <div
                v-else
                class="placeholder"
                role="img"
                :aria-label="`${cap.label} placeholder for ${rule.title}`"
              >
                <span class="placeholder-icon" aria-hidden="true">🖼️</span>
                <span class="placeholder-text">{{ cap.label }}</span>
              </div>
              <figcaption>
                {{ cap.label }} —
                <code>public{{ shotPath(rule.id, cap.key) }}</code>
              </figcaption>
            </figure>
          </div>
        </li>
      </ol>

      <h3>What it does <em>not</em> catch</h3>
      <ul class="plain">
        <li v-for="item in doesNotCatch" :key="item">{{ item }}</li>
      </ul>
    </section>

    <!-- 2. Manual testing -->
    <section aria-labelledby="manual-h">
      <h2 id="manual-h">2. Manual testing</h2>
      <p class="muted">
        Is this required? It depends on the change — here are the options.
      </p>
      <ul class="cards">
        <li v-for="opt in manualOptions" :key="opt.name">
          <a :href="opt.href" target="_blank" rel="noopener">{{ opt.name }}</a>
          <span class="note">{{ opt.note }}</span>
        </li>
      </ul>
      <p class="theory">
        <strong>Theory:</strong> with a detailed story and wireframe, most
        label- and title-text problems are mitigated before code is written.
      </p>
    </section>

    <!-- 3. MCP -->
    <section aria-labelledby="mcp-h">
      <h2 id="mcp-h">3. MCP</h2>
      <ul class="cards">
        <li>
          <a :href="mcp.href" target="_blank" rel="noopener">{{ mcp.name }}</a>
          <span class="note">Runs Axe checks via the model during a PR.</span>
        </li>
      </ul>
    </section>

    <!-- 4. ExPrep Dev -->
    <section aria-labelledby="exprep-h">
      <h2 id="exprep-h">4. ExPrep Dev</h2>
      <p>
        A detailed <code>.md</code> is provided to the AI for context,
        attempting to cover everything in Playwright’s
        <em>“does not catch”</em> list above.
      </p>
    </section>

    <!-- 5. Realistic flow -->
    <section aria-labelledby="flow-h">
      <h2 id="flow-h">5. Realistic flow</h2>

      <div class="flow-grid">
        <article>
          <h3>Adding a feature to an existing screen</h3>
          <ol>
            <li>
              <strong>Manual testing</strong> — review with the Chrome
              extension; verify there are no errors or warnings.
              <em>(checkable item in the PR template)</em>
            </li>
            <li>
              <strong>PR CI — Playwright</strong> — can run on push, will run in
              the PR.
            </li>
            <li><strong>PR CI — MCP</strong> — will run in the PR.</li>
          </ol>
        </article>

        <article>
          <h3>Adding an entirely new screen / layout</h3>
          <ol>
            <li>All of the above, plus:</li>
            <li>
              <strong>One-time review with a screen reader</strong> (or several)
              for structure, meaning and reading order.
            </li>
          </ol>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.flow {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  line-height: 1.55;
}

.intro p {
  max-width: 48rem;
  color: #374151;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
h2 {
  margin-top: 2.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.35rem;
}
h3 {
  margin-top: 1.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
h4 {
  margin: 0;
  font-size: 1.05rem;
}

.muted {
  color: #6b7280;
  font-weight: 400;
}

.rules-link {
  margin-left: auto;
  font-size: 0.85rem;
  font-weight: 400;
}

.rule-list {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.rule {
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  padding: 1rem 1.1rem;
  background: #fafafa;
}

.rule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.rule-head code {
  background: #eef2ff;
  color: #3730a3;
  padding: 0.1rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.85rem;
}

.example {
  margin: 0.6rem 0 0.9rem;
  color: #374151;
}

.shots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.shot {
  margin: 0;
}

/* Real screenshots: fill the column, keep their own aspect ratio — dimensions
   don't need to match a target, just capture ~900px wide for a crisp 2x. */
.shot-img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 9rem;
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
  background: repeating-linear-gradient(
    45deg,
    #f8fafc,
    #f8fafc 10px,
    #f1f5f9 10px,
    #f1f5f9 20px
  );
  color: #64748b;
}

.placeholder-icon {
  font-size: 1.6rem;
}
.placeholder-text {
  font-size: 0.85rem;
  font-weight: 600;
}

figcaption {
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
  text-align: center;
}

figcaption code {
  font-size: 0.75rem;
}

.plain {
  padding-left: 1.2rem;
  color: #374151;
}
.plain li {
  margin: 0.3rem 0;
}

.cards {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: grid;
  gap: 0.6rem;
}

.cards li {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cards .note {
  color: #6b7280;
  font-size: 0.88rem;
}

.theory {
  margin-top: 1rem;
  padding: 0.75rem 0.9rem;
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 0.35rem;
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.flow-grid article {
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  padding: 1rem 1.2rem;
}

.flow-grid h3 {
  margin-top: 0;
  display: block;
}
.flow-grid li {
  margin: 0.4rem 0;
}

@media (max-width: 32rem) {
  .shots {
    grid-template-columns: 1fr;
  }
}
</style>
