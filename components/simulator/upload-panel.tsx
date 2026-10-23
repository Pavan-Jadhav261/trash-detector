'use client'

import { AlertCircle, CheckCircle2, FileVideo, Loader2, Play, Upload, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { Button, Card } from '@/components/shared/primitives'
import { formatClock, formatFileSize } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SourceVideoMeta } from '@/types/waste'

interface UploadPanelProps {
  video: { url: string; meta: SourceVideoMeta } | null
  loading: boolean
  error: string | null
  onChoose: () => void
  onFile: (file: File) => void
  onRemove: () => void
  onRun: () => void
}

export function UploadPanel({ video, loading, error, onChoose, onFile, onRemove, onRun }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' || event.target !== event.currentTarget) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    if (video) onRun()
    else onChoose()
  }

  return (
    <Card className="overflow-hidden">
      <div
        tabIndex={0}
        role="group"
        aria-label={video ? 'Selected video. Press Enter to run object detection.' : 'Video upload area. Press Enter to choose a video.'}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
        className={cn(
          'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          dragging && 'bg-accent/60',
        )}
      >
        {video ? (
          <SelectedVideo video={video} onChoose={onChoose} onRemove={onRemove} />
        ) : (
          <div
            className={cn(
              'm-3 flex flex-col items-center gap-5 rounded-md border border-dashed px-6 py-14 text-center transition-colors md:py-20',
              dragging ? 'border-primary' : 'border-border',
            )}
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              {loading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Upload your waste-stream video</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Choose an MP4, WebM, or MOV video to begin object detection.</p>
            </div>
            <Button onClick={onChoose} disabled={loading}>
              <FileVideo />
              {loading ? 'Reading video…' : 'Choose Video'}
            </Button>
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
              or drag and drop · MP4, WebM, MOV · max 100 MB · stays on this device
            </p>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 border-t border-border bg-destructive/5 px-5 py-3 text-[13px] text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] text-muted-foreground">
          {video ? 'The video is processed by the local best.pt model.' : 'Select a valid video to enable object detection.'}
        </p>
        <Button size="lg" onClick={onRun} disabled={!video || loading}>
          <Play />
          Run Detection
        </Button>
      </div>
    </Card>
  )
}

function SelectedVideo({
  video,
  onChoose,
  onRemove,
}: {
  video: { url: string; meta: SourceVideoMeta }
  onChoose: () => void
  onRemove: () => void
}) {
  const { meta } = video
  return (
    <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-[minmax(0,320px)_1fr] md:p-5">
      <div className="aspect-video overflow-hidden rounded-md bg-[#141311]">
        <video src={`${video.url}#t=0.1`} muted playsInline preload="metadata" aria-label="Video thumbnail" className="size-full object-contain" />
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
            <CheckCircle2 className="size-4" />
            Video ready
          </p>
          <h2 className="mt-1.5 truncate text-base font-semibold" title={meta.fileName}>
            {meta.fileName}
          </h2>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-[12.5px]">
            <div>
              <dt className="text-muted-foreground">Size</dt>
              <dd className="font-mono tabular-nums">{formatFileSize(meta.fileSize)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-mono tabular-nums">{Number.isFinite(meta.duration) ? formatClock(meta.duration) : 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Resolution</dt>
              <dd className="font-mono tabular-nums">{meta.width && meta.height ? `${meta.width}×${meta.height}` : 'Unknown'}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onChoose}>
            Replace Video
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
