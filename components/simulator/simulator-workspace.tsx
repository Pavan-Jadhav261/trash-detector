'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MaterialClassification } from '@/components/analysis/material-classification'
import { RecoveryPerformance } from '@/components/analysis/recovery-performance'
import { WeightSection } from '@/components/analysis/weight-section'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge, Button } from '@/components/shared/primitives'
import { DetectionOverview } from '@/components/simulator/detection-overview'
import { DetectionTimeline } from '@/components/simulator/detection-timeline'
import { PROCESSING_STEPS, ProcessingPanel } from '@/components/simulator/processing-panel'
import { SimulationActions } from '@/components/simulator/simulation-actions'
import { SimulatorHeader, type SimulatorStatus } from '@/components/simulator/simulator-header'
import { SortingDecisions } from '@/components/simulator/sorting-decisions'
import { UploadPanel } from '@/components/simulator/upload-panel'
import { VideoWorkspace, type VideoWorkspaceHandle } from '@/components/simulator/video-workspace'
import { computeSummary } from '@/lib/analytics'
import { formatFileSize } from '@/lib/format'
import { clearReport, clearVideoSession, getVideoSession, loadReport, saveReport, setVideoSession } from '@/lib/storage'
import { ACCEPT_ATTRIBUTE, readVideoMetadata, validateVideoFile } from '@/lib/video-utils'
import { createDefaultConfig, WASTE_CATEGORIES } from '@/lib/waste-categories'
import type { ClassId, SimulationConfig, SimulationDataset, SourceVideoMeta } from '@/types/waste'

type Phase = 'idle' | 'ready' | 'processing' | 'complete'
type PendingAction = 'run-again' | 'replace' | 'reset' | null

interface VideoState {
  url: string
  meta: SourceVideoMeta
}

interface InitialState {
  phase: Phase
  video: VideoState | null
  dataset: SimulationDataset | null
  config: SimulationConfig
}

function restoreState(): InitialState {
  const session = getVideoSession()
  const report = loadReport()
  if (session && report && report.video.fileName === session.file.name && report.video.fileSize === session.file.size) {
    return { phase: 'complete', video: { url: session.url, meta: report.video }, dataset: report.dataset, config: report.config }
  }
  return { phase: 'idle', video: null, dataset: null, config: report?.config ?? createDefaultConfig() }
}

export function SimulatorWorkspace() {
  const [initial] = useState(restoreState)
  const [phase, setPhase] = useState<Phase>(initial.phase)
  const [video, setVideo] = useState<VideoState | null>(initial.video)
  const [dataset, setDataset] = useState<SimulationDataset | null>(initial.dataset)
  const [config, setConfig] = useState<SimulationConfig>(initial.config)
  const [loadingFile, setLoadingFile] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const playerRef = useRef<VideoWorkspaceHandle>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const loadToken = useRef(0)
  const runVariant = useRef(initial.dataset?.seedVariant ?? 0)

  const summary = useMemo(() => (dataset ? computeSummary(dataset.detections, config) : null), [dataset, config])

  useEffect(() => {
    if (phase !== 'processing' || !video) return
    // Keep the last 10% reserved for the live model request. The UI only
    // reaches a completed state after the annotated output is ready.
    if (step < PROCESSING_STEPS.length - 1) {
      const timer = window.setTimeout(() => setStep((s) => s + 1), PROCESSING_STEPS[step].duration)
      return () => window.clearTimeout(timer)
    }
    let cancelled = false
    const detect = async () => {
      try {
        const body = new FormData()
        body.append('video', getVideoSession()?.file ?? new File([], video.meta.fileName))
        const response = await fetch('/api/detect', { method: 'POST', body })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Detection failed.')
        if (cancelled) return
        const next: SimulationDataset = {
          seed: Date.now(), seedVariant: runVariant.current, sampledFrames: result.sampledFrames,
          samplingFps: result.samplingFps, detections: result.detections, processedUrl: result.processedUrl,
        }
        setDataset(next)
        setHighlightedId(null)
        saveReport({ version: 1, completedAt: Date.now(), video: video.meta, dataset: next, config })
        setPhase('complete')
        toast.success('Detection complete', { description: `${next.detections.length} unique objects detected.` })
      } catch (error) {
        if (cancelled) return
        setPhase('ready')
        setFileError(error instanceof Error ? error.message : 'Detection failed.')
        toast.error('Detection failed', { description: 'Check that the local model environment is available, then try again.' })
      }
    }
    void detect()
    return () => { cancelled = true }
  }, [phase, step, video, config])

  const status: SimulatorStatus = phase === 'processing' ? 'Processing' : phase === 'complete' ? 'Completed' : 'Ready'

  const openPicker = () => inputRef.current?.click()

  const discardResults = () => {
    setDataset(null)
    setHighlightedId(null)
    clearReport()
  }

  const handleFile = async (file: File) => {
    const validation = validateVideoFile(file)
    if (validation) {
      setFileError(validation)
      return
    }
    const token = ++loadToken.current
    setFileError(null)
    setLoadingFile(true)
    discardResults()
    setVideo(null)
    setPhase('idle')
    const session = setVideoSession(file)
    try {
      const meta = await readVideoMetadata(file, session.url)
      if (token !== loadToken.current) return
      runVariant.current = 0
      setVideo({ url: session.url, meta })
      // Start immediately after a valid upload so the primary action is not hidden behind a second button.
      setStep(0)
      setPhase('processing')
    } catch (error) {
      if (token !== loadToken.current) return
      clearVideoSession()
      setFileError(error instanceof Error ? error.message : 'This video could not be read.')
    } finally {
      if (token === loadToken.current) setLoadingFile(false)
    }
  }

  const removeVideo = () => {
    loadToken.current++
    clearVideoSession()
    discardResults()
    setVideo(null)
    setFileError(null)
    setPhase('idle')
  }

  const runSimulation = () => {
    if (!video) return
    setStep(0)
    setPhase('processing')
  }

  const updateConfig = (next: SimulationConfig) => {
    setConfig(next)
    if (phase === 'complete' && video && dataset) {
      saveReport({ version: 1, completedAt: Date.now(), video: video.meta, dataset, config: next })
    }
  }

  const confirmPending = () => {
    const action = pending
    setPending(null)
    if (action === 'run-again') {
      runVariant.current += 1
      runSimulation()
    } else if (action === 'replace') {
      openPicker()
    } else if (action === 'reset') {
      removeVideo()
      setConfig(createDefaultConfig())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReplace = () => (phase === 'complete' ? setPending('replace') : openPicker())

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void handleFile(file)
        }}
      />

      <div className="flex flex-col gap-8">
        <SimulatorHeader status={status} />

        {(phase === 'idle' || phase === 'ready') && (
          <UploadPanel
            video={video}
            loading={loadingFile}
            error={fileError}
            onChoose={openPicker}
            onFile={(file) => void handleFile(file)}
            onRemove={removeVideo}
            onRun={runSimulation}
          />
        )}

        {phase === 'processing' && video && <ProcessingPanel step={step} fileName={video.meta.fileName} />}

        {phase === 'complete' && video && summary && (
          <section aria-labelledby="workspace-heading" ref={workspaceRef} className="flex scroll-mt-20 flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <h2 id="workspace-heading" className="text-base font-semibold">
                  Video workspace
                </h2>
              <Badge tone="success">YOLO Detection Run</Badge>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <p className="truncate font-mono text-[12px] text-muted-foreground" title={video.meta.fileName}>
                  {video.meta.fileName} · {formatFileSize(video.meta.fileSize)}
                </p>
                <Button variant="secondary" size="sm" onClick={handleReplace}>
                  Replace
                </Button>
              </div>
            </div>
            <VideoWorkspace
              ref={playerRef}
              url={video.url}
              processedUrl={dataset?.processedUrl}
              meta={video.meta}
              detections={summary.sorted}
              highlightedId={highlightedId}
              onReplace={handleReplace}
            />
            <p className="text-[12px] text-muted-foreground">The right video is annotated by the local YOLO model using tracked, unique objects.</p>
          </section>
        )}
      </div>

      <DetectionOverview summary={phase === 'complete' ? summary : null} />

      {phase === 'complete' && summary && (
        <>
          <MaterialClassification summary={summary} />
          <WeightSection
            summary={summary}
            onWeightChange={(id: ClassId, grams) => updateConfig({ ...config, weights: { ...config.weights, [id]: grams } })}
            onResetWeights={() => {
              const weights = { ...config.weights }
              for (const category of WASTE_CATEGORIES) weights[category.id] = category.defaultWeightGrams
              updateConfig({ ...config, weights })
            }}
          />
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-2 xl:gap-8">
            <DetectionTimeline
              detections={summary.sorted}
              selectedId={highlightedId}
              onSelect={(detection) => {
                setHighlightedId(detection.id)
                playerRef.current?.seekTo(detection.decisionAt)
                workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            />
            <SortingDecisions
              summary={summary}
              config={config}
              onThresholdChange={(value) => updateConfig({ ...config, confidenceThreshold: value })}
              onEligibilityChange={(id, eligible) =>
                updateConfig({ ...config, recoveryEligible: { ...config.recoveryEligible, [id]: eligible } })
              }
            />
          </div>
          <RecoveryPerformance summary={summary} />
          <SimulationActions
            onRunAgain={() => setPending('run-again')}
            onReplace={() => setPending('replace')}
            onReset={() => setPending('reset')}
          />
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={
          pending === 'run-again' ? 'Run detection again?' : pending === 'replace' ? 'Replace the current video?' : 'Reset the detector?'
        }
        description={
          pending === 'run-again'
            ? 'The model will run again on this video. The current detection results will be replaced.'
            : pending === 'replace'
              ? 'Selecting a new video discards the current detection results.'
              : 'This removes the video and all detection results and returns to the upload step. Estimation settings return to defaults.'
        }
        confirmLabel={pending === 'run-again' ? 'Run Again' : pending === 'replace' ? 'Choose Video' : 'Reset'}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
