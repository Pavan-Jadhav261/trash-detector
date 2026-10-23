'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { Badge, Container } from '@/components/shared/primitives'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/simulator', label: 'Simulator' },
  { href: '/conveyor-live', label: 'Conveyor Live' },
  { href: '/review-archive', label: 'Review Archive' },
  { href: '/results', label: 'Results' },
]

export function AppHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <Container className="flex h-14 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Application" className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-md px-3 py-1.5 text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent" className="hidden sm:inline-flex">
            Frontend Demo
          </Badge>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-expanded={open}
            aria-controls="app-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>
      {open && (
        <nav id="app-mobile-nav" aria-label="Application mobile" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-accent font-medium text-accent-foreground' : 'text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <Badge tone="accent" className="mt-2 self-start">
              Frontend Demo
            </Badge>
          </Container>
        </nav>
      )}
    </header>
  )
}
