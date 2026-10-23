'use client'

import { RotateCcw } from 'lucide-react'
import { BarList } from '@/components/analysis/bar-list'
import { CategorySwatch } from '@/components/shared/category-icon'
import { Button, Card, InfoNote, SectionHeader } from '@/components/shared/primitives'
import { formatWeight } from '@/lib/format'
import type { ClassId, SimulationSummary } from '@/types/waste'

interface WeightSectionProps {
  summary: SimulationSummary
  onWeightChange?: (id: ClassId, grams: number) => void
  onResetWeights?: () => void
}

export function WeightSection({ summary, onWeightChange, onResetWeights }: WeightSectionProps) {
  const editable = Boolean(onWeightChange)
  return (
    <section aria-labelledby="weight-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="weight-heading"
        eyebrow="Section G"
        title="Estimated Material Weight"
        description="Weight estimates are derived from representative item-level assumptions. Actual object weights vary by size, material, condition, and moisture content."
        action={
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground">Estimated total weight</p>
            <p className="font-mono text-2xl font-semibold tabular-nums">{formatWeight(summary.totalWeight)}</p>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Weight distribution</h3>
          <p className="mt-1 mb-5 text-[12.5px] text-muted-foreground">Estimated weight by category</p>
          <BarList
            label="Estimated weight by category"
            items={summary.categories.map((c) => ({
              key: c.category.id,
              label: c.category.name,
              color: c.category.color,
              value: c.totalWeight,
              display: formatWeight(c.totalWeight),
            }))}
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div>
              <h3 className="text-sm font-semibold">Weight breakdown</h3>
              {editable && <p className="text-[12px] text-muted-foreground">Assumed weights are editable estimation inputs.</p>}
            </div>
            {onResetWeights && (
              <Button variant="ghost" size="sm" onClick={onResetWeights}>
                <RotateCcw />
                Reset to midpoints
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <caption className="sr-only">Estimated weight breakdown by class</caption>
              <thead>
                <tr className="border-b border-border text-left text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th scope="col" className="px-5 py-2.5 font-mono font-medium">Class ID</th>
                  <th scope="col" className="px-3 py-2.5 font-mono font-medium">Category</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-mono font-medium">Objects</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-mono font-medium">Weight / object</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-mono font-medium">Estimated total</th>
                </tr>
              </thead>
              <tbody>
                {summary.categories.map((c) => (
                  <tr key={c.category.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-2.5 font-mono tabular-nums">{c.category.id}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <CategorySwatch color={c.category.color} />
                        <span>
                          {c.category.name}
                          <span className="block text-[11.5px] text-muted-foreground">
                            {'→ '}
                            {c.category.representativeItem}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">{c.count}</td>
                    <td className="px-3 py-2.5 text-right">
                      {editable ? (
                        <label className="inline-flex items-center gap-1.5">
                          <span className="sr-only">Assumed weight per {c.category.name} object in grams</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0.1}
                            max={5000}
                            step={0.5}
                            value={c.weightPerObject}
                            onChange={(event) => {
                              const value = Number.parseFloat(event.target.value)
                              if (Number.isFinite(value) && value >= 0) onWeightChange?.(c.category.id, Math.min(5000, value))
                            }}
                            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-right font-mono text-[12.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <span className="font-mono text-[12px] text-muted-foreground">g</span>
                        </label>
                      ) : (
                        <span className="font-mono tabular-nums">{formatWeight(c.weightPerObject)}</span>
                      )}
                      <span className="mt-0.5 block font-mono text-[10.5px] text-muted-foreground">
                        range {c.category.minWeightGrams}–{c.category.maxWeightGrams} g
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono font-medium tabular-nums">{formatWeight(c.totalWeight)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-secondary/50">
                  <th scope="row" colSpan={2} className="px-5 py-2.5 text-left font-medium">
                    Total
                  </th>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{summary.totalObjects}</td>
                  <td />
                  <td className="px-5 py-2.5 text-right font-mono font-semibold tabular-nums">{formatWeight(summary.totalWeight)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      <InfoNote>
        These values are estimates based on representative item weights. Computer vision alone cannot establish the actual mass of
        objects from ordinary video. The class-to-item mapping (e.g. Metal → Aluminium can) is a configurable estimation assumption,
        not an identification of each object&apos;s exact physical form.
      </InfoNote>
    </section>
  )
}
