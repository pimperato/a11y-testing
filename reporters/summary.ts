import { appendFileSync } from 'node:fs'
import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter'

interface Row {
  page: string
  status: TestResult['status']
  issue: string
}

// ANSI escape = 0x1b; build via constructor so there's no literal control char.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
const stripAnsi = (s: string) => s.replace(ANSI, '')

// Pull the human-readable first line out of the failure (our spec sets the
// expect() message to e.g. "There is a missing h1 tag!").
function firstIssue(result: TestResult): string {
  const raw = result.errors[0]?.message ?? ''
  const line = stripAnsi(raw).split('\n').find((l) => l.trim()) ?? ''
  return line.replace(/^Error:\s*/, '').trim()
}

const icon = (s: TestResult['status']) =>
  s === 'passed' ? '✅' : s === 'skipped' ? '⏭️' : '❌'

/** One consolidated table instead of per-test error dumps. */
export default class SummaryReporter implements Reporter {
  private rows: Row[] = []

  onTestEnd(test: TestCase, result: TestResult) {
    this.rows.push({
      // strip the "a11y: " prefix so the column is just the route
      page: test.title.replace(/^a11y:\s*/, ''),
      status: result.status,
      issue: result.status === 'passed' ? '' : firstIssue(result),
    })
  }

  onEnd(_result: FullResult) {
    const rows = [...this.rows].sort(
      (a, b) =>
        Number(a.status === 'passed') - Number(b.status === 'passed') ||
        a.page.localeCompare(b.page),
    )
    const failed = rows.filter((r) => r.status !== 'passed' && r.status !== 'skipped').length
    const passed = rows.filter((r) => r.status === 'passed').length
    const pad = Math.max(...rows.map((r) => r.page.length), 4)

    // --- console ---
    console.log(`\n♿ Accessibility summary — ${failed} failed · ${passed} passed`)
    for (const r of rows) {
      console.log(`  ${icon(r.status)} ${r.page.padEnd(pad)}  ${r.issue || '—'}`)
    }
    console.log('')

    // --- GitHub Actions job summary (the panel on the run page) ---
    const file = process.env.GITHUB_STEP_SUMMARY
    if (file) {
      const md = [
        '## ♿ Accessibility summary',
        '',
        `**${failed} failed · ${passed} passed**`,
        '',
        '| Page | Result | Issue |',
        '| --- | :---: | --- |',
        ...rows.map((r) => `| \`${r.page}\` | ${icon(r.status)} | ${r.issue || '—'} |`),
        '',
      ].join('\n')
      appendFileSync(file, md)
    }
  }
}
