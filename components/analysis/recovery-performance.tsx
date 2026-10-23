import { MeterBar } from '@/components/analysis/bar-list'
import { Card, InfoNote, SectionHeader } from '@/components/shared/primitives'
import { formatPercent } from '@/lib/format'
import type { SimulationSummary } from '@/types/waste'

export function RecoveryPerformance({ summary }: { summary: SimulationSummary }) {
  return (
    <section aria-labelledby="recovery-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="recovery-heading"
        eyebrow="Section J · Simulated indicators"
        title="Recovery Performance"
        description="Indicators computed from the simulated sorting decisions above. They illustrate how a sorting line could be evaluated, not how this video would actually perform."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold">Estimated recovery rate</h3>
            <span className="font-mono text-2xl font-semibold tabular-nums">{formatPercent(summary.recoveryRate)}</span>
          </div>
          <MeterBar value={summary.recoveryRate} label="Estimated recovery rate" />
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Objects assigned to recovery (PICK) ÷ total detected objects × 100.
            {summary.recoveryRate === null && ' No detections — the rate is undefined.'}
          </p>
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold">Simulated material purity</h3>
            <span className="font-mono text-2xl font-semibold tabular-nums">{formatPercent(summary.purity)}</span>
          </div>
          <MeterBar value={summary.purity} color="var(--success)" label="Simulated material purity" />
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            PICK objects whose simulated reference class is recovery-eligible ÷ total PICK objects × 100.
            {summary.purity === null && ' No objects were assigned to recovery — purity is undefined.'}
          </p>
        </Card>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-border rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: 'Recovery-eligible (PICK)', value: summary.pickCount, color: 'var(--success)' },
          { label: 'Rejected (REJECT)', value: summary.rejectCount, color: 'var(--destructive)' },
          { label: 'Uncertain (REVIEW)', value: summary.reviewCount, color: 'var(--warning)' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 px-5 py-4">
            <dt className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </dt>
            <dd className="font-mono text-lg font-semibold tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
      <InfoNote>
        Actual facility-level purity and recovery require ground-truth labels, validated sorting outcomes, and representative sampling.
        The &ldquo;reference class&rdquo; used here is generated with the demonstration data and is not a real label.
      </InfoNote>
    </section>
  )
}
