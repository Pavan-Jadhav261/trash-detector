import { Boxes, Layers, Recycle, Scale } from 'lucide-react'
import { Badge, Card, SectionHeader } from '@/components/shared/primitives'
import { formatPercent, formatWeight } from '@/lib/format'
import type { SimulationSummary } from '@/types/waste'

export function DetectionOverview({ summary }: { summary: SimulationSummary | null }) {
  const cards = [
    { label: 'Total Objects Detected', icon: Boxes, value: summary ? String(summary.totalObjects) : '—', hint: 'Unique tracked objects' },
    {
      label: 'Material Categories',
      icon: Layers,
      value: summary ? `${summary.categoriesDetected} / 6` : '—',
      hint: 'Classes with at least one object',
    },
    { label: 'Estimated Total Weight', icon: Scale, value: summary ? formatWeight(summary.totalWeight) : '—', hint: 'Count × representative weight' },
    {
      label: 'Estimated Recovery Rate',
      icon: Recycle,
      value: summary ? formatPercent(summary.recoveryRate, 0) : '—',
      hint: 'PICK ÷ total detections',
    },
  ]

  return (
    <section aria-labelledby="overview-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="overview-heading"
        eyebrow="Section E"
        title="Detection Overview"
        action={summary ? <Badge tone="success">Model results</Badge> : undefined}
        description={
          summary
            ? 'All values are derived from YOLO detections and the current estimation settings.'
            : 'Results appear here after you run object detection.'
        }
      />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Card className="flex h-full flex-col gap-5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-muted-foreground">{card.label}</p>
                <card.icon aria-hidden="true" className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className={summary ? 'font-mono text-3xl font-semibold tabular-nums' : 'font-mono text-3xl text-border'}>{card.value}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{summary ? card.hint : 'Awaiting detection'}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
