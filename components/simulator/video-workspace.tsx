'use client'

import { AlertTriangle, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { Badge, Button, Card } from '@/components/shared/primitives'
import { formatClock, formatTimestamp } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SortedDetection, SourceVideoMeta } from '@/types/waste'

const SEEK_TOLERANCE = 0.12
const DRIFT_TOLERANCE = 0.3
const SPEEDS = [0.5, 1, 1.5] as const

export interface VideoWorkspaceHandle {
  seekTo: (seconds: number) => void
}

interface VideoWorkspaceProps {
  url: string
  processedUrl?: string
  meta: SourceVideoMeta
  detections: SortedDetection[]
  highlightedId: string | null
  onReplace: () => void
  ref?: Ref<VideoWorkspaceHandle>
}

export function VideoWorkspace({ url, processedUrl, meta, detections, highlightedId, onReplace, ref }: VideoWorkspaceProps) {
  const sourceRef = useRef<HTMLVideoElement>(null)
  const processedRef = useRef<HTMLVideoElement>(null)

  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(Number.isFinite(meta.duration) ? meta.duration : 0)
  const [rate, setRate] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  const getPair = useCallback((from: 'source' | 'processed') => {
    const source = sourceRef.current
    const processed = processedRef.current
    if (!source || !processed) return null
    return from === 'source' ? { self: source, other: processed } : { self: processed, other: source }
  }, [])

  const playBoth = useCallback(() => {
    const source = sourceRef.current
    const processed = processedRef.current
    if (!source || !processed) return
    if (Math.abs(processed.currentTime - source.currentTime) > SEEK_TOLERANCE) processed.currentTime = source.currentTime
    Promise.all([source.play(), processed.play()]).catch(() => {
      setError('Playback could not start. Your browser may not support this video format.')
    })
  }, [])

  const pauseBoth = useCallback(() => {
    sourceRef.current?.pause()
    processedRef.current?.pause()
  }, [])

  const seekBoth = useCallback((seconds: number) => {
    const source = sourceRef.current
    const processed = processedRef.current
    if (!source || !processed) return
    const max = Number.isFinite(source.duration) ? source.duration : seconds
    const target = Math.max(0, Math.min(max, seconds))
    source.currentTime = target
    processed.currentTime = target
    setTime(target)
  }, [])

  useImperativeHandle(ref, () => ({ seekTo: seekBoth }), [seekBoth])

  useEffect(() => {
    let frame = 0
    let lastReported = -1
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const source = sourceRef.current
      const processed = processedRef.current
      if (!source || !processed) return

      if (!source.paused && !processed.paused && !source.seeking && !processed.seeking) {
        if (Math.abs(processed.currentTime - source.currentTime) > DRIFT_TOLERANCE) processed.currentTime = source.currentTime
      }

      const current = processed.currentTime
      if (Math.abs(current - lastReported) >= 0.05) {
        lastReported = current
        setTime(source.currentTime)
      }

    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [meta.width, meta.height])

  const mediaHandlers = (from: 'source' | 'processed') => ({
    onPlay: () => {
      const pair = getPair(from)
      if (pair?.other.paused) pair.other.play().catch(() => undefined)
      setPlaying(true)
    },
    onPause: () => {
      const pair = getPair(from)
      if (pair && !pair.other.paused) pair.other.pause()
      setPlaying(false)
    },
    onSeeked: () => {
      const pair = getPair(from)
      if (!pair) return
      if (Math.abs(pair.other.currentTime - pair.self.currentTime) > SEEK_TOLERANCE) pair.other.currentTime = pair.self.currentTime
      setTime(pair.self.currentTime)
    },
    onRateChange: () => {
      const pair = getPair(from)
      if (!pair) return
      if (pair.other.playbackRate !== pair.self.playbackRate) pair.other.playbackRate = pair.self.playbackRate
      setRate(pair.self.playbackRate)
    },
    onLoadedMetadata: (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const value = event.currentTarget.duration
      if (Number.isFinite(value)) setDuration(value)
    },
    onError: () => {
      setError('This video could not be played in your browser. Replace it with an MP4 (H.264) or WebM file.')
      setPlaying(false)
    },
  })

  const changeRate = (value: number) => {
    if (sourceRef.current) sourceRef.current.playbackRate = value
    if (processedRef.current) processedRef.current.playbackRate = value
    setRate(value)
  }

  const restart = () => seekBoth(0)

  if (error) {
    return (
      <Card role="alert" className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold">Video playback failed</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={onReplace}>Replace Video</Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <VideoPanel
          title="Original Video"
          badge={<Badge>Source</Badge>}
          footer={`${formatTimestamp(time)} / ${formatTimestamp(duration)}`}
        >
          <video
            ref={sourceRef}
            src={url}
            controls
            playsInline
            preload="auto"
            aria-label={`Original video: ${meta.fileName}`}
            className="size-full object-contain"
            {...mediaHandlers('source')}
          />
        </VideoPanel>

        <VideoPanel
          title="Detected Output"
          badge={<Badge tone="success">YOLO annotations</Badge>}
          footer={`${detections.length} unique tracked objects · model output`}
        >
          <div className="relative size-full">
            <video
              ref={processedRef}
              src={processedUrl ?? url}
              controls
              muted
              playsInline
              preload="auto"
              aria-label="Processed video with YOLO object detection annotations"
              className="size-full object-contain"
              {...mediaHandlers('processed')}
            />
          </div>
        </VideoPanel>
      </div>

      <div
        role="toolbar"
        aria-label="Shared playback controls"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4"
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="w-24"
            onClick={() => (sourceRef.current?.paused ? playBoth() : pauseBoth())}
            aria-label={playing ? 'Pause both videos' : 'Play both videos'}
          >
            {playing ? <Pause /> : <Play />}
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button size="sm" variant="secondary" onClick={restart} aria-label="Restart both videos from the beginning">
            <RotateCcw />
            Restart
          </Button>
          <p className="ml-1 font-mono text-[12.5px] tabular-nums sm:hidden" aria-live="off">
            {formatClock(time)} / {formatClock(duration)}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden font-mono text-[12.5px] tabular-nums sm:inline">{formatClock(time)}</span>
          <label className="flex min-w-0 flex-1 items-center">
            <span className="sr-only">Seek both videos</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.05}
              value={Math.min(time, duration || 0)}
              onChange={(event) => seekBoth(Number(event.target.value))}
              aria-valuetext={`${formatClock(time)} of ${formatClock(duration)}`}
              className="h-1.5 w-full cursor-pointer accent-primary"
            />
          </label>
          <span className="hidden font-mono text-[12.5px] text-muted-foreground tabular-nums sm:inline">{formatClock(duration)}</span>
        </div>

        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Playback speed</legend>
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Speed</span>
          <div className="inline-flex rounded-md border border-border p-0.5">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => changeRate(speed)}
                aria-pressed={rate === speed}
                className={cn(
                  'h-7 rounded-[4px] px-2.5 font-mono text-[12px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  rate === speed ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {speed}×
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}

function VideoPanel({
  title,
  badge,
  footer,
  children,
}: {
  title: string
  badge: React.ReactNode
  footer: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {badge}
      </div>
      <div className="aspect-video bg-[#141311]">{children}</div>
      <p className="border-t border-border px-4 py-2 font-mono text-[11.5px] text-muted-foreground tabular-nums">{footer}</p>
    </Card>
  )
}
