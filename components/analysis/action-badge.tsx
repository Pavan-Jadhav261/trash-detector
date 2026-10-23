import { Badge } from '@/components/shared/primitives'
import type { SortingAction } from '@/types/waste'

const TONES = { PICK: 'success', REJECT: 'danger', REVIEW: 'warning' } as const

export const ACTION_COLORS: Record<SortingAction, string> = {
  PICK: '#4F7A5B',
  REJECT: '#B2492F',
  REVIEW: '#B07A32',
}

export function ActionBadge({ action }: { action: SortingAction }) {
  return <Badge tone={TONES[action]}>{action}</Badge>
}
