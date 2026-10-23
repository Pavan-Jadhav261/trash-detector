import { CategorySection } from '@/components/landing/category-section'
import { HeroSection } from '@/components/landing/hero-section'
import { OverviewSection } from '@/components/landing/overview-section'
import { ProcessSection } from '@/components/landing/process-section'
import { CtaSection, SoftwareSection } from '@/components/landing/software-section'
import { TechnologySection } from '@/components/landing/technology-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavbar } from '@/components/layout/site-navbar'

export default function HomePage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <ProcessSection />
        <CategorySection />
        <TechnologySection />
        <SoftwareSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
