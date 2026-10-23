import { CategoryIcon } from '@/components/shared/category-icon'
import { Card, SectionHeader } from '@/components/shared/primitives'
import { formatPercent, formatWeight } from '@/lib/format'
import type { SimulationSummary } from '@/types/waste'

export function MaterialClassification({ summary }: { summary: SimulationSummary }) {
  const empty = summary.totalObjects === 0
  return (
    <section aria-labelledby="classification-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="classification-heading"
        eyebrow="Section F"
        title="Material Classification"
        description="Simulated object counts for each of the six model classes. Class IDs follow the detector's label mapping."
      />
      {empty && (
        <p className="rounded-md border border-dashed border-border px-4 py-3 text-[13px] text-muted-foreground">
          No objects were detected in this run. All categories show zero values.
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.categories.map((result) => (
          <li key={result.category.id}>
            <Card className="relative flex h-full flex-col gap-4 overflow-hidden p-5">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: result.category.color }} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={result.category} />
                  <div>
                    <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Class {result.category.id}</p>
                    <h3 className="text-[15px] font-semibold">{result.category.name}</h3>
                  </div>
                </div>
                <p className="text-right">
                  <span className="block font-mono text-2xl font-semibold tabular-nums">{result.count}</span>
                  <span className="text-[12px] text-muted-foreground">{result.count === 1 ? 'object' : 'objects'}</span>
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-[2px] bg-secondary" aria-hidden="true">
                <div
                  className="h-full rounded-[2px] transition-[width] duration-500"
                  style={{ width: `${result.percentage}%`, backgroundColor: result.category.color }}
                />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-[12.5px]">
                <div>
                  <dt className="text-muted-foreground">Share of detections</dt>
                  <dd className="font-mono tabular-nums">{empty ? '0.0%' : formatPercent(result.percentage)}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-muted-foreground">Estimated weight</dt>
                  <dd className="font-mono tabular-nums">{formatWeight(result.totalWeight)}</dd>
                </div>
              </dl>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
