import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'border border-border bg-card text-foreground hover:bg-secondary',
  ghost: 'text-foreground hover:bg-secondary',
  danger: 'border border-border bg-card text-destructive hover:bg-destructive/5',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors outline-none select-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant
  size?: Size
}

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase', className)}>
      {children}
    </p>
  )
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-border bg-secondary text-muted-foreground',
  accent: 'border-primary/25 bg-accent text-accent-foreground',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-[#8A5E25]',
  danger: 'border-destructive/25 bg-destructive/10 text-destructive',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
  dot,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-sm border px-2 font-mono text-[10.5px] font-medium tracking-wider uppercase',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-lg border border-border bg-card', className)} {...props} />
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  id,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
  action?: ReactNode
  id?: string
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-xl font-semibold tracking-tight text-balance md:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14', className)} {...props} />
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-md border border-border bg-secondary/60 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground/60" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
        <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeLinecap="round" />
      </svg>
      <div>{children}</div>
    </div>
  )
}
