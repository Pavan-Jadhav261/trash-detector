import type { Metadata } from 'next'
import { AppHeader } from '@/components/layout/app-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Container } from '@/components/shared/primitives'
import { SimulatorLoader } from '@/components/simulator/simulator-loader'

export const metadata: Metadata = {
  title: 'Simulator',
  description:
    'Upload a waste-stream video for local YOLO object detection, material classification, weight estimation, and recovery performance.',
}

export default function SimulatorPage() {
  return (
    <>
      <AppHeader />
      <main className="py-10 md:py-14">
        <Container>
          <SimulatorLoader />
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
