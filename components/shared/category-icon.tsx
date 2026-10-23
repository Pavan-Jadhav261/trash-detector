import { Cylinder, GlassWater, Milk, Newspaper, Package, Trash2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryKey, WasteCategory } from '@/types/waste'

const ICONS: Record<CategoryKey, LucideIcon> = {
  metal: Cylinder,
  plastic: Milk,
  cardboard: Package,
  glass: GlassWater,
  trash: Trash2,
  paper: Newspaper,
}

export function CategoryIcon({
  category,
  className,
  size = 'md',
}: {
  category: WasteCategory
  className?: string
  size?: 'sm' | 'md'
}) {
  const Icon = ICONS[category.key]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md',
        size === 'sm' ? 'size-7 [&_svg]:size-3.5' : 'size-9 [&_svg]:size-[18px]',
        className,
      )}
      style={{ backgroundColor: `${category.color}1A`, color: category.color }}
    >
      <Icon strokeWidth={1.75} />
    </span>
  )
}

export function CategorySwatch({ color, className }: { color: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-block size-2.5 shrink-0 rounded-[2px]', className)} style={{ backgroundColor: color }} />
  )
}
