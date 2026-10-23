import type { Metadata } from 'next'
import { AppHeader } from '@/components/layout/app-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Container } from '@/components/shared/primitives'
import { ConveyorLive } from '@/components/conveyor/conveyor-live'

export const metadata: Metadata = {
  title: 'Conveyor Live',
  description: 'Real-time image sorting simulation powered by the local waste detection model.',
}

export default function ConveyorLivePage() {
  return (
    <>
      <AppHeader />
      <main className="py-8 md:py-10">
        <Container><ConveyorLive /></Container>
      </main>
      <SiteFooter />
    </>
  )
}
