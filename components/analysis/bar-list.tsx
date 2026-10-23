import { CategorySwatch } from '@/components/shared/category-icon'

export interface BarListItem {
  key: string | number
  label: string
  color: string
  value: number
  display: string
  prefix?: string
}

export function BarList({ items, label }: { items: BarListItem[]; label: string }) {
  const max = Math.max(0, ...items.map((item) => item.value))
  return (
    <ul aria-label={label} className="flex flex-col gap-3">
      {items.map((item) => {
        const width = max > 0 ? (item.value / max) * 100 : 0
        return (
          <li key={item.key} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2">
              <CategorySwatch color={item.color} />
              {item.prefix && <span className="font-mono text-[11px] text-muted-foreground">{item.prefix}</span>}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="h-2 overflow-hidden rounded-[2px] bg-secondary" aria-hidden="true">
              <span
                className="block h-full rounded-[2px] transition-[width] duration-500"
                style={{ width: `${width}%`, backgroundColor: item.color }}
              />
            </span>
            <span className="min-w-16 text-right font-mono text-[12px] tabular-nums">{item.display}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function MeterBar({ value, color = 'var(--primary)', label }: { value: number | null; color?: string; label: string }) {
  const width = value === null ? 0 : Math.max(0, Math.min(100, value))
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value === null ? undefined : Math.round(value)}
      className="h-1.5 overflow-hidden rounded-[2px] bg-secondary"
    >
      <div className="h-full rounded-[2px] transition-[width] duration-500" style={{ width: `${width}%`, backgroundColor: color }} />
    </div>
  )
}
