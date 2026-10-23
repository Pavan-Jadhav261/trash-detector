import { ArrowRight, FileVideo, RefreshCw, RotateCcw } from 'lucide-react'
import { Button, Card, LinkButton } from '@/components/shared/primitives'

interface SimulationActionsProps {
  onRunAgain: () => void
  onReplace: () => void
  onReset: () => void
}

export function SimulationActions({ onRunAgain, onReplace, onReset }: SimulationActionsProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-base font-semibold">Simulation actions</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Results are kept for this browser tab only. Run Again runs the trained detector again on the same video.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger" onClick={onReset}>
          <RotateCcw />
          Reset Simulation
        </Button>
        <Button variant="secondary" onClick={onReplace}>
          <FileVideo />
          Replace Video
        </Button>
        <Button variant="secondary" onClick={onRunAgain}>
          <RefreshCw />
          Run Again
        </Button>
        <LinkButton href="/results">
          View Full Results
          <ArrowRight />
        </LinkButton>
      </div>
    </Card>
  )
}
