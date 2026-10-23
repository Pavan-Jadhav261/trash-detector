'use client'

import { useState } from 'react'
import { ActionBadge } from '@/components/analysis/action-badge'
import { CategorySwatch } from '@/components/shared/category-icon'
import { Badge, Card, SectionHeader } from '@/components/shared/primitives'
import { formatConfidence, formatTimestamp } from '@/lib/format'
import { getCategory } from '@/lib/waste-categories'
import { cn } from '@/lib/utils'
import type { SortedDetection, SortingAction } from '@/types/waste'

const FILTERS = ['ALL', 'PICK', 'REJECT', 'REVIEW'] as const
type Filter = (typeof FILTERS)[number]

interface DetectionTimelineProps {
  detections: SortedDetection[]
  selectedId: string | null
  onSelect: (detection: SortedDetection) => void
}

export function DetectionTimeline({ detections, selectedId, onSelect }: DetectionTimelineProps) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const visible = filter === 'ALL' ? detections : detections.filter((d) => d.action === (filter as SortingAction))

  return (
    <section aria-labelledby="timeline-heading" className="flex h-full flex-col gap-6">
      <SectionHeader
        id="timeline-heading"
        eyebrow="Section H"
        title="Detection Timeline"
        description="Simulated events at the moment each object crosses the decision line. Select an event to seek both videos."
        action={<Badge tone="warning">Simulated</Badge>}
      />
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div role="radiogroup" aria-label="Filter events by action" className="inline-flex rounded-md border border-border p-0.5">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={filter === item}
                onClick={() => setFilter(item)}
                className={cn(
                  'h-7 rounded-[4px] px-2.5 font-mono text-[11px] tracking-wider outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  filter === item ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">{visible.length} events</span>
        </div>
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No events match this filter.</p>
        ) : (
          <ol className="max-h-[420px] overflow-y-auto">
            {visible.map((detection) => {
              const category = getCategory(detection.classId)
              const selected = detection.id === selectedId
              return (
                <li key={detection.id} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => onSelect(detection)}
                    aria-current={selected ? 'true' : undefined}
                    className={cn(
                      'grid w-full grid-cols-[4.5rem_1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-left text-[13px] outline-none',
                      'hover:bg-secondary/70 focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      selected && 'bg-accent hover:bg-accent',
                    )}
                  >
                    <span className="font-mono text-[12px] tabular-nums">{formatTimestamp(detection.decisionAt)}</span>
                    <span className="flex min-w-0 items-center gap-2">
                      <CategorySwatch color={category.color} />
                      <span className="font-mono text-[11px] text-muted-foreground">{category.id}</span>
                      <span className="truncate">{category.name}</span>
                    </span>
                    <span className="font-mono text-[12px] tabular-nums">{formatConfidence(detection.confidence)}</span>
                    <ActionBadge action={detection.action} />
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </Card>
    </section>
  )
}
