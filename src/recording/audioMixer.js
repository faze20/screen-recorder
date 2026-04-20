export function createAudioMixer(streams = []) {
  const ctx = new AudioContext()
  const dest = ctx.createMediaStreamDestination()

  const sources = streams
    .filter(s => s && s.getAudioTracks().length > 0)
    .map(s => {
      const source = ctx.createMediaStreamSource(s)
      source.connect(dest)
      return source
    })

  return {
    stream: dest.stream,
    context: ctx,
    close() {
      sources.forEach(s => s.disconnect())
      ctx.close()
    },
  }
}

export function createExportAudioMixer(videoEl, audioEl) {
  const ctx = new AudioContext()
  const dest = ctx.createMediaStreamDestination()

  if (videoEl) {
    try {
      const src = ctx.createMediaElementSource(videoEl)
      src.connect(dest)
    } catch {
      // already connected
    }
  }
  if (audioEl) {
    try {
      const src = ctx.createMediaElementSource(audioEl)
      src.connect(dest)
    } catch {
      // already connected
    }
  }

  return {
    stream: dest.stream,
    context: ctx,
    close() { ctx.close() },
  }
}
