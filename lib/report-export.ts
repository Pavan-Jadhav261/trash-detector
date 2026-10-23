import type { SimulationSummary, StoredReport } from '@/types/waste'

function escapeCsv(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildCsvRows(summary: SimulationSummary): (string | number)[][] {
  const header = [
    'Class ID',
    'Category',
    'Detected Count',
    'Percentage (%)',
    'Assumed Weight per Object (g)',
    'Estimated Total Weight (g)',
    'PICK',
    'REJECT',
    'REVIEW',
  ]
  const rows = summary.categories.map((c) => [
    c.category.id,
    c.category.name,
    c.count,
    c.percentage.toFixed(1),
    c.weightPerObject.toFixed(1),
    c.totalWeight.toFixed(1),
    c.pick,
    c.reject,
    c.review,
  ])
  const total = [
    'Total',
    'All categories',
    summary.totalObjects,
    summary.totalObjects > 0 ? '100.0' : '0.0',
    '',
    summary.totalWeight.toFixed(1),
    summary.pickCount,
    summary.rejectCount,
    summary.reviewCount,
  ]
  return [header, ...rows, total]
}

export function buildCsv(summary: SimulationSummary, report: StoredReport): string {
  const meta: (string | number)[][] = [
    ['EcoSort AI — Simulated Detection Run (frontend demonstration, no real model inference)'],
    ['Source video', report.video.fileName],
    ['Dataset seed', report.dataset.seed],
    ['Confidence threshold', report.config.confidenceThreshold.toFixed(2)],
    ['Simulated recovery rate (%)', summary.recoveryRate === null ? 'n/a' : summary.recoveryRate.toFixed(1)],
    ['Simulated purity (%)', summary.purity === null ? 'n/a' : summary.purity.toFixed(1)],
    [],
  ]
  return [...meta, ...buildCsvRows(summary)].map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
