import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
const reviewDirectory = path.join(process.cwd(), 'data', 'llm-review')

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const safeFile = path.basename(file)
  if (safeFile !== file || safeFile.endsWith('.json')) return new Response('Not found', { status: 404 })
  try {
    const content = await fs.readFile(path.join(reviewDirectory, safeFile))
    const type = safeFile.endsWith('.png') ? 'image/png' : safeFile.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    return new Response(content, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } })
  } catch { return new Response('Not found', { status: 404 }) }
}
