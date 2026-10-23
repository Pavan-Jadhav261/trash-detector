import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { promisify } from 'util'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 300

const run = promisify(execFile)
const jobsDirectory = path.join(tmpdir(), 'waste-detector-jobs')
const python = process.env.WASTE_PYTHON_PATH ?? 'C:\\Users\\pavan\\OneDrive\\Desktop\\trash-segration\\venv312\\Scripts\\python.exe'
const script = path.join(process.cwd(), 'scripts', 'detect_video.py')

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const video = form.get('video')
    if (!(video instanceof File)) return Response.json({ error: 'A video file is required.' }, { status: 400 })
    await fs.mkdir(jobsDirectory, { recursive: true })
    const id = randomUUID()
    const extension = path.extname(video.name) || '.mp4'
    // Keep the uploaded source distinct from the generated MP4. For .mp4
    // uploads, using the same path would overwrite the input during encoding.
    const input = path.join(jobsDirectory, `${id}.input${extension}`)
    const output = path.join(jobsDirectory, `${id}.mp4`)
    const report = path.join(jobsDirectory, `${id}.json`)
    await fs.writeFile(input, Buffer.from(await video.arrayBuffer()))
    await run(python, [script, input, output, report], { timeout: 290000, windowsHide: true, maxBuffer: 1024 * 1024 })
    const result = JSON.parse(await fs.readFile(report, 'utf8'))
    return Response.json({ ...result, processedUrl: `/api/detect/${id}` })
  } catch (error) {
    console.error('Video detection failed', error)
    return Response.json({ error: 'Detection failed. Ensure the uploaded video is valid and try again.' }, { status: 500 })
  }
}
