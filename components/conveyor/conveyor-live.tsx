'use client'

import { AlertTriangle, Check, CheckCircle2, ImagePlus, Loader2, Play, RotateCcw, ShieldCheck, Trash2, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { toast } from 'sonner'
import { Badge, Button, Card, Eyebrow } from '@/components/shared/primitives'
import { getCategory, WASTE_CATEGORIES } from '@/lib/waste-categories'
import { cn } from '@/lib/utils'
import type { ClassId } from '@/types/waste'

type QueuedImage = { id: string; file: File; url: string; groundTruth: ClassId | null }
type ModelDetection = { classId: ClassId; confidence: number; box: { x: number; y: number; width: number; height: number } }
type SortRecord = { id: string; image: QueuedImage; detection: ModelDetection | null; routedClassId: ClassId | null; decision: 'PICK' | 'REJECT' | 'REVIEW'; label: string; confidence: number }
type ActiveSort = { record: SortRecord; phase: 'scanning' | 'routing'; lane: number }
type SelectedBay = { name: string; color: string; records: SortRecord[] }
type LlmAnnotation = { imageName: string; object: string; category: string; description: string; confidence: number; annotations: { label: string; boundingBox: { x: number; y: number; width: number; height: number } | null }[] }

const REVIEW_THRESHOLD = 0.7

function percent(value: number) { return `${Math.round(value * 100)}%` }

export function ConveyorLive() {
  const inputRef = useRef<HTMLInputElement>(null)
  const checkedGroundTruthRef = useRef(new Set<string>())
  const [queue, setQueue] = useState<QueuedImage[]>([])
  const [records, setRecords] = useState<SortRecord[]>([])
  const [active, setActive] = useState<ActiveSort[]>([])
  const [running, setRunning] = useState(false)
  const [threshold, setThreshold] = useState(REVIEW_THRESHOLD)
  const [selectedBay, setSelectedBay] = useState<SelectedBay | null>(null)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [llmResult, setLlmResult] = useState<{ record: SortRecord; annotation: LlmAnnotation } | null>(null)

  // Existing session items are hydrated too, so metrics update after a hot reload without rerunning detection.
  useEffect(() => {
    const missing = records.filter((record) => record.image.groundTruth === null && !checkedGroundTruthRef.current.has(record.id))
    if (!missing.length) return
    missing.forEach((record) => checkedGroundTruthRef.current.add(record.id))
    void Promise.all(missing.map(async (record) => {
      const response = await fetch(`/api/live-detect?fileName=${encodeURIComponent(record.image.file.name)}`)
      const result = await response.json()
      return Number.isInteger(result.groundTruth) && result.groundTruth >= 0 && result.groundTruth <= 5 ? { id: record.id, groundTruth: result.groundTruth as ClassId } : null
    })).then((matches) => {
      const verified = matches.filter((match): match is { id: string; groundTruth: ClassId } => match !== null)
      if (!verified.length) return
      const matchById = new Map(verified.map((match) => [match.id, match.groundTruth]))
      setRecords((current) => current.map((record) => matchById.has(record.id) ? { ...record, image: { ...record.image, groundTruth: matchById.get(record.id)! } } : record))
    }).catch(() => undefined)
  }, [records])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (!valid.length) { toast.error('Choose image files to add to the conveyor.'); return }
    setQueue((current) => [...current, ...valid.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), groundTruth: null }))])
  }

  const processOne = useCallback(async (item: QueuedImage) => {
    const body = new FormData()
    body.append('image', item.file)
    const response = await fetch('/api/live-detect', { method: 'POST', body })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'The local detector could not analyze this image.')
    const detection = (result.detections as ModelDetection[]).sort((a, b) => b.confidence - a.confidence)[0] ?? null
    const category = detection ? getCategory(detection.classId) : null
    const decision = !detection || detection.confidence < threshold ? 'REVIEW' : category?.recoveryEligible ? 'PICK' : 'REJECT'
    const datasetGroundTruth = Number.isInteger(result.groundTruth) && result.groundTruth >= 0 && result.groundTruth <= 5 ? result.groundTruth as ClassId : null
    const verifiedImage = { ...item, groundTruth: item.groundTruth ?? datasetGroundTruth }
    return { id: item.id, image: verifiedImage, detection, routedClassId: detection?.classId ?? null, decision, label: category?.name ?? 'No item found', confidence: detection?.confidence ?? 0 } as SortRecord
  }, [threshold])

  const runConveyor = async () => {
    if (!queue.length || running) return
    setRunning(true)
    const batch = [...queue]
    setQueue([])
    const sortItem = async (item: QueuedImage, index: number) => {
      const pending: SortRecord = { id: item.id, image: item, detection: null, routedClassId: null, decision: 'REVIEW', label: 'Scanning…', confidence: 0 }
      setActive((current) => [...current, { record: pending, phase: 'scanning', lane: index % 3 }])
      const startedAt = Date.now()
      try {
        const record = await processOne(item)
        // Keep each item visible on the belt long enough to make the sorting action legible.
        await new Promise((resolve) => setTimeout(resolve, Math.max(0, 6200 - (Date.now() - startedAt))))
        setActive((current) => current.map((entry) => entry.record.id === item.id ? { ...entry, record, phase: 'routing' } : entry))
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setActive((current) => current.filter((entry) => entry.record.id !== item.id))
        setRecords((current) => [record, ...current])
      } catch (error) {
        setActive((current) => current.filter((entry) => entry.record.id !== item.id))
        toast.error('One item could not be sorted', { description: error instanceof Error ? error.message : 'Detection failed.' })
      }
    }
    for (const [index, item] of batch.entries()) {
      void sortItem(item, index)
      await new Promise((resolve) => setTimeout(resolve, 1350))
    }
    window.setTimeout(() => setRunning(false), 7800)
  }

  const stats = useMemo(() => {
    const uniqueRecords = [...new Map(records.map((item) => [item.id, item])).values()]
    const pick = uniqueRecords.filter((item) => item.decision === 'PICK')
    const review = uniqueRecords.filter((item) => item.decision === 'REVIEW')
    const verifiedPicks = pick.filter((item) => item.image.groundTruth !== null)
    const correctlySorted = verifiedPicks.filter((item) => item.image.groundTruth === item.routedClassId)
    return {
      processed: uniqueRecords.length,
      correctlySorted: correctlySorted.length,
      rejected: uniqueRecords.filter((item) => item.decision === 'REJECT').length,
      purity: verifiedPicks.length ? correctlySorted.length / verifiedPicks.length : 0,
      review: review.length,
    }
  }, [records, threshold])

  const reset = () => {
    queue.forEach((item) => URL.revokeObjectURL(item.url))
    records.forEach((record) => URL.revokeObjectURL(record.image.url))
    setQueue([])
    setRecords([])
    setActive([])
    setRunning(false)
    setSelectedBay(null)
    checkedGroundTruthRef.current.clear()
  }

  const acceptModelPrediction = (record: SortRecord) => {
    if (!record.detection) { toast.error('There is no model prediction to accept.'); return }
    setRecords((current) => current.map((item) => item.id === record.id ? { ...item, routedClassId: record.detection!.classId, decision: getCategory(record.detection!.classId).recoveryEligible ? 'PICK' : 'REJECT' } : item))
    setSelectedBay(null)
    toast.success(`${record.label} accepted and routed to its bin.`)
  }

  const askGemini = async (record: SortRecord) => {
    setReviewing(record.id)
    try {
      const body = new FormData()
      body.append('image', record.image.file)
      const response = await fetch('/api/manual-review/analyze', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Gemini could not analyze this image.')
      setLlmResult({ record, annotation: result.annotation })
    } catch (error) {
      toast.error('LLM analysis failed', { description: error instanceof Error ? error.message : 'Please try again.' })
    } finally { setReviewing(null) }
  }

  const confirmLlmDecision = (record: SortRecord, annotation: LlmAnnotation) => {
    const category = WASTE_CATEGORIES.find((item) => item.key === annotation.category.toLowerCase() || item.name.toLowerCase() === annotation.category.toLowerCase())
    setRecords((current) => current.map((item) => item.id === record.id ? { ...item, routedClassId: category?.id ?? null, decision: category?.recoveryEligible ? 'PICK' : 'REJECT', label: category?.name ?? annotation.object, confidence: annotation.confidence } : item))
    setLlmResult(null); setSelectedBay(null)
    toast.success(`${annotation.object} confirmed and routed${category ? ` to ${category.name}` : ''}.`)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Local AI sorting cell</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Conveyor live</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Upload waste images, then start the belt. The local model evaluates each item in sequence and sends it to a material bay, reject lane, or manual review.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Badge tone="success" dot>Model online</Badge><Badge tone="neutral">best.pt · local detection</Badge></div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Items processed', String(stats.processed), 'This sorting session'],
          ['Sorting purity', percent(stats.purity), 'Verified labels only'],
          ['Correctly sorted', String(stats.correctlySorted), 'Verified ground-truth match'],
          ['Rejected items', String(stats.rejected), 'Sent to reject lane'],
          ['Needs review', String(stats.review), `Below ${percent(threshold)} confidence`],
        ].map(([label, value, hint]) => <Card key={label} className="p-4"><p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></Card>)}
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-semibold">Input queue</h2><p className="mt-1 text-sm text-muted-foreground">Matching dataset labels are read automatically. You can also assign a verified class before launch; images without either are excluded from purity and recovery.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">Review below <input aria-label="Review confidence threshold" type="range" min="0.4" max="0.95" step="0.05" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-primary" disabled={running} /> <span className="w-9 font-mono text-foreground">{percent(threshold)}</span></label>
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={running}><ImagePlus /> Add images</Button>
            <Button onClick={() => void runConveyor()} disabled={running || !queue.length}>{running ? <Loader2 className="animate-spin" /> : <Play />}{running ? 'Sorting…' : 'Start belt'}</Button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = '' }} />
        </div>
        <div className="p-4">
          {!queue.length && !active.length ? <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-24 w-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground hover:bg-secondary"><ImagePlus className="mb-2 size-5" />Drop in or choose one or more images</button> : <div className="flex gap-3 overflow-x-auto pb-1">{active.map((entry) => <QueueCard key={entry.record.id} item={entry.record.image} active />)} {queue.map((item) => <QueueCard key={item.id} item={item} onRemove={() => setQueue((current) => current.filter((q) => q.id !== item.id))} onGroundTruth={(groundTruth) => setQueue((current) => current.map((q) => q.id === item.id ? { ...q, groundTruth } : q))} />)}</div>}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-[#252522] px-5 py-3 text-xs text-white/80"><span className="mr-2 inline-block size-2 rounded-full bg-success" />AI vision scan · Items travel left to right and route when they reach the decision line.</div>
        <div className="relative min-h-72 overflow-hidden bg-[#34322d] p-5">
          <div className="absolute inset-x-0 top-1/2 h-36 -translate-y-1/2 overflow-hidden border-y-4 border-[#494740] bg-[repeating-linear-gradient(90deg,#3b3934_0px,#3b3934_36px,#4a4842_38px,#4a4842_40px)] shadow-inner">
            <div className="h-full animate-[conveyor-belt_1.8s_linear_infinite] bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_34px,rgba(255,255,255,0.09)_36px,rgba(255,255,255,0.09)_39px)]" />
          </div>
          <div className="absolute inset-x-0 top-[calc(50%-5.5rem)] flex justify-around px-7" aria-hidden="true">{Array.from({ length: 11 }, (_, index) => <span key={index} className="size-4 rounded-full border-4 border-[#24231f] bg-[#77736a]" />)}</div>
          <div className="absolute inset-y-0 left-[58%] border-l-2 border-dashed border-primary" />
          <span className="absolute top-3 left-[54%] font-mono text-[10px] tracking-wider text-primary-foreground/75">DECISION GATE</span>
          {active.length ? active.map((entry) => <BeltItem key={`${entry.record.id}-${entry.phase}`} active={entry} />) : <div className="relative z-10 flex min-h-64 items-center justify-center text-sm text-white/60">{records.length ? 'Belt ready for the next queued item' : 'Add images to begin a live sorting run'}</div>}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {WASTE_CATEGORIES.filter((category) => category.recoveryEligible).map((category) => { const bayRecords = records.filter((record) => record.routedClassId === category.id && record.decision === 'PICK'); const metrics = calculateBinMetrics(records, category.id); return <SortBay key={category.id} name={`${category.name} bin`} color={category.color} records={bayRecords} metrics={metrics} onOpen={() => setSelectedBay({ name: `${category.name} bin`, color: category.color, records: bayRecords })} /> })}
          <SortBay name="Reject" color="#5C5750" records={records.filter((record) => record.decision === 'REJECT')} onOpen={() => setSelectedBay({ name: 'Reject', color: '#5C5750', records: records.filter((record) => record.decision === 'REJECT') })} />
          <SortBay name="Manual review" color="#B9823D" records={records.filter((record) => record.decision === 'REVIEW')} review onOpen={() => setSelectedBay({ name: 'Manual review', color: '#B9823D', records: records.filter((record) => record.decision === 'REVIEW') })} />
        </div>
      </Card>

      {records.length > 0 && <div className="flex justify-end"><Button variant="ghost" onClick={reset}><RotateCcw /> Reset session</Button></div>}
      {selectedBay && <BayDetails bay={selectedBay} onClose={() => setSelectedBay(null)} onAccept={acceptModelPrediction} onReject={askGemini} reviewing={reviewing} />}
      {llmResult && <LlmConfirmation annotation={llmResult.annotation} onAccept={() => confirmLlmDecision(llmResult.record, llmResult.annotation)} onReject={() => setLlmResult(null)} />}
    </div>
  )
}

function QueueCard({ item, active, onRemove, onGroundTruth }: { item: QueuedImage; active?: boolean; onRemove?: () => void; onGroundTruth?: (classId: ClassId | null) => void }) {
  return <div className={cn('relative w-32 shrink-0 overflow-hidden rounded-md border bg-secondary', active && 'ring-2 ring-primary ring-offset-2 ring-offset-card')}><img src={item.url} alt="Queued waste item" className="h-20 w-full object-cover" />{onRemove && <button type="button" aria-label="Remove queued image" onClick={onRemove} className="absolute right-1 top-1 rounded-sm bg-black/60 p-1 text-white"><X className="size-3" /></button>}{active ? <div className="bg-primary px-1 py-1 text-center font-mono text-[9px] text-white">SCANNING</div> : <label className="block p-1.5"><span className="sr-only">Verified ground-truth category</span><select aria-label={`Verified class for ${item.file.name}`} value={item.groundTruth ?? ''} onChange={(event) => onGroundTruth?.(event.target.value === '' ? null : Number(event.target.value) as ClassId)} className="w-full rounded border border-border bg-background px-1 py-1 text-[10px] text-foreground"><option value="">Verify class…</option>{WASTE_CATEGORIES.filter((category) => category.recoveryEligible).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}</div>
}

function BeltItem({ active }: { active: ActiveSort }) {
  const { record, phase } = active
  const color = record.detection ? getCategory(record.detection.classId).color : '#B9823D'
  const routeX = record.decision === 'REVIEW' ? '15vw' : record.decision === 'REJECT' ? '8vw' : record.routedClassId !== null ? `${(record.routedClassId - 2) * 8}vw` : '0vw'
  const beltOffset = ['-42px', '0px', '42px'][active.lane]
  return <div className={cn('absolute top-1/2 z-10 flex items-center gap-3 rounded-md border-2 bg-[#211f1c] p-2 shadow-xl', phase === 'scanning' ? 'left-0 animate-[item-scan_6.4s_linear_forwards]' : 'left-[58%] animate-[item-route_1.4s_cubic-bezier(0.2,0.7,0.3,1)_forwards]')} style={{ borderColor: color, '--route-x': routeX, '--belt-y': beltOffset } as CSSProperties}><img src={record.image.url} alt="Item currently being sorted" className="size-16 rounded object-cover" /><div className="min-w-22 pr-1 text-white"><p className="text-sm font-semibold">{record.label}</p><p className="mt-1 font-mono text-xs" style={{ color }}>{record.detection ? percent(record.confidence) : 'Analyzing…'}</p><p className="mt-1 text-[10px] tracking-wider text-white/60">{phase === 'scanning' ? 'AI SCANNING' : record.decision}</p></div></div>
}

type BinMetrics = { totalInBin: number; correct: number; rejected: number; verifiedInBin: number; actualTotal: number; purity: number | null; recovery: number | null }

function calculateBinMetrics(records: SortRecord[], classId: ClassId): BinMetrics {
  // IDs are generated once per uploaded item; this removes any accidental repeated record before aggregation.
  const uniqueRecords = [...new Map(records.map((record) => [record.id, record])).values()]
  const bin = uniqueRecords.filter((record) => record.decision === 'PICK' && record.routedClassId === classId)
  const verifiedInBin = bin.filter((record) => record.image.groundTruth !== null)
  const correct = bin.filter((record) => record.image.groundTruth === classId).length
  const actual = uniqueRecords.filter((record) => record.image.groundTruth === classId)
  const rejected = actual.filter((record) => record.decision === 'REJECT').length
  return { totalInBin: bin.length, correct, rejected, verifiedInBin: verifiedInBin.length, actualTotal: actual.length, purity: verifiedInBin.length ? correct / verifiedInBin.length : null, recovery: actual.length ? correct / actual.length : null }
}

function SortBay({ name, color, records, review, metrics, onOpen }: { name: string; color: string; records: SortRecord[]; review?: boolean; metrics?: BinMetrics; onOpen: () => void }) {
  const Icon = review ? AlertTriangle : name === 'Reject' ? Trash2 : CheckCircle2
  return <button type="button" onClick={onOpen} className="min-h-35 rounded-md border-2 bg-card p-3 text-left transition-transform hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring" style={{ borderColor: `${color}99` }} aria-label={`View ${records.length} item${records.length === 1 ? '' : 's'} in ${name}`}><div className="flex items-center justify-between" style={{ color }}><span className="flex items-center gap-1.5 text-sm font-semibold"><Icon className="size-4" />{name}</span><span className="font-mono text-sm">{records.length}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{records.slice(0, 8).map((record) => <img key={record.id} src={record.image.url} alt="" className="size-10 rounded border object-cover" style={{ borderColor: color }} />)}{!records.length && <span className="text-xs text-muted-foreground">Awaiting items</span>}</div>{metrics ? <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-border pt-2 text-[10px]"><span className="text-muted-foreground">Purity</span><span className="text-right font-medium">{metrics.purity === null ? '—' : percent(metrics.purity)}</span><span className="text-muted-foreground">Recovery rate</span><span className="text-right font-medium">{metrics.recovery === null ? '—' : percent(metrics.recovery)}</span><span className="text-muted-foreground">Correct / total</span><span className="text-right font-medium">{metrics.correct} / {metrics.totalInBin}</span><span className="text-muted-foreground">Rejected</span><span className="text-right font-medium">{metrics.rejected}</span><span className="col-span-2 mt-1 text-muted-foreground">Verified: {metrics.verifiedInBin} in bin · {metrics.actualTotal} actual</span></div> : <p className="mt-3 text-[11px] text-muted-foreground">Click to view items</p>}</button>
}

function BayDetails({ bay, onClose, onAccept, onReject, reviewing }: { bay: SelectedBay; onClose: () => void; onAccept: (record: SortRecord) => void; onReject: (record: SortRecord) => void; reviewing: string | null }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="bay-details-title" onMouseDown={onClose}><Card className="max-h-[85vh] w-full max-w-3xl overflow-hidden shadow-xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-border p-5"><div><Eyebrow>{bay.name === 'Manual review' ? 'Human decision required' : 'Session-only image details'}</Eyebrow><h2 id="bay-details-title" className="mt-1 text-xl font-semibold" style={{ color: bay.color }}>{bay.name} · {bay.records.length} items</h2></div><Button variant="ghost" size="sm" onClick={onClose}><X /> Close</Button></div><div className="max-h-[65vh] overflow-y-auto p-5">{bay.name === 'Manual review' && <p className="mb-4 text-sm text-muted-foreground">Accept sends the item to the local model’s predicted bin. Reject asks Gemini to identify and annotate the image before you make the final call.</p>}{bay.records.length ? <div className="grid gap-4 sm:grid-cols-2">{bay.records.map((record) => <div key={record.id} className="overflow-hidden rounded-md border border-border bg-secondary/30"><img src={record.image.url} alt={`${record.label} uploaded item`} className="aspect-video w-full bg-secondary object-contain" /><div className="space-y-3 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium" title={record.image.file.name}>{record.image.file.name}</p><Badge tone={record.decision === 'PICK' ? 'success' : record.decision === 'REVIEW' ? 'warning' : 'neutral'}>{record.decision}</Badge></div><dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs"><div><dt className="text-muted-foreground">Detected as</dt><dd className="font-medium">{record.label}</dd></div><div><dt className="text-muted-foreground">Confidence</dt><dd className="font-medium">{record.detection ? percent(record.confidence) : 'No detection'}</dd></div></dl>{bay.name === 'Manual review' && <div className="flex gap-2 border-t border-border pt-3"><Button size="sm" className="flex-1" onClick={() => onAccept(record)}><Check /> Accept</Button><Button size="sm" variant="secondary" className="flex-1" disabled={reviewing === record.id} onClick={() => onReject(record)}>{reviewing === record.id ? <Loader2 className="animate-spin" /> : <Undo2 />} Reject & analyze</Button></div>}</div></div>)}</div> : <div className="rounded-md border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">No items have been routed here in this session.</div>}</div></Card></div>
}

function LlmConfirmation({ annotation, onAccept, onReject }: { annotation: LlmAnnotation; onAccept: () => void; onReject: () => void }) {
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true"><Card className="w-full max-w-xl overflow-hidden shadow-xl"><div className="border-b border-border p-5"><Eyebrow>Gemini structured analysis</Eyebrow><h2 className="mt-1 text-xl font-semibold">Confirm the LLM annotation</h2></div><div className="space-y-4 p-5 text-sm"><div className="rounded-md bg-secondary/60 p-3"><p><span className="text-muted-foreground">Image:</span> {annotation.imageName}</p><p className="mt-1"><span className="text-muted-foreground">Object:</span> {annotation.object}</p><p className="mt-1"><span className="text-muted-foreground">Category:</span> {annotation.category} · {percent(annotation.confidence)}</p><p className="mt-2 text-muted-foreground">{annotation.description}</p></div><div><p className="mb-2 font-medium">Object annotations</p>{annotation.annotations.map((item, index) => <div key={`${item.label}-${index}`} className="rounded border border-border px-3 py-2 text-xs"><span className="font-medium">{item.label}</span>{item.boundingBox && <span className="ml-2 text-muted-foreground">x {item.boundingBox.x}% · y {item.boundingBox.y}% · {item.boundingBox.width}% × {item.boundingBox.height}%</span>}</div>)}</div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={onReject}><X /> Keep in review</Button><Button onClick={onAccept}><Check /> Accept annotation</Button></div></div></Card></div>
}
