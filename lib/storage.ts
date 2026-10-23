'use client'

import { useSyncExternalStore } from 'react'
import type { StoredReport } from '@/types/waste'

const REPORT_KEY = 'ecosort:report:v1'
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedReport: StoredReport | null = null

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(REPORT_KEY)
  } catch {
    return null
  }
}

function getSnapshot(): StoredReport | null {
  const raw = readRaw()
  if (raw === cachedRaw) return cachedReport
  cachedRaw = raw
  try {
    const parsed = raw ? (JSON.parse(raw) as StoredReport) : null
    cachedReport = parsed && parsed.version === 1 ? parsed : null
  } catch {
    cachedReport = null
  }
  return cachedReport
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  for (const listener of listeners) listener()
}

export function saveReport(report: StoredReport) {
  try {
    window.sessionStorage.setItem(REPORT_KEY, JSON.stringify(report))
  } catch {
    // sessionStorage can be unavailable (private mode / quota); the in-page state still works.
  }
  emit()
}

export function clearReport() {
  try {
    window.sessionStorage.removeItem(REPORT_KEY)
  } catch {
    // ignore
  }
  emit()
}

export function loadReport(): StoredReport | null {
  return getSnapshot()
}

export function useStoredReport(): { report: StoredReport | null; hydrated: boolean } {
  const report = useSyncExternalStore(subscribe, getSnapshot, () => null)
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  return { report, hydrated }
}

/**
 * The selected File lives only in memory for the browser tab, so returning to
 * the simulator after visiting /results can restore playback without re-uploading.
 */
interface VideoSession {
  file: File
  url: string
}

let videoSession: VideoSession | null = null

export function getVideoSession(): VideoSession | null {
  return videoSession
}

export function setVideoSession(file: File): VideoSession {
  if (videoSession) URL.revokeObjectURL(videoSession.url)
  videoSession = { file, url: URL.createObjectURL(file) }
  return videoSession
}

export function clearVideoSession() {
  if (videoSession) URL.revokeObjectURL(videoSession.url)
  videoSession = null
}
