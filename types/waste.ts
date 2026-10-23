export type ClassId = 0 | 1 | 2 | 3 | 4 | 5

export type CategoryKey = 'metal' | 'plastic' | 'cardboard' | 'glass' | 'trash' | 'paper'

export interface WasteCategory {
  id: ClassId
  key: CategoryKey
  name: string
  color: string
  description: string
  representativeItem: string
  minWeightGrams: number
  maxWeightGrams: number
  defaultWeightGrams: number
  recoveryEligible: boolean
  /** Relative frequency used when generating demonstration detections. */
  sampleFrequency: number
}

export type SortingAction = 'PICK' | 'REJECT' | 'REVIEW'

export interface DetectionBox {
  /** Normalized (0–1) horizontal position of the box's left edge when it enters. */
  xStart: number
  /** Normalized (0–1) horizontal position of the box's left edge when it exits. */
  xEnd: number
  /** Normalized (0–1) vertical position of the box's top edge. */
  y: number
  width: number
  height: number
}

export interface Detection {
  id: string
  classId: ClassId
  /** Simulated ground-truth class used to illustrate purity. Not a real label. */
  trueClassId: ClassId
  confidence: number
  appearAt: number
  disappearAt: number
  /** Moment the object crosses the simulated decision line. */
  decisionAt: number
  box: DetectionBox
}

export interface SimulationConfig {
  weights: Record<ClassId, number>
  recoveryEligible: Record<ClassId, boolean>
  confidenceThreshold: number
}

export interface SourceVideoMeta {
  fileName: string
  fileSize: number
  fileType: string
  lastModified: number
  duration: number
  width: number
  height: number
}

export interface SimulationDataset {
  seed: number
  seedVariant: number
  sampledFrames: number
  samplingFps: number
  detections: Detection[]
  /** URL of the annotated video rendered by the local YOLO detector. */
  processedUrl?: string
}

export interface CategoryResult {
  category: WasteCategory
  count: number
  percentage: number
  weightPerObject: number
  totalWeight: number
  pick: number
  reject: number
  review: number
}

export interface SortedDetection extends Detection {
  action: SortingAction
}

export interface SimulationSummary {
  totalObjects: number
  categoriesDetected: number
  totalWeight: number
  categories: CategoryResult[]
  pickCount: number
  rejectCount: number
  reviewCount: number
  /** null when there are no detections. */
  recoveryRate: number | null
  /** null when no objects were assigned to recovery. */
  purity: number | null
  purePickCount: number
  recoveredWeight: number
  sorted: SortedDetection[]
}

export interface StoredReport {
  version: 1
  completedAt: number
  video: SourceVideoMeta
  dataset: SimulationDataset
  config: SimulationConfig
}
