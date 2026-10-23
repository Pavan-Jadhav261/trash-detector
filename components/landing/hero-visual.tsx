import Image from 'next/image'
import { getCategory } from '@/lib/waste-categories'
import type { ClassId } from '@/types/waste'

interface IllustrativeBox {
  classId: ClassId
  confidence: string
  left: number
  top: number
  width: number
  height: number
}

const BOXES: IllustrativeBox[] = [
  { classId: 0, confidence: '0.96', left: 9, top: 44, width: 7.6, height: 14 },
  { classId: 1, confidence: '0.93', left: 23.4, top: 41, width: 5.8, height: 19.5 },
  { classId: 2, confidence: '0.91', left: 37, top: 39, width: 12.3, height: 23.4 },
  { classId: 3, confidence: '0.88', left: 55.7, top: 39.6, width: 5, height: 21 },
  { classId: 5, confidence: '0.89', left: 67.7, top: 40, width: 12.3, height: 23 },
  { classId: 4, confidence: '0.84', left: 85.2, top: 44.6, width: 8.4, height: 13.2 },
]

export function HeroVisual() {
  return (
    <figure className="relative">
      <div className="relative overflow-hidden rounded-lg border border-border bg-secondary">
        <div className="relative aspect-[1200/896]">
          <Image
            src="/images/conveyor-hero.png"
            alt="Overhead view of a conveyor belt carrying a metal can, plastic bottle, cardboard, glass bottle, newspaper, and a plastic wrapper"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-[30%] left-0 w-[9%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan" />
            {BOXES.map((box) => {
              const category = getCategory(box.classId)
              return (
                <div
                  key={box.classId}
                  className="absolute rounded-[3px] border-[1.5px]"
                  style={{
                    left: `${box.left}%`,
                    top: `${box.top}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    borderColor: category.color === '#5C5750' ? '#D9D4CB' : category.color,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                  }}
                >
                  <span
                    className="absolute -top-5 left-[-1.5px] rounded-t-[3px] px-1.5 py-0.5 font-mono text-[9px] leading-none font-medium tracking-wide whitespace-nowrap text-white sm:text-[10px]"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.toUpperCase()} {box.confidence}
                  </span>
                </div>
              )
            })}
            <div className="absolute inset-y-[28%] left-1/2 border-l border-dashed border-white/40" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
          <span>CAM-01 · Illustrative frame</span>
          <span>Not model output</span>
        </div>
      </div>

      <div className="absolute -bottom-8 left-4 w-56 rounded-lg border border-border bg-card p-4 shadow-[0_8px_24px_rgba(41,40,36,0.08)] sm:-left-6 lg:-left-10">
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Analysis panel</p>
        <dl className="mt-3 flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Objects detected</dt>
            <dd className="font-mono font-medium">24</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Material categories</dt>
            <dd className="font-mono font-medium">6</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Simulation status</dt>
            <dd className="flex items-center gap-1.5 font-medium text-success">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
              Ready
            </dd>
          </div>
        </dl>
      </div>
      <figcaption className="sr-only">Illustrative figures only; not actual model results.</figcaption>
    </figure>
  )
}
