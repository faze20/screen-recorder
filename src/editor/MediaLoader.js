const LOAD_TIMEOUT = 5000

export function loadVideo(url) {
  return new Promise((resolve, reject) => {
    if (!url) { resolve(null); return }

    const video = document.createElement('video')
    video.src = url
    video.preload = 'auto'
    video.playsInline = true
    video.muted = true

    let settled = false
    const settle = (fn, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(value)
    }

    const timer = setTimeout(() => settle(resolve, video), LOAD_TIMEOUT)

    const onLoaded = () => {
      cleanup()
      if (!isFinite(video.duration) || isNaN(video.duration)) {
        // WebM Infinity duration workaround — seek far ahead to force duration calculation
        video.currentTime = 1e10
        const onUpdate = () => {
          video.removeEventListener('timeupdate', onUpdate)
          video.currentTime = 0
          settle(resolve, video)
        }
        video.addEventListener('timeupdate', onUpdate)
      } else {
        settle(resolve, video)
      }
    }

    const onError = () => {
      cleanup()
      settle(reject, new Error('Failed to load video'))
    }

    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', onError)
    }

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('error', onError)
    video.load()
  })
}
