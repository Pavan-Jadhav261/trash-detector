'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { Container, LinkButton } from '@/components/shared/primitives'

const LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#technology', label: 'Technology' },
  { href: '#about', label: 'About' },
]

export function SiteNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton href="/simulator" size="sm" className="hidden sm:inline-flex">
            Launch Simulator
          </LinkButton>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-sm py-3 text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            ))}
            <LinkButton href="/simulator" className="mt-2 mb-2">
              Launch Simulator
            </LinkButton>
          </Container>
        </nav>
      )}
    </header>
  )
}
