import { ArrowRight } from 'lucide-react'
import { HeroVisual } from '@/components/landing/hero-visual'
import { Container, Eyebrow, LinkButton, buttonClass } from '@/components/shared/primitives'

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <Container className="relative grid items-center gap-16 pt-16 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:pt-24 lg:pb-32">
        <div className="max-w-xl">
          <Eyebrow>Computer Vision × Circular Economy</Eyebrow>
          <h1
            id="hero-title"
            className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[3.75rem]"
          >
            See waste differently.
            <br />
            <span className="text-muted-foreground">Recover more intelligently.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-pretty text-muted-foreground">
            An intelligent waste classification and sorting simulation that uses computer vision to identify recyclable materials,
            evaluate sorting decisions, and measure material recovery performance.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton href="/simulator" size="lg">
              Start Simulation
              <ArrowRight />
            </LinkButton>
            <a href="#technology" className={buttonClass('secondary', 'lg')}>
              Explore the Technology
            </a>
          </div>
          <p className="mt-10 font-mono text-xs text-muted-foreground">
            Software-only simulation · Vision-based detection · Material recovery analytics
          </p>
        </div>
        <HeroVisual />
      </Container>
    </section>
  )
}
