import { CategoryIcon } from '@/components/shared/category-icon'
import { Badge, Card, SectionHeader } from '@/components/shared/primitives'
import { formatPercent, formatWeight } from '@/lib/format'
import type { CategoryKey, SimulationSummary } from '@/types/waste'

/** Market scrap prices in ₹ per kg for each waste class. */
const SCRAP_PRICES: Record<CategoryKey, { price: number; min: number; max: number }> = {
  plastic:   { price: 8,  min: 5,  max: 15 },
  glass:     { price: 2,  min: 1,  max: 5  },
  metal:     { price: 30, min: 20, max: 40 },
  paper:     { price: 8,  min: 5,  max: 15 },
  cardboard: { price: 6,  min: 5,  max: 10 },
  trash:     { price: 0,  min: 0,  max: 0  },
}

function formatRupee(value: number): string {
  if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K`
  return `₹${value.toFixed(2)}`
}

export function MaterialClassification({ summary }: { summary: SimulationSummary }) {
  const empty = summary.totalObjects === 0

  // Compute totals for the footer
  const totalEstimated = summary.categories.reduce((sum, c) => {
    const pricing = SCRAP_PRICES[c.category.key]
    return sum + (c.totalWeight / 1000) * pricing.price
  }, 0)
  const totalMin = summary.categories.reduce((sum, c) => {
    const pricing = SCRAP_PRICES[c.category.key]
    return sum + (c.totalWeight / 1000) * pricing.min
  }, 0)
  const totalMax = summary.categories.reduce((sum, c) => {
    const pricing = SCRAP_PRICES[c.category.key]
    return sum + (c.totalWeight / 1000) * pricing.max
  }, 0)

  return (
    <section aria-labelledby="classification-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="classification-heading"
        eyebrow="Section F"
        title="Material Classification"
        action={<Badge tone="accent">Market Prices</Badge>}
        description="Simulated object counts for each of the six model classes. Class IDs follow the detector's label mapping."
      />
      {empty && (
        <p className="rounded-md border border-dashed border-border px-4 py-3 text-[13px] text-muted-foreground">
          No objects were detected in this run. All categories show zero values.
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.categories.map((result) => {
          const pricing = SCRAP_PRICES[result.category.key]
          const weightKg = result.totalWeight / 1000
          const estimatedValue = weightKg * pricing.price
          return (
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
                <dl className="grid grid-cols-2 gap-y-2 text-[12.5px]">
                  <div>
                    <dt className="text-muted-foreground">Share of detections</dt>
                    <dd className="font-mono tabular-nums">{empty ? '0.0%' : formatPercent(result.percentage)}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-muted-foreground">Estimated weight</dt>
                    <dd className="font-mono tabular-nums">{formatWeight(result.totalWeight)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-mono tabular-nums">
                      {pricing.price > 0 ? (
                        <>₹{pricing.price}/kg <span className="text-muted-foreground">(₹{pricing.min}–₹{pricing.max})</span></>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-muted-foreground">Est. value</dt>
                    <dd className="font-mono font-medium tabular-nums" style={{ color: estimatedValue > 0 ? result.category.color : undefined }}>
                      {estimatedValue > 0 ? formatRupee(estimatedValue) : '—'}
                    </dd>
                  </div>
                </dl>
              </Card>
            </li>
          )
        })}
      </ul>

      {/* Total estimated value footer */}
      {!empty && (
        <Card className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground">Total estimated scrap value</p>
            <p className="font-mono text-2xl font-semibold tabular-nums">{formatRupee(totalEstimated)}</p>
          </div>
          <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
            Range: {formatRupee(totalMin)} – {formatRupee(totalMax)}
          </p>
        </Card>
      )}
    </section>
  )
}

