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
const labelsRoot = path.resolve(process.cwd(), '..', 'data', 'labels')

/** Returns a class only for a single-object image with a matching, checked YOLO dataset label. */
async function getVerifiedGroundTruth(fileName: string): Promise<number | null> {
  const labelName = `${path.parse(path.basename(fileName)).name}.txt`
  for (const split of ['val', 'train']) {
    try {
      const contents = await fs.readFile(path.join(labelsRoot, split, labelName), 'utf8')
      const classes = [...new Set(contents.split(/\r?\n/).filter(Boolean).map((line) => Number(line.trim().split(/\s+/)[0])))]
      // This conveyor view routes one physical item per upload. Do not use a multi-object image as a single-item ground truth.
      if (classes.length === 1 && Number.isInteger(classes[0]) && classes[0] >= 0 && classes[0] <= 5) return classes[0]
      return null
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  return null
}

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
    const result = JSON.parse(stdout)
    const groundTruth = await getVerifiedGroundTruth(image.name)
    return Response.json({ ...result, groundTruth, groundTruthSource: groundTruth === null ? null : 'dataset-label' })
  } catch (error) {
    console.error('Live camera detection failed', error)
    return Response.json({ error: 'Live detection failed. Check that the local model is available.' }, { status: 500 })
  } finally {
    if (imagePath) await fs.unlink(imagePath).catch(() => undefined)
  }
}

export async function GET(request: Request) {
  try {
    const fileName = new URL(request.url).searchParams.get('fileName')
    if (!fileName) return Response.json({ error: 'fileName is required.' }, { status: 400 })
    const groundTruth = await getVerifiedGroundTruth(fileName)
    return Response.json({ groundTruth, groundTruthSource: groundTruth === null ? null : 'dataset-label' })
  } catch (error) {
    console.error('Ground-truth lookup failed', error)
    return Response.json({ error: 'Ground-truth lookup failed.' }, { status: 500 })
  }
}
