'use client'

import { Camera, Loader2, Square, Video } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Badge, Button, Card } from '@/components/shared/primitives'
import { getCategory } from '@/lib/waste-categories'
import type { ClassId } from '@/types/waste'

type LiveDetection = { classId: ClassId; confidence: number; box: { x: number; y: number; width: number; height: number } }

export function LiveDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const activeRef = useRef(false)
  const [active, setActive] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detections, setDetections] = useState<LiveDetection[]>([])

  const stopDemo = useCallback(() => {
    activeRef.current = false
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setDetecting(false)
    setDetections([])
  }, [])

  const detectFrame = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.videoWidth === 0 || !activeRef.current) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
    if (!image || !activeRef.current) return
    setDetecting(true)
    try {
      const body = new FormData()
      body.append('image', image, 'camera-frame.jpg')
      const response = await fetch('/api/live-detect', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Live detection failed.')
      if (activeRef.current) setDetections(result.detections)
    } catch (reason) {
      if (activeRef.current) {
        setError(reason instanceof Error ? reason.message : 'Live detection failed.')
        stopDemo()
      }
    } finally {
      if (activeRef.current) setDetecting(false)
    }
  }, [stopDemo])

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => void detectFrame(), 1400)
    void detectFrame()
    return () => window.clearInterval(timer)
  }, [active, detectFrame])

  // The <video> element is conditional on `active`, so attach the stream only
  // after React has rendered it. Attaching it during the click handler leaves
  // desktop browsers with a camera stream but no visible preview.
  useEffect(() => {
    const video = videoRef.current
    if (!active || !video || !streamRef.current) return
    video.srcObject = streamRef.current
    void video.play().catch(() => undefined)
  }, [active])

  useEffect(() => () => stopDemo(), [stopDemo])

  const startDemo = async () => {
    setError(null)
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      } catch {
        // Desktop cameras generally do not report an environment-facing mode.
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
      streamRef.current = stream
      activeRef.current = true
      setActive(true)
    } catch {
      setError('Camera access was not granted. Allow camera permission and try again.')
      toast.error('Camera unavailable', { description: 'Allow camera permission to start the live demo.' })
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Live camera demo</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your camera to identify waste items as they appear in view.</p>
        </div>
        <Button size="lg" variant={active ? 'danger' : 'primary'} onClick={() => (active ? stopDemo() : void startDemo())}>
          {active ? <Square /> : <Camera />}
          {active ? 'Stop Live Demo' : 'Start Live Demo'}
        </Button>
      </div>
      {active && (
        <div className="border-t border-border p-4">
          <div className="relative aspect-video overflow-hidden rounded-md bg-[#141311]">
            <video ref={videoRef} muted playsInline className="size-full object-contain" aria-label="Live camera feed" />
            {detections.map((detection, index) => {
              const category = getCategory(detection.classId)
              return <div key={`${detection.classId}-${index}`} className="absolute border-2" style={{ left: `${detection.box.x * 100}%`, top: `${detection.box.y * 100}%`, width: `${detection.box.width * 100}%`, height: `${detection.box.height * 100}%`, borderColor: category.color }}>
                <span className="absolute -top-6 left-0 whitespace-nowrap px-1.5 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: category.color }}>{category.name} {Math.round(detection.confidence * 100)}%</span>
              </div>
            })}
            <div className="absolute left-3 top-3"><Badge tone="success" dot>{detecting ? 'ANALYZING' : 'LIVE'}</Badge></div>
            {detecting && <Loader2 className="absolute right-3 top-3 size-5 animate-spin text-white" />}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground"><Video className="size-4" /> {detections.length ? `${detections.length} object${detections.length === 1 ? '' : 's'} detected` : 'Point the camera at a supported waste item.'}</div>
        </div>
      )}
      {error && <p role="alert" className="border-t border-destructive/20 bg-destructive/5 px-5 py-3 text-sm text-destructive">{error}</p>}
    </Card>
  )
}
