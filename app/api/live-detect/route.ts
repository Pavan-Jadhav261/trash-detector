import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { randomUUID } from 'crypto'
import { promisify } from 'util'

export const runtime = 'nodejs'
export const maxDuration = 60

const run = promisify(execFile)
const python = process.env.WASTE_PYTHON_PATH ?? 'C:\\Users\\pavan\\OneDrive\\Desktop\\trash-segration\\venv312\\Scripts\\python.exe'
const script = path.join(process.cwd(), 'scripts', 'detect_image.py')

export async function POST(request: Request) {
  let imagePath: string | undefined
  try {
    const form = await request.formData()
    const image = form.get('image')
    if (!(image instanceof File)) return Response.json({ error: 'A camera frame is required.' }, { status: 400 })
    if (!image.type.startsWith('image/')) return Response.json({ error: 'The camera frame must be an image.' }, { status: 400 })
    imagePath = path.join(tmpdir(), `waste-camera-${randomUUID()}.jpg`)
    await fs.writeFile(imagePath, Buffer.from(await image.arrayBuffer()))
    const { stdout } = await run(python, [script, imagePath], { timeout: 55000, windowsHide: true, maxBuffer: 1024 * 1024 })
    return Response.json(JSON.parse(stdout))
  } catch (error) {
    console.error('Live camera detection failed', error)
    return Response.json({ error: 'Live detection failed. Check that the local model is available.' }, { status: 500 })
  } finally {
    if (imagePath) await fs.unlink(imagePath).catch(() => undefined)
  }
}
