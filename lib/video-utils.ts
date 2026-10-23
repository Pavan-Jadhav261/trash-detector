import type { SourceVideoMeta } from '@/types/waste'

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
export const ACCEPT_ATTRIBUTE = 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'

export function validateVideoFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(extension)
  if (!isVideo) return 'This file is not a video. Choose an MP4, WebM, or MOV file.'
  if (file.size > MAX_VIDEO_BYTES) return 'This video is larger than 100 MB. Choose a shorter or compressed clip.'
  if (file.size === 0) return 'This file appears to be empty.'
  return null
}

export function readVideoMetadata(file: File, url: string): Promise<SourceVideoMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
    }
    video.onloadedmetadata = () => {
      const meta: SourceVideoMeta = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'video',
        lastModified: file.lastModified,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      }
      cleanup()
      resolve(meta)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('This video could not be decoded by your browser. Try an MP4 (H.264) file.'))
    }
    video.src = url
  })
}
