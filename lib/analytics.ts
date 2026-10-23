import { WASTE_CATEGORIES } from '@/lib/waste-categories'
import type {
  CategoryResult,
  Detection,
  SimulationConfig,
  SimulationSummary,
  SortedDetection,
  SortingAction,
} from '@/types/waste'

export function decideAction(detection: Detection, config: SimulationConfig): SortingAction {
  if (detection.confidence < config.confidenceThreshold) return 'REVIEW'
  return config.recoveryEligible[detection.classId] ? 'PICK' : 'REJECT'
}

export function sortDetections(detections: Detection[], config: SimulationConfig): SortedDetection[] {
  return detections.map((detection) => ({ ...detection, action: decideAction(detection, config) }))
}

export function safePercent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return (numerator / denominator) * 100
}

export function computeSummary(detections: Detection[], config: SimulationConfig): SimulationSummary {
  const sorted = sortDetections(detections, config)
  const totalObjects = sorted.length

  const categories: CategoryResult[] = WASTE_CATEGORIES.map((category) => {
    const items = sorted.filter((d) => d.classId === category.id)
    const weightPerObject = config.weights[category.id]
    return {
      category,
      count: items.length,
      percentage: safePercent(items.length, totalObjects) ?? 0,
      weightPerObject,
      totalWeight: items.length * weightPerObject,
      pick: items.filter((d) => d.action === 'PICK').length,
      reject: items.filter((d) => d.action === 'REJECT').length,
      review: items.filter((d) => d.action === 'REVIEW').length,
    }
  })

  const picks = sorted.filter((d) => d.action === 'PICK')
  const purePickCount = picks.filter((d) => config.recoveryEligible[d.trueClassId]).length

  return {
    totalObjects,
    categoriesDetected: categories.filter((c) => c.count > 0).length,
    totalWeight: categories.reduce((sum, c) => sum + c.totalWeight, 0),
    categories,
    pickCount: picks.length,
    rejectCount: sorted.filter((d) => d.action === 'REJECT').length,
    reviewCount: sorted.filter((d) => d.action === 'REVIEW').length,
    recoveryRate: safePercent(picks.length, totalObjects),
    purity: safePercent(purePickCount, picks.length),
    purePickCount,
    recoveredWeight: picks.reduce((sum, d) => sum + config.weights[d.classId], 0),
    sorted,
  }
}
