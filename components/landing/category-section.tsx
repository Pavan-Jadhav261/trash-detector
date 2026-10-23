import { CategoryIcon } from '@/components/shared/category-icon'
import { Container, Eyebrow } from '@/components/shared/primitives'
import { WASTE_CATEGORIES } from '@/lib/waste-categories'

export function CategorySection() {
  return (
    <section aria-labelledby="categories-title" className="border-b border-border">
      <Container className="py-24 lg:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>03 / Material classes</Eyebrow>
            <h2 id="categories-title" className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
              Six categories. One consistent taxonomy.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            These six categories define the demonstration interface and may differ from the finer material classes used in datasets
            such as TACO, TrashNet, and ZeroWaste.
          </p>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {WASTE_CATEGORIES.map((category) => (
            <li key={category.id} className="relative flex flex-col bg-card p-6 transition-colors hover:bg-secondary/40">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: category.color }} />
              <div className="flex items-start justify-between">
                <CategoryIcon category={category} />
                <span className="font-mono text-xs text-muted-foreground">Class {category.id}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">{category.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
