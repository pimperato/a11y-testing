# Accessibility flow screenshots

The `/flow` page (`app/pages/flow.vue`) shows a placeholder for every Axe rule,
two per rule. Drop the real captures here using this exact naming:

```
<rule-id>-console.png   # the error in the browser console / axe DevTools
<rule-id>-cicd.png      # the same failure in the CI/CD pipeline (Playwright run)
```

Example: `page-has-heading-one-console.png`, `page-has-heading-one-cicd.png`.

Once a file exists, swap the placeholder `<div class="placeholder">` in `flow.vue`
for an `<img :src="shotPath(rule.id, cap.key)" :alt="...">`.

Rule ids in use: page-has-heading-one, heading-order, aria-roles,
aria-valid-attr-value, label, button-name, link-name, image-alt, document-title,
html-has-lang, color-contrast, duplicate-id, iframe-title, region.
