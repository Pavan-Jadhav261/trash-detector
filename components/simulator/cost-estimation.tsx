'use client'

import { IndianRupee } from 'lucide-react'
import { CategorySwatch } from '@/components/shared/category-icon'
import { Badge, Card, SectionHeader } from '@/components/shared/primitives'
import type { CategoryKey, SimulationSummary } from '@/types/waste'

/** Market scrap prices in ₹ per kg for each recyclable waste class. */
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

export function CostEstimation({ summary }: { summary: SimulationSummary }) {
  const rows = summary.categories
    .filter((c) => c.count > 0)
    .map((c) => {
      const pricing = SCRAP_PRICES[c.category.key]
      const weightKg = c.totalWeight / 1000 // convert grams → kg
      const estimatedValue = weightKg * pricing.price
      const minValue = weightKg * pricing.min
      const maxValue = weightKg * pricing.max
      return { ...c, pricing, weightKg, estimatedValue, minValue, maxValue }
    })

  const totalEstimated = rows.reduce((sum, r) => sum + r.estimatedValue, 0)
  const totalMin = rows.reduce((sum, r) => sum + r.minValue, 0)
  const totalMax = rows.reduce((sum, r) => sum + r.maxValue, 0)

  return (
    <section aria-labelledby="cost-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="cost-heading"
        eyebrow="Section J"
        title="Cost Estimation"
        action={<Badge tone="accent">Market Prices</Badge>}
        description="Estimated scrap value of detected materials based on current Indian market rates (₹/kg). Prices are approximate and may vary by region and material quality."
      />

      {/* Summary hero card */}
      <Card className="flex flex-col items-center gap-2 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IndianRupee className="size-5" />
          </span>
          <div>
            <p className="text-[13px] text-muted-foreground">Total Estimated Value</p>
            <p className="font-mono text-3xl font-semibold tabular-nums">{formatRupee(totalEstimated)}</p>
          </div>
        </div>
        <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
          Range: {formatRupee(totalMin)} – {formatRupee(totalMax)}
        </p>
      </Card>

      {/* Per-category breakdown table */}
      <Card className="overflow-hidden">
        <h3 className="border-b border-border px-5 py-3 text-sm font-semibold">Per-category price breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <caption className="sr-only">Estimated scrap value by waste category</caption>
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="px-5 py-2 font-medium">Category</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Count</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Weight (kg)</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Price (₹/kg)</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Range (₹/kg)</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.category.id} className="border-b border-border last:border-0">
                  <th scope="row" className="px-5 py-2.5 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <CategorySwatch color={row.category.color} />
                      {row.category.name}
                    </span>
                  </th>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{row.count}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{row.weightKg.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">₹{row.pricing.price}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    ₹{row.pricing.min}–₹{row.pricing.max}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono font-medium tabular-nums">{formatRupee(row.estimatedValue)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                    No recyclable materials detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-5 py-2.5 text-[12.5px]">
          <span className="text-muted-foreground">Total estimated scrap value</span>
          <span className="font-mono font-semibold text-foreground tabular-nums">{formatRupee(totalEstimated)}</span>
        </div>
      </Card>
    </section>
  )
}
