import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const reviewDirectory = path.join(process.cwd(), 'data', 'llm-review')

export async function GET() {
  try {
    const files = (await fs.readdir(reviewDirectory)).filter((file) => file.endsWith('.json'))
    const records = await Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(reviewDirectory, file), 'utf8'))))
    records.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
    return Response.json({ records })
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return Response.json({ records: [] })
    return Response.json({ error: 'Could not load review records.' }, { status: 500 })
  }
}
