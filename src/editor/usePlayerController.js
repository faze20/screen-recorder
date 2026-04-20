import { useRef, useState, useCallback, useEffect } from 'react'
import { EPSILON } from './CanvasRenderer.js'

export function usePlayerController({ screenVideoRef, canvasRef, metadata, renderFrameFn }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)

  const isPlayingRef = useRef(false)
  const isScrubbingRef = useRef(false)
  const currentTimeRef = useRef(0)
  const wasPlayingRef = useRef(false)
  const rafRef = useRef(null)

  // Always-fresh metadata without causing tick recreation
  const metadataRef = useRef(metadata)
  metadataRef.current = metadata

  const getOutTime = useCallback(() => metadataRef.current?.trims?.outTime ?? 0, [])
  const getInTime = useCallback(() => metadataRef.current?.trims?.inTime ?? 0, [])

  // Tick reads time from the video element itself — it's the source of truth
  const tick = useCallback(() => {
    if (!isPlayingRef.current || isScrubbingRef.current) return

    const screenVid = screenVideoRef.current
    const outTime = getOutTime()

    // Use the video's actual currentTime so canvas stays locked to media
    const time = screenVid ? screenVid.currentTime : currentTimeRef.current

    if (time >= outTime - EPSILON) {
      isPlayingRef.current = false
      setIsPlaying(false)
      currentTimeRef.current = outTime
      setCurrentTime(outTime)
      screenVid?.pause()
      renderFrameFn?.(outTime)
      return
    }

    currentTimeRef.current = time
    setCurrentTime(time)
    renderFrameFn?.(time)

    rafRef.current = requestAnimationFrame(tick)
  }, [screenVideoRef, getOutTime, renderFrameFn])

  const play = useCallback(() => {
    if (isPlayingRef.current) return

    const outTime = getOutTime()
    const inTime = getInTime()

    if (currentTimeRef.current >= outTime - EPSILON) {
      currentTimeRef.current = inTime
      setCurrentTime(inTime)
    }

    const screenVid = screenVideoRef.current
    if (screenVid) {
      screenVid.currentTime = currentTimeRef.current
      screenVid.play().then(() => {
        isPlayingRef.current = true
        setIsPlaying(true)
        rafRef.current = requestAnimationFrame(tick)
      }).catch(err => {
        console.error('[Player] video.play() failed:', err)
      })
    } else {
      // No video element — advance by wall clock (canvas-only mode)
      isPlayingRef.current = true
      setIsPlaying(true)
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick, getOutTime, getInTime, screenVideoRef])

  const pause = useCallback(() => {
    if (!isPlayingRef.current) return
    isPlayingRef.current = false
    setIsPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    screenVideoRef.current?.pause()
  }, [screenVideoRef])

  const seek = useCallback((time) => {
    const clamped = Math.max(getInTime(), Math.min(getOutTime(), time))
    currentTimeRef.current = clamped
    setCurrentTime(clamped)
    if (screenVideoRef.current) screenVideoRef.current.currentTime = clamped
    renderFrameFn?.(clamped)
  }, [getInTime, getOutTime, screenVideoRef, renderFrameFn])

  const scrubStart = useCallback(() => {
    wasPlayingRef.current = isPlayingRef.current
    if (isPlayingRef.current) pause()
    isScrubbingRef.current = true
    setIsScrubbing(true)
  }, [pause])

  const scrubTo = useCallback((time) => {
    currentTimeRef.current = time
    setCurrentTime(time)
    if (screenVideoRef.current) screenVideoRef.current.currentTime = time
    renderFrameFn?.(time)
  }, [screenVideoRef, renderFrameFn])

  const scrubEnd = useCallback(() => {
    isScrubbingRef.current = false
    setIsScrubbing(false)
    if (wasPlayingRef.current) play()
  }, [play])

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) pause()
    else play()
  }, [play, pause])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return { isPlaying, currentTime, isScrubbing, play, pause, seek, scrubStart, scrubTo, scrubEnd, togglePlay }
}
