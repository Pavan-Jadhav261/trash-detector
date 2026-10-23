'use client'

import dynamic from 'next/dynamic'

/** Results are read from sessionStorage, so they render on the client only. */
export const ResultsLoader = dynamic(() => import('@/components/results/results-view').then((m) => m.ResultsView), {
  ssr: false,
  loading: () => <div aria-busy="true" aria-label="Loading results" className="h-96 animate-pulse rounded-lg bg-secondary" />,
})
