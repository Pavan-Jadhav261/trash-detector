import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { Container, Eyebrow } from '@/components/shared/primitives'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/simulator', label: 'Simulator' },
  { href: '/results', label: 'Results' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            An interactive exploration of how computer vision could support waste classification, sorting decisions, and material
            recovery analytics in Material Recovery Facilities.
          </p>
        </div>
        <nav aria-label="Footer">
          <Eyebrow className="mb-4">Navigate</Eyebrow>
          <ul className="flex flex-col gap-2.5">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-sm text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Eyebrow className="mb-4">Project</Eyebrow>
          <p className="text-sm text-foreground">Computer Vision Waste Classification &amp; Sorting Simulation</p>
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>Frontend demonstration prototype</span>
        <span className="font-mono">No model inference · No data leaves your browser</span>
      </Container>
    </footer>
  )
}
