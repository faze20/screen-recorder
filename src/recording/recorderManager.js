const PREFERRED_MIMETYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

export function getSupportedMimeType() {
  return PREFERRED_MIMETYPES.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'
}

export function createRecorder(stream, onDataAvailable, onStop) {
  const mimeType = getSupportedMimeType()
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 })

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) onDataAvailable(e.data)
  }
  recorder.onstop = onStop

  return recorder
}

export function validateBlob(blob) {
  return blob && blob.size > 0
}
