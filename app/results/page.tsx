import type { Metadata } from 'next'
import { AppHeader } from '@/components/layout/app-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Container } from '@/components/shared/primitives'
import { ResultsLoader } from '@/components/results/results-loader'

export const metadata: Metadata = {
  title: 'Results',
  description: 'Consolidated simulated material classification, weight estimation, and sorting performance with CSV export.',
}

export default function ResultsPage() {
  return (
    <>
      <div className="print:hidden">
        <AppHeader />
      </div>
      <main className="py-10 md:py-14">
        <Container>
          <ResultsLoader />
        </Container>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  )
}
