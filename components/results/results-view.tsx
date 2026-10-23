'use client'

import { AlertTriangle, ArrowLeft, Download, FileSearch, Printer } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { ActionBadge } from '@/components/analysis/action-badge'
import { DistributionChart } from '@/components/results/distribution-chart'
import { ResultsTable } from '@/components/results/results-table'
import { Badge, Button, Card, InfoNote, LinkButton, SectionHeader } from '@/components/shared/primitives'
import { computeSummary } from '@/lib/analytics'
import { formatPercent, formatWeight } from '@/lib/format'
import { buildCsv, downloadCsv } from '@/lib/report-export'
import { getVideoSession, useStoredReport } from '@/lib/storage'
import type { SimulationSummary, StoredReport } from '@/types/waste'

const LIMITATIONS =
  'This is a frontend-only simulation. Detection boxes, confidence scores, and sorting outcomes are generated from demonstration data. No real YOLO inference is performed in this version. Weight calculations use configurable representative item-weight assumptions and do not measure actual physical mass.'

export function ResultsView() {
  const { report, hydrated } = useStoredReport()
  if (!hydrated) return <div aria-busy="true" aria-label="Loading results" className="h-96 animate-pulse rounded-lg bg-secondary" />
  if (!report) return <EmptyResults />
  return <ResultsReport report={report} />
}

function EmptyResults() {
  return (
    <Card className="mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-16 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <FileSearch className="size-5" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">No simulation results yet</h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          Results are generated in your browser after you upload a video and run a detection simulation. Nothing has been run in
          this session.
        </p>
      </div>
      <LinkButton href="/simulator">Go to Simulator</LinkButton>
    </Card>
  )
}

function ResultsReport({ report }: { report: StoredReport }) {
  const summary = useMemo(() => computeSummary(report.dataset.detections, report.config), [report])
  const session = getVideoSession()
  const videoAvailable = !!session && session.file.name === report.video.fileName && session.file.size === report.video.fileSize

  const handleExport = () => {
    const safeName = report.video.fileName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 40) || 'video'
    downloadCsv(`ecosort-simulation-${safeName}.csv`, buildCsv(summary, report))
    toast.success('Summary exported', { description: 'CSV downloaded with the values shown on this page.' })
  }

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <header className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Completed</Badge>
              <Badge tone="warning">Simulated Detection Run</Badge>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance md:text-[32px] md:leading-tight">Simulation Results</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
              A consolidated overview of material classification, estimated weight, and simulated sorting performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <LinkButton href="/simulator" variant="secondary">
              <ArrowLeft />
              Back to Simulator
            </LinkButton>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer />
              Print
            </Button>
            <Button onClick={handleExport}>
              <Download />
              Export Summary
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] md:grid-cols-4">
          <MetaItem label="Source video" value={report.video.fileName} />
          <MetaItem label="Sampled frames (simulated)" value={`${report.dataset.sampledFrames} @ ${report.dataset.samplingFps} fps`} />
          <MetaItem label="Detected objects" value={String(summary.totalObjects)} />
          <MetaItem label="Estimated total weight" value={formatWeight(summary.totalWeight)} />
        </dl>
        {!videoAvailable && (
          <p role="status" className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-[13px]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            The report was restored from this browser session, but the local video is no longer in memory. Upload it again in the
            simulator to replay the detection overlay.
          </p>
        )}
      </header>

      <SummaryMetrics summary={summary} />

      <section aria-labelledby="distribution-heading" className="flex flex-col gap-6">
        <SectionHeader id="distribution-heading" eyebrow="Distribution" title="Category and weight distribution" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DistributionChart
            id="category-chart"
            title="Objects by category"
            description="Number of simulated detections per material class."
            categories={summary.categories}
            value={(c) => c.count}
            format={(v) => String(Math.round(v))}
          />
          <DistributionChart
            id="weight-chart"
            title="Estimated weight by category"
            description="Object count × assumed weight per object, in grams."
            categories={summary.categories}
            value={(c) => Math.round(c.totalWeight)}
            format={(v) => `${Math.round(v)} g`}
          />
        </div>
      </section>

      <section aria-labelledby="table-heading" className="flex flex-col gap-6">
        <SectionHeader
          id="table-heading"
          eyebrow="Detail"
          title="Detailed classification table"
          description="All six categories are listed, including those with no detections."
        />
        <ResultsTable summary={summary} />
      </section>

      <SortingSummary summary={summary} threshold={report.config.confidenceThreshold} />

      <section aria-labelledby="limitations-heading" className="flex flex-col gap-4">
        <h2 id="limitations-heading" className="text-base font-semibold">
          Limitations and assumptions
        </h2>
        <InfoNote>{LIMITATIONS}</InfoNote>
      </section>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-mono tabular-nums" title={value}>
        {value}
      </dd>
    </div>
  )
}

function SummaryMetrics({ summary }: { summary: SimulationSummary }) {
  const metrics = [
    { label: 'Total detections', value: String(summary.totalObjects), hint: 'Unique simulated objects' },
    { label: 'Estimated total weight', value: formatWeight(summary.totalWeight), hint: 'Sum of category weights' },
    { label: 'Simulated recovery rate', value: formatPercent(summary.recoveryRate), hint: 'PICK ÷ total detections' },
    { label: 'Simulated purity', value: formatPercent(summary.purity), hint: 'Correct PICKs ÷ all PICKs' },
  ]
  return (
    <section aria-labelledby="metrics-heading" className="flex flex-col gap-6">
      <SectionHeader id="metrics-heading" eyebrow="Summary" title="Summary metrics" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <li key={m.label}>
            <Card className="flex h-full flex-col gap-4 p-5">
              <p className="text-[13px] text-muted-foreground">{m.label}</p>
              <div>
                <p className="font-mono text-3xl font-semibold tabular-nums">{m.value}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{m.hint}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SortingSummary({ summary, threshold }: { summary: SimulationSummary; threshold: number }) {
  const rows = [
    { action: 'PICK' as const, count: summary.pickCount, rule: `Recovery-eligible class with confidence ≥ ${threshold.toFixed(2)}` },
    { action: 'REJECT' as const, count: summary.rejectCount, rule: `Non-eligible class with confidence ≥ ${threshold.toFixed(2)}` },
    { action: 'REVIEW' as const, count: summary.reviewCount, rule: `Any class with confidence < ${threshold.toFixed(2)}` },
  ]
  return (
    <section aria-labelledby="sorting-summary-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="sorting-summary-heading"
        eyebrow="Sorting"
        title="Sorting outcome summary"
        description="Decisions are applied by a simple, configurable rule set. Threshold and eligible classes can be adjusted in the simulator."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.action} className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <ActionBadge action={row.action} />
              <span className="font-mono text-2xl font-semibold tabular-nums">{row.count}</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">{row.rule}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
