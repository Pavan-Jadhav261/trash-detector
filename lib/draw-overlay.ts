import { getActiveBoxes } from '@/lib/simulation-engine'
import { getCategory } from '@/lib/waste-categories'
import type { SortedDetection, SortingAction } from '@/types/waste'

const ACTION_FILL: Record<SortingAction, string> = {
  PICK: '#4F7A5B',
  REJECT: '#B2492F',
  REVIEW: '#B07A32',
}

interface DrawOptions {
  cssWidth: number
  cssHeight: number
  videoWidth: number
  videoHeight: number
  time: number
  detections: SortedDetection[]
  highlightedId: string | null
  visible: boolean
}

/** The displayed video rect inside an object-contain container. */
export function containRect(cssWidth: number, cssHeight: number, videoWidth: number, videoHeight: number) {
  if (!videoWidth || !videoHeight) return { x: 0, y: 0, width: cssWidth, height: cssHeight }
  const scale = Math.min(cssWidth / videoWidth, cssHeight / videoHeight)
  const width = videoWidth * scale
  const height = videoHeight * scale
  return { x: (cssWidth - width) / 2, y: (cssHeight - height) / 2, width, height }
}

export function drawDetectionOverlay(ctx: CanvasRenderingContext2D, options: DrawOptions) {
  const { cssWidth, cssHeight, videoWidth, videoHeight, time, detections, highlightedId, visible } = options
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  if (!visible) return

  const rect = containRect(cssWidth, cssHeight, videoWidth, videoHeight)
  const compact = rect.width < 420
  const fontSize = compact ? 9.5 : 11

  const lineX = rect.x + rect.width * 0.5
  ctx.save()
  ctx.setLineDash([4, 5])
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(lineX, rect.y + 8)
  ctx.lineTo(lineX, rect.y + rect.height - 8)
  ctx.stroke()
  ctx.restore()

  if (!compact) {
    ctx.font = `500 9px ui-monospace, SFMono-Regular, Menlo, monospace`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.textBaseline = 'top'
    ctx.fillText('DECISION LINE', lineX + 6, rect.y + 10)
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.width, rect.height)
  ctx.clip()

  const boxes = getActiveBoxes(detections, time)
  for (const box of boxes) {
    const detection = box.detection as SortedDetection
    const category = getCategory(detection.classId)
    const x = rect.x + box.x * rect.width
    const y = rect.y + box.y * rect.height
    const w = box.width * rect.width
    const h = box.height * rect.height
    const highlighted = detection.id === highlightedId

    if (highlighted) {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'
      ctx.lineWidth = 5
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2)
    }
    ctx.strokeStyle = category.color
    ctx.lineWidth = highlighted ? 3 : 2
    ctx.strokeRect(x, y, w, h)

    const label = `${category.name.toUpperCase()} ${detection.confidence.toFixed(2)}`
    ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
    const textWidth = ctx.measureText(label).width
    const labelHeight = fontSize + 7
    const labelY = y - labelHeight >= rect.y ? y - labelHeight : y
    ctx.fillStyle = category.color
    ctx.fillRect(x - (highlighted ? 1.5 : 1), labelY, textWidth + 10, labelHeight)
    ctx.fillStyle = '#FFFFFF'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + 4, labelY + labelHeight / 2 + 0.5)

    if (box.crossed) {
      const action = detection.action
      ctx.font = `600 ${fontSize - 1}px ui-monospace, SFMono-Regular, Menlo, monospace`
      const actionWidth = ctx.measureText(action).width + 10
      const actionHeight = fontSize + 5
      const ay = y + h + actionHeight <= rect.y + rect.height ? y + h : y + h - actionHeight
      ctx.fillStyle = 'rgba(20,19,17,0.82)'
      ctx.fillRect(x, ay, actionWidth + 8, actionHeight)
      ctx.fillStyle = ACTION_FILL[action]
      ctx.fillRect(x + 4, ay + actionHeight / 2 - 2.5, 5, 5)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(action, x + 12, ay + actionHeight / 2 + 0.5)
    }
  }
  ctx.restore()
}
