import { renderFrame } from '../editor/CanvasRenderer.js'
import { getSupportedMimeType } from '../recording/recorderManager.js'

const QUALITY_PRESETS = {
  '720p': { width: 1280, height: 720, bitrate: 2_500_000 },
  '1080p': { width: 1920, height: 1080, bitrate: 5_000_000 },
  '4k': { width: 3840, height: 2160, bitrate: 15_000_000 },
}

function waitForNextFrame(fps) {
  return new Promise(resolve => setTimeout(resolve, 1000 / fps))
}

export async function exportRecording({ screenVideo, webcamVideo, metadata, config, onProgress, signal }) {
  const { quality = '1080p', fps = 30 } = config
  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS['1080p']

  const { inTime, outTime } = metadata.trims
  const totalDuration = outTime - inTime

  const canvas = document.createElement('canvas')
  canvas.width = preset.width
  canvas.height = preset.height
  const ctx = canvas.getContext('2d')

  const mimeType = getSupportedMimeType()
  const canvasStream = canvas.captureStream(fps)

  // Mix audio from screen video
  let audioContext = null
  let audioTracks = []

  try {
    if (screenVideo?.src || screenVideo?.srcObject) {
      audioContext = new AudioContext()
      const dest = audioContext.createMediaStreamDestination()
      try {
        const src = audioContext.createMediaElementSource(screenVideo)
        src.connect(dest)
        src.connect(audioContext.destination)
      } catch {
        // already connected or no audio
      }
      audioTracks = dest.stream.getAudioTracks()
    }
  } catch {
    // audio not available
  }

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioTracks,
  ])

  const chunks = []
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: preset.bitrate,
  })
  recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data) }

  recorder.start(100)

  // Seek source video to in point
  if (screenVideo) {
    screenVideo.currentTime = inTime
    screenVideo.muted = false
    await screenVideo.play().catch(() => {})
  }
  if (webcamVideo) {
    webcamVideo.currentTime = inTime
    await webcamVideo.play().catch(() => {})
  }

  const frameStep = 1 / fps

  for (let time = inTime; time < outTime; time += frameStep) {
    if (signal?.aborted) break

    renderFrame(ctx, {
      time,
      stageW: canvas.width,
      stageH: canvas.height,
      screenVideo,
      webcamVideo,
      metadata,
    })

    const progress = ((time - inTime) / totalDuration) * 100
    onProgress?.(Math.min(99, progress))
    await waitForNextFrame(fps)
  }

  // Final frame
  renderFrame(ctx, {
    time: outTime,
    stageW: canvas.width,
    stageH: canvas.height,
    screenVideo,
    webcamVideo,
    metadata,
  })

  screenVideo?.pause()
  webcamVideo?.pause()
  audioContext?.close()

  await new Promise(resolve => {
    recorder.onstop = resolve
    recorder.stop()
  })

  onProgress?.(100)

  return {
    blob: new Blob(chunks, { type: mimeType }),
    duration: totalDuration,
    mimeType,
  }
}
