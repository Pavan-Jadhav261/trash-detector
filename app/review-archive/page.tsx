import type { Metadata } from 'next'
import { AppHeader } from '@/components/layout/app-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Container } from '@/components/shared/primitives'
import { ReviewGallery } from '@/components/review/review-gallery'

export const metadata: Metadata = { title: 'LLM Review Archive', description: 'Human-rejected images and Gemini annotations.' }

export default function ReviewArchivePage() {
  return <><AppHeader /><main className="py-8 md:py-10"><Container><ReviewGallery /></Container></main><SiteFooter /></>
}
