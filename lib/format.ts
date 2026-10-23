export function formatWeight(grams: number): string {
  if (!Number.isFinite(grams)) return '—'
  if (Math.abs(grams) >= 1000) return `${(grams / 1000).toFixed(2)} kg`
  return `${grams % 1 === 0 ? grams.toFixed(0) : grams.toFixed(1)} g`
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)}%`
}

export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00.0'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds - minutes * 60
  return `${minutes.toString().padStart(2, '0')}:${rest.toFixed(1).padStart(4, '0')}`
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatConfidence(value: number): string {
  return value.toFixed(2)
}
