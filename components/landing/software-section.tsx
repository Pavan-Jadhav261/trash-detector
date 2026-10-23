import { ArrowRight, Check } from 'lucide-react'
import { Container, Eyebrow, LinkButton } from '@/components/shared/primitives'

const POINTS = ['No physical conveyor required.', 'No external hardware dependencies.', 'Interactive demonstration environment.']

export function SoftwareSection() {
  return (
    <section aria-labelledby="software-title" className="border-b border-border">
      <Container className="py-24 lg:py-32">
        <div className="grid overflow-hidden rounded-lg border border-border bg-accent/60 lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <Eyebrow className="text-accent-foreground">05 / Software-only</Eyebrow>
            <h2 id="software-title" className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
              An entire sorting workflow. No hardware required.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-pretty text-foreground/75">
              Explore waste detection, simulated sorting decisions, and material recovery analytics through an interactive software
              interface. The demonstration runs entirely in the browser using mock data and frontend simulation logic.
            </p>
          </div>
          <div className="flex flex-col justify-center border-t border-primary/15 bg-card/70 p-8 md:p-12 lg:border-t-0 lg:border-l">
            <ul className="flex flex-col divide-y divide-border">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-4 py-4 text-[15px]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check aria-hidden="true" className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Transparency note: this version is a frontend prototype. Detections are generated demonstration data, not output from a
              trained model.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function CtaSection() {
  return (
    <section aria-labelledby="cta-title">
      <Container className="py-24 text-center lg:py-32">
        <h2 id="cta-title" className="mx-auto max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.03em] text-balance md:text-5xl">
          Make every material count.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-muted-foreground">
          Explore a computer vision-based approach to waste classification and material recovery.
        </p>
        <LinkButton href="/simulator" size="lg" className="mt-9">
          Launch Waste Simulator
          <ArrowRight />
        </LinkButton>
      </Container>
    </section>
  )
}
