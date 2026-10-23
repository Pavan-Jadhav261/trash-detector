import { Droplets, EyeOff, Layers, Shapes } from 'lucide-react'
import { Container, Eyebrow } from '@/components/shared/primitives'

const CHALLENGES = [
  { icon: Layers, title: 'Occlusion', body: 'Objects may overlap or be partially hidden.' },
  { icon: Droplets, title: 'Contamination', body: 'Dirt and residue may obscure visual features.' },
  { icon: Shapes, title: 'Deformation', body: 'Crushed or distorted items may be difficult to classify.' },
  { icon: EyeOff, title: 'Mixed Materials', body: 'Different waste types may share similar visual characteristics.' },
]

const STACK = [
  'YOLO-style object detection',
  'Computer vision',
  'TACO dataset',
  'TrashNet dataset',
  'ZeroWaste dataset',
  'Conveyor-belt simulation',
]

export function TechnologySection() {
  return (
    <section id="technology" aria-labelledby="technology-title" className="scroll-mt-20 border-b border-border bg-secondary/50">
      <Container className="py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>04 / Technology</Eyebrow>
            <h2 id="technology-title" className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
              Designed around real-world waste complexity.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Waste on a moving belt rarely looks like a clean product photo. Any practical vision system has to cope with the
              conditions below — the simulator is built to make these trade-offs visible.
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:col-span-7">
            {CHALLENGES.map((item) => (
              <div key={item.title} className="bg-card p-6">
                <dt className="flex items-center gap-3 font-semibold tracking-tight">
                  <item.icon aria-hidden="true" className="size-[18px] text-primary" strokeWidth={1.5} />
                  {item.title}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Relevant technologies &amp; reference datasets
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li key={item} className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-foreground">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Datasets are listed as references for the problem space. This prototype does not train or run a model on them.
          </p>
        </div>
      </Container>
    </section>
  )
}
