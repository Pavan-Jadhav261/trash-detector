import { Container, Eyebrow } from '@/components/shared/primitives'

const STEPS = [
  { number: '01', title: 'Upload', body: 'Provide a video containing mixed waste items.' },
  {
    number: '02',
    title: 'Detect',
    body: 'Visualize detected objects, class labels, confidence scores, and simulated sorting decisions.',
  },
  {
    number: '03',
    title: 'Analyze',
    body: 'Review category counts, estimated material weights, recovery metrics, and classification results.',
  },
]

export function ProcessSection() {
  return (
    <section id="how-it-works" aria-labelledby="process-title" className="scroll-mt-20 border-b border-border bg-secondary/50">
      <Container className="py-24 lg:py-32">
        <Eyebrow>02 / How it works</Eyebrow>
        <h2 id="process-title" className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
          Three steps from raw footage to recovery metrics.
        </h2>

        <div className="relative mt-16">
        <div aria-hidden="true" className="absolute top-[11px] right-0 left-0 hidden h-px bg-border md:block" />
        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <li key={step.number} className="relative flex gap-5 md:flex-col md:gap-0">
              <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary bg-background">
                <span className="size-2 rounded-full bg-primary" />
              </span>
              <div className="md:mt-8">
                <p className="font-mono text-sm text-primary">{step.number}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </Container>
    </section>
  )
}
