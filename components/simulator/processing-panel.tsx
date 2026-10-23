import { Check, Loader2 } from 'lucide-react'
import { Badge, Card } from '@/components/shared/primitives'
import { cn } from '@/lib/utils'

export const PROCESSING_STEPS = [
  { label: 'Preparing video', duration: 550 },
  { label: 'Loading trained YOLO detector', duration: 700 },
  { label: 'Analyzing video frames', duration: 1400 },
  { label: 'Tracking detected objects', duration: 900 },
  { label: 'Preparing material analytics', duration: 650 },
] as const

export function ProcessingPanel({ step, fileName }: { step: number; fileName: string }) {
  const total = PROCESSING_STEPS.length
  const modelRunning = step >= total - 1
  const current = PROCESSING_STEPS[Math.min(step, total - 1)]
  const target = modelRunning ? 90 : ((step + 1) / total) * 90

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="accent">YOLO Detection Run</Badge>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">{modelRunning ? 'Detecting objects with YOLO…' : `${current.label}…`}</h2>
          <p className="mt-1 truncate text-[13px] text-muted-foreground">
          {fileName} · running the locally trained best.pt model. Keep this page open; long videos can take a few minutes.
          </p>
        </div>
        <span className="font-mono text-2xl font-semibold tabular-nums" aria-hidden="true">
          {Math.round(modelRunning ? 90 : (step / total) * 90)}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Simulation progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={modelRunning ? 90 : Math.round((step / total) * 90)}
        aria-valuetext={modelRunning ? 'Detecting objects with YOLO' : current.label}
        className="mt-6 h-1.5 overflow-hidden rounded-[2px] bg-secondary"
      >
        <div
          className="h-full rounded-[2px] bg-primary transition-[width] ease-linear"
          style={{ width: `${target}%`, transitionDuration: `${modelRunning ? 200 : current.duration}ms` }}
        />
      </div>

      <ol className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {PROCESSING_STEPS.map((item, index) => {
          const state = index < step ? 'done' : index === step ? 'active' : 'pending'
          return (
            <li
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px]',
                state === 'done' && 'border-border text-foreground',
                state === 'active' && 'border-primary/40 bg-accent text-accent-foreground',
                state === 'pending' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' && <Check className="size-3.5 shrink-0 text-success" />}
              {state === 'active' && <Loader2 className="size-3.5 shrink-0 animate-spin" />}
              {state === 'pending' && <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full border border-border" />}
              <span className="leading-tight">{item.label}</span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
