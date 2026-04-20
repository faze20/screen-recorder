import { createAudioMixer } from './audioMixer.js'
import { createRecorder, getSupportedMimeType, validateBlob } from './recorderManager.js'

const STATES = { IDLE: 'IDLE', READY: 'READY', RECORDING: 'RECORDING', STOPPED: 'STOPPED' }

export function createCaptureManager() {
  let state = STATES.IDLE
  let screenStream = null
  let micStream = null
  let cameraStream = null
  let audioMixer = null
  let screenRecorder = null
  let webcamRecorder = null
  let screenChunks = []
  let webcamChunks = []
  let startTime = 0

  async function requestScreenStream() {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 60, displaySurface: 'monitor' },
      audio: true,
    })
    return screenStream
  }

  async function requestMicStream() {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    return micStream
  }

  async function requestCameraStream() {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    return cameraStream
  }

  function stopAllTracks(stream) {
    stream?.getTracks().forEach(t => t.stop())
  }

  async function prepare({ wantMic, wantCamera }) {
    if (state !== STATES.IDLE) throw new Error('CaptureManager not idle')

    await requestScreenStream()
    if (wantMic) {
      try { await requestMicStream() } catch (e) { console.warn('Mic denied:', e) }
    }
    if (wantCamera) {
      try { await requestCameraStream() } catch (e) { console.warn('Camera denied:', e) }
    }

    // Handle screen share ending
    screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (state === STATES.RECORDING) stop()
    })

    state = STATES.READY
    return {
      screenStream,
      micStream,
      cameraStream,
    }
  }

  function start() {
    if (state !== STATES.READY) throw new Error('Not ready')

    const audioStreams = [
      ...(screenStream?.getAudioTracks().length ? [screenStream] : []),
      ...(micStream ? [micStream] : []),
    ]

    // Build combined video+audio stream for screen recorder
    const combinedTracks = [...screenStream.getVideoTracks()]
    if (audioStreams.length > 0) {
      audioMixer = createAudioMixer(audioStreams)
      audioMixer.stream.getAudioTracks().forEach(t => combinedTracks.push(t))
    }

    const combinedStream = new MediaStream(combinedTracks)

    screenChunks = []
    screenRecorder = createRecorder(
      combinedStream,
      chunk => screenChunks.push(chunk),
      () => {}
    )
    screenRecorder.start(250)

    if (cameraStream) {
      webcamChunks = []
      webcamRecorder = createRecorder(
        cameraStream,
        chunk => webcamChunks.push(chunk),
        () => {}
      )
      webcamRecorder.start(250)
    }

    startTime = Date.now()
    state = STATES.RECORDING
  }

  function stop() {
    if (state !== STATES.RECORDING) return Promise.resolve(null)

    return new Promise(resolve => {
      const duration = (Date.now() - startTime) / 1000
      let screenDone = false
      let webcamDone = !webcamRecorder

      function tryResolve() {
        if (!screenDone || !webcamDone) return

        const mimeType = getSupportedMimeType()
        const screenBlob = validateBlob(new Blob(screenChunks, { type: mimeType }))
          ? new Blob(screenChunks, { type: mimeType })
          : null
        const webcamBlob = webcamChunks.length > 0
          ? new Blob(webcamChunks, { type: mimeType })
          : null

        cleanup()
        resolve({ screenBlob, webcamBlob, duration })
      }

      screenRecorder.onstop = () => { screenDone = true; tryResolve() }
      if (webcamRecorder) {
        webcamRecorder.onstop = () => { webcamDone = true; tryResolve() }
      }

      screenRecorder.stop()
      webcamRecorder?.stop()
      state = STATES.STOPPED
    })
  }

  function cleanup() {
    audioMixer?.close()
    stopAllTracks(screenStream)
    stopAllTracks(micStream)
    stopAllTracks(cameraStream)
    screenStream = null
    micStream = null
    cameraStream = null
    audioMixer = null
    screenRecorder = null
    webcamRecorder = null
    state = STATES.IDLE
  }

  function getState() { return state }

  function getStreams() { return { screenStream, micStream, cameraStream } }

  return { prepare, start, stop, cleanup, getState, getStreams }
}
