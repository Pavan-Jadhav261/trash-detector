import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

const reviewDirectory = path.join(process.cwd(), 'data', 'llm-review')
const categories = ['metal', 'plastic', 'cardboard', 'glass', 'trash', 'paper']

const schema = {
  type: 'object', properties: {
    imageName: { type: 'string' }, object: { type: 'string' }, category: { type: 'string', enum: categories },
    description: { type: 'string' }, confidence: { type: 'number' },
    annotations: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, boundingBox: { type: ['object', 'null'], properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } } } }, required: ['label', 'boundingBox'] } },
  }, required: ['imageName', 'object', 'category', 'description', 'confidence', 'annotations'],
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const image = form.get('image')
    if (!(image instanceof File) || !image.type.startsWith('image/')) return Response.json({ error: 'An image is required.' }, { status: 400 })
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return Response.json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env.local.' }, { status: 503 })
    const bytes = Buffer.from(await image.arrayBuffer())
    const prompt = `You are a waste-sorting vision reviewer. Analyze this image and identify the main waste object. Classify it as exactly one of: ${categories.join(', ')}. Give image coordinates as integer percentages (0-100); use null when a box cannot be determined. Return only the requested structured result.`
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite'}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: image.type, data: bytes.toString('base64') } }] }], generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema } }),
    })
    const payload = await response.json()
    if (!response.ok) return Response.json({ error: payload?.error?.message ?? 'Gemini request failed.' }, { status: 502 })
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini did not return an annotation.')
    const annotation = JSON.parse(text)
    annotation.imageName = image.name
    annotation.confidence = Math.max(0, Math.min(1, Number(annotation.confidence) || 0))
    if (!categories.includes(annotation.category)) annotation.category = 'trash'
    const id = `${Date.now()}-${randomUUID()}`
    const extension = path.extname(image.name) || '.jpg'
    await fs.mkdir(reviewDirectory, { recursive: true })
    await fs.writeFile(path.join(reviewDirectory, `${id}${extension}`), bytes)
    await fs.writeFile(path.join(reviewDirectory, `${id}.json`), JSON.stringify({ id, savedAt: new Date().toISOString(), imageFile: `${id}${extension}`, annotation }, null, 2))
    return Response.json({ annotation })
  } catch (error) {
    console.error('Manual Gemini review failed', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Manual review analysis failed.' }, { status: 500 })
  }
}
