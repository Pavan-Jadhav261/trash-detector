'use client'

import { ActionBadge } from '@/components/analysis/action-badge'
import { CategorySwatch } from '@/components/shared/category-icon'
import { Card, InfoNote, SectionHeader } from '@/components/shared/primitives'
import { formatWeight } from '@/lib/format'
import type { ClassId, SimulationConfig, SimulationSummary } from '@/types/waste'

interface SortingDecisionsProps {
  summary: SimulationSummary
  config: SimulationConfig
  onThresholdChange: (value: number) => void
  onEligibilityChange: (id: ClassId, eligible: boolean) => void
}

export function SortingDecisions({ summary, config, onThresholdChange, onEligibilityChange }: SortingDecisionsProps) {
  const tiles = [
    { action: 'PICK' as const, count: summary.pickCount, text: 'Material selected for recovery.' },
    { action: 'REJECT' as const, count: summary.rejectCount, text: 'Item routed to residual waste.' },
    { action: 'REVIEW' as const, count: summary.reviewCount, text: 'Uncertain classification requiring inspection.' },
  ]

  return (
    <section aria-labelledby="sorting-heading" className="flex h-full flex-col gap-6">
      <SectionHeader
        id="sorting-heading"
        eyebrow="Section I"
        title="Sorting Decisions"
        description="How detected objects translate into conveyor sorting decisions. Rules are based on the current confidence threshold and eligibility settings."
      />

      <ul className="grid grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <li key={tile.action}>
            <Card className="flex h-full flex-col gap-3 p-4">
              <ActionBadge action={tile.action} />
              <p className="font-mono text-2xl font-semibold tabular-nums">{tile.count}</p>
              <p className="text-[12px] leading-snug text-muted-foreground">{tile.text}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="flex flex-col gap-5 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="confidence-threshold" className="text-sm font-semibold">
              Confidence threshold
            </label>
            <span className="font-mono text-sm tabular-nums">≥ {config.confidenceThreshold.toFixed(2)}</span>
          </div>
          <input
            id="confidence-threshold"
            type="range"
            min={0.5}
            max={0.95}
            step={0.01}
            value={config.confidenceThreshold}
            onChange={(event) => onThresholdChange(Number(event.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer accent-primary"
          />
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            At or above the threshold, eligible classes are PICKed and others REJECTed. Below it, items are sent to REVIEW.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Recovery-eligible classes</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summary.categories.map(({ category }) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="checkbox"
                  checked={config.recoveryEligible[category.id]}
                  onChange={(event) => onEligibilityChange(category.id, event.target.checked)}
                  className="size-3.5 accent-primary"
                />
                <CategorySwatch color={category.color} />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="overflow-hidden">
        <h3 className="border-b border-border px-5 py-3 text-sm font-semibold">Recovery routing summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[13px]">
            <caption className="sr-only">Simulated sorting outcomes by category</caption>
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="px-5 py-2 font-medium">Category</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Pick</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Reject</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">Review</th>
              </tr>
            </thead>
            <tbody>
              {summary.categories.map((c) => (
                <tr key={c.category.id} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-2 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <CategorySwatch color={c.category.color} />
                      {c.category.name}
                    </span>
                  </th>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{c.pick}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{c.reject}</td>
                  <td className="px-5 py-2 text-right font-mono tabular-nums">{c.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border bg-secondary/50 px-5 py-2.5 text-[12.5px] text-muted-foreground">
          Recovered stream (estimated): <span className="font-mono text-foreground tabular-nums">{formatWeight(summary.recoveredWeight)}</span>
        </p>
      </Card>

      <InfoNote>
        Classification confidence is not the same as material purity or recycling suitability. A confident &ldquo;Plastic&rdquo;
        detection says nothing about polymer type, contamination, or whether the item can be recycled locally.
      </InfoNote>
    </section>
  )
}
