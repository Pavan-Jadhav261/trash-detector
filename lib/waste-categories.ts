import type { ClassId, SimulationConfig, WasteCategory } from '@/types/waste'

export const WASTE_CATEGORIES: readonly WasteCategory[] = [
  {
    id: 0,
    key: 'metal',
    name: 'Metal',
    color: '#7D8A94',
    description: 'Aluminum cans and other recyclable metal objects.',
    representativeItem: 'Aluminium can',
    minWeightGrams: 13,
    maxWeightGrams: 18,
    defaultWeightGrams: 15.5,
    recoveryEligible: true,
    sampleFrequency: 0.2,
  },
  {
    id: 1,
    key: 'plastic',
    name: 'Plastic',
    color: '#3F739C',
    description: 'Plastic bottles, containers, and packaging.',
    representativeItem: 'Empty plastic bottle (500 ml)',
    minWeightGrams: 10,
    maxWeightGrams: 25,
    defaultWeightGrams: 17.5,
    recoveryEligible: true,
    sampleFrequency: 0.25,
  },
  {
    id: 2,
    key: 'cardboard',
    name: 'Cardboard',
    color: '#A8754A',
    description: 'Boxes and other cardboard packaging.',
    representativeItem: 'Small cardboard box',
    minWeightGrams: 50,
    maxWeightGrams: 200,
    defaultWeightGrams: 125,
    recoveryEligible: true,
    sampleFrequency: 0.13,
  },
  {
    id: 3,
    key: 'glass',
    name: 'Glass',
    color: '#4F8A6E',
    description: 'Glass bottles and containers.',
    representativeItem: 'Empty glass bottle (500 ml)',
    minWeightGrams: 200,
    maxWeightGrams: 350,
    defaultWeightGrams: 275,
    recoveryEligible: true,
    sampleFrequency: 0.1,
  },
  {
    id: 4,
    key: 'trash',
    name: 'Trash',
    color: '#5C5750',
    description: 'Residual or non-recyclable waste.',
    representativeItem: 'Plastic wrapper',
    minWeightGrams: 1,
    maxWeightGrams: 5,
    defaultWeightGrams: 3,
    recoveryEligible: false,
    sampleFrequency: 0.15,
  },
  {
    id: 5,
    key: 'paper',
    name: 'Paper',
    color: '#B0647A',
    description: 'Sheets, newspapers, and paper packaging.',
    representativeItem: 'A4 paper sheet',
    minWeightGrams: 4,
    maxWeightGrams: 5,
    defaultWeightGrams: 4.5,
    recoveryEligible: true,
    sampleFrequency: 0.17,
  },
] as const

export const CLASS_IDS: readonly ClassId[] = [0, 1, 2, 3, 4, 5]

export function getCategory(id: ClassId): WasteCategory {
  return WASTE_CATEGORIES[id]
}

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7

export function createDefaultConfig(): SimulationConfig {
  const weights = {} as Record<ClassId, number>
  const recoveryEligible = {} as Record<ClassId, boolean>
  for (const category of WASTE_CATEGORIES) {
    weights[category.id] = category.defaultWeightGrams
    recoveryEligible[category.id] = category.recoveryEligible
  }
  return { weights, recoveryEligible, confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD }
}
