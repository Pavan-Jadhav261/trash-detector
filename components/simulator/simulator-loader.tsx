'use client'

import dynamic from 'next/dynamic'

/** The simulator reads in-memory video state and sessionStorage, so it renders on the client only. */
export const SimulatorLoader = dynamic(
  () => import('@/components/simulator/simulator-workspace').then((m) => m.SimulatorWorkspace),
  {
    ssr: false,
    loading: () => (
      <div aria-busy="true" aria-label="Loading simulator" className="flex flex-col gap-8">
        <div className="h-32 animate-pulse rounded-lg bg-secondary" />
        <div className="h-80 animate-pulse rounded-lg bg-secondary" />
      </div>
    ),
  },
)
