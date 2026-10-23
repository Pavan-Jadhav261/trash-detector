import Link from 'next/link'
import { Badge } from '@/components/shared/primitives'
import { cn } from '@/lib/utils'

export type SimulatorStatus = 'Ready' | 'Processing' | 'Completed'

export function SimulatorHeader({ status }: { status: SimulatorStatus }) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <li>
              <Link href="/" className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Simulator
            </li>
          </ol>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-[32px] md:leading-tight">Waste Sorting Simulator</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
          Upload a waste-stream video to run object detection, material classification, and recovery performance analysis.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="accent">Frontend Demo</Badge>
        <span
          role="status"
          className="inline-flex h-6 items-center gap-2 rounded-sm border border-border bg-card px-2 font-mono text-[10.5px] font-medium tracking-wider uppercase"
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              status === 'Ready' && 'bg-muted-foreground',
              status === 'Processing' && 'animate-pulse bg-warning',
              status === 'Completed' && 'bg-success',
            )}
          />
          {status}
        </span>
      </div>
    </header>
  )
}
