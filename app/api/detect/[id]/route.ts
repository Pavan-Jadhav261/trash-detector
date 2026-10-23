import { createReadStream, existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { Readable } from 'stream'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response('Not found', { status: 404 })
  const output = path.join(tmpdir(), 'waste-detector-jobs', `${id}.mp4`)
  if (!existsSync(output)) return new Response('Not found', { status: 404 })
  return new Response(Readable.toWeb(createReadStream(output)) as ReadableStream, {
    headers: { 'Content-Type': 'video/mp4', 'Cache-Control': 'no-store' },
  })
}
