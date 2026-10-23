import { CLASS_IDS, WASTE_CATEGORIES } from '@/lib/waste-categories'
import type { ClassId, Detection, SimulationDataset, SourceVideoMeta } from '@/types/waste'

const SAMPLING_FPS = 5
const FALLBACK_DURATION = 20

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Mulberry32 — small, fast, deterministic PRNG. */
function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSeed(video: SourceVideoMeta, seedVariant: number): number {
  return hashString(
    [video.fileName, video.fileSize, video.lastModified, effectiveDuration(video.duration).toFixed(2), seedVariant].join('|'),
  )
}

export function effectiveDuration(duration: number): number {
  return Number.isFinite(duration) && duration > 0 ? duration : FALLBACK_DURATION
}

function pickClass(random: () => number): ClassId {
  const total = WASTE_CATEGORIES.reduce((sum, c) => sum + c.sampleFrequency, 0)
  let roll = random() * total
  for (const category of WASTE_CATEGORIES) {
    roll -= category.sampleFrequency
    if (roll <= 0) return category.id
  }
  return 4
}

const round = (value: number, digits = 3) => Math.round(value * 10 ** digits) / 10 ** digits

/**
 * Generates demonstration detections. These are procedurally generated for the
 * frontend prototype and are not predictions from any model.
 */
export function generateDataset(video: SourceVideoMeta, seedVariant: number): SimulationDataset {
  const seed = createSeed(video, seedVariant)
  const random = createRandom(seed)
  const duration = effectiveDuration(video.duration)

  const count = Math.max(12, Math.min(120, Math.round(duration * 1.4)))
  const lifetime = Math.min(3.2, duration * 0.6)
  const windowStart = Math.min(0.4, duration * 0.05)
  const windowEnd = Math.max(windowStart + 0.1, duration - lifetime - 0.1)
  const spacing = (windowEnd - windowStart) / count

  const detections: Detection[] = []
  for (let i = 0; i < count; i++) {
    const classId = pickClass(random)
    const confidence = round(0.55 + Math.pow(random(), 0.55) * 0.44, 2)

    const misclassified = random() < (1 - confidence) * 0.9
    let trueClassId: ClassId = classId
    if (misclassified) {
      const others = CLASS_IDS.filter((id) => id !== classId)
      trueClassId = others[Math.floor(random() * others.length)]
    }

    const appearAt = round(windowStart + i * spacing + random() * spacing * 0.8)
    const life = lifetime * (0.85 + random() * 0.3)
    const disappearAt = round(Math.min(duration, appearAt + life))

    const width = round(0.08 + random() * 0.1)
    const height = round(0.12 + random() * 0.14)
    const lane = random()
    const y = round(0.12 + lane * (0.76 - height))

    detections.push({
      id: `det-${i.toString().padStart(3, '0')}`,
      classId,
      trueClassId,
      confidence,
      appearAt,
      disappearAt,
      decisionAt: round((appearAt + disappearAt) / 2),
      box: { xStart: -0.02, xEnd: 1.02 - width, y, width, height },
    })
  }

  detections.sort((a, b) => a.decisionAt - b.decisionAt)

  return {
    seed,
    seedVariant,
    samplingFps: SAMPLING_FPS,
    sampledFrames: Math.floor(duration * SAMPLING_FPS),
    detections,
  }
}

export interface ActiveBox {
  detection: Detection
  x: number
  y: number
  width: number
  height: number
  crossed: boolean
}

export function getActiveBoxes(detections: Detection[], time: number): ActiveBox[] {
  const active: ActiveBox[] = []
  for (const detection of detections) {
    if (time < detection.appearAt || time > detection.disappearAt) continue
    const progress = (time - detection.appearAt) / Math.max(0.001, detection.disappearAt - detection.appearAt)
    const { xStart, xEnd, y, width, height } = detection.box
    active.push({
      detection,
      x: xStart + (xEnd - xStart) * progress,
      y,
      width,
      height,
      crossed: time >= detection.decisionAt,
    })
  }
  return active
}
