import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('size-6', className)}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="6" width="5" height="5" rx="1" fill="#C66A45" />
      <rect x="13" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 15.5h5M15.5 13v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        EcoSort<span className="ml-1 font-mono text-xs font-medium text-muted-foreground">AI</span>
      </span>
    </Link>
  )
}
