import { CategorySwatch } from '@/components/shared/category-icon'
import { Card } from '@/components/shared/primitives'
import { formatPercent, formatWeight } from '@/lib/format'
import type { SimulationSummary } from '@/types/waste'

export function ResultsTable({ summary }: { summary: SimulationSummary }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px]">
          <caption className="sr-only">Detailed simulated classification results for all six categories</caption>
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="px-5 py-3 font-medium">Class ID</th>
              <th scope="col" className="px-3 py-3 font-medium">Material</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Object Count</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Percentage</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Avg. Assumed Weight</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Est. Total Weight</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Pick / Reject / Review</th>
            </tr>
          </thead>
          <tbody>
            {summary.categories.map((c) => (
              <tr key={c.category.id} className="border-b border-border">
                <td className="px-5 py-3 font-mono tabular-nums">{c.category.id}</td>
                <th scope="row" className="px-3 py-3 text-left font-normal">
                  <span className="flex items-center gap-2">
                    <CategorySwatch color={c.category.color} />
                    {c.category.name}
                  </span>
                </th>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{c.count}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{formatPercent(c.percentage)}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{c.weightPerObject.toFixed(1)} g</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{formatWeight(c.totalWeight)}</td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">
                  {c.pick} / {c.reject} / {c.review}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-secondary/50 font-medium">
              <th scope="row" colSpan={2} className="px-5 py-3 text-left">
                Total
              </th>
              <td className="px-3 py-3 text-right font-mono tabular-nums">{summary.totalObjects}</td>
              <td className="px-3 py-3 text-right font-mono tabular-nums">{summary.totalObjects > 0 ? '100.0%' : '0.0%'}</td>
              <td className="px-3 py-3 text-right text-muted-foreground">—</td>
              <td className="px-3 py-3 text-right font-mono tabular-nums">{formatWeight(summary.totalWeight)}</td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {summary.pickCount} / {summary.rejectCount} / {summary.reviewCount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
