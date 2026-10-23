import { ChartColumn, ScanLine, Split } from 'lucide-react'
import { Container, Eyebrow } from '@/components/shared/primitives'

const FEATURES = [
  {
    icon: ScanLine,
    title: 'Intelligent Classification',
    body: 'Identify and categorize waste materials using a YOLO-style computer vision workflow.',
  },
  {
    icon: Split,
    title: 'Simulated Sorting Decisions',
    body: 'Visualize hypothetical pick, reject, and routing decisions as detected objects move through a conveyor scene.',
  },
  {
    icon: ChartColumn,
    title: 'Recovery Analytics',
    body: 'Estimate material weights and report category distribution, recovery rates, and purity metrics.',
  },
]

export function OverviewSection() {
  return (
    <section id="about" aria-labelledby="overview-title" className="scroll-mt-20 border-b border-border">
      <Container className="py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>01 / Overview</Eyebrow>
            <h2 id="overview-title" className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
              Turning mixed waste into measurable insight.
            </h2>
          </div>
          <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
            <p className="text-pretty">
              Material Recovery Facilities process complex waste streams containing recyclable and non-recyclable materials.
              Contamination, occlusion, dirt, and deformation can make accurate classification challenging.
            </p>
            <p className="text-pretty">
              This project explores how computer vision can support classification and sorting decisions through a software-based
              conveyor simulation — from per-object detection to facility-style recovery metrics.
            </p>
          </div>
        </div>

        <div className="mt-16 grid border-t border-l border-border md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="group border-r border-b border-border bg-card p-8 transition-colors hover:bg-secondary/40">
              <feature.icon aria-hidden="true" className="size-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-10 text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
