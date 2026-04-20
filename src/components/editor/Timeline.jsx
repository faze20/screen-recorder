import React, { useRef, useCallback, useEffect } from 'react'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function Timeline({
  duration = 0,
  currentTime = 0,
  inTime = 0,
  outTime,
  onScrubStart,
  onScrubTo,
  onScrubEnd,
  onTrimIn,
  onTrimOut,
  zoomSegments = [],
}) {
  const railRef = useRef(null)
  const scrubbing = useRef(false)
  const total = outTime ?? duration

  const timeToPercent = (t) => total > 0 ? ((t - 0) / duration) * 100 : 0

  const getTimeFromEvent = useCallback((e) => {
    const rect = railRef.current?.getBoundingClientRect()
    if (!rect) return 0
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    return pct * duration
  }, [duration])

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    scrubbing.current = true
    onScrubStart?.()
    onScrubTo?.(getTimeFromEvent(e))
  }, [onScrubStart, onScrubTo, getTimeFromEvent])

  const onPointerMove = useCallback((e) => {
    if (!scrubbing.current) return
    onScrubTo?.(getTimeFromEvent(e))
  }, [onScrubTo, getTimeFromEvent])

  const onPointerUp = useCallback((e) => {
    if (!scrubbing.current) return
    scrubbing.current = false
    onScrubTo?.(getTimeFromEvent(e))
    onScrubEnd?.()
  }, [onScrubTo, onScrubEnd, getTimeFromEvent])

  // Ruler ticks
  const ticks = []
  if (duration > 0) {
    const step = duration <= 30 ? 5 : duration <= 120 ? 15 : 30
    for (let t = 0; t <= duration; t += step) {
      ticks.push(t)
    }
  }

  const playheadLeft = `${timeToPercent(currentTime)}%`

  return (
    <div className="flex flex-col bg-surface-canvas border-t border-border-dark select-none" style={{ minHeight: 100 }}>
      {/* Ruler */}
      <div className="h-6 relative border-b border-border-dark px-0">
        <div className="absolute inset-0 flex items-end pb-1">
          {ticks.map(t => (
            <div
              key={t}
              className="absolute flex flex-col items-center"
              style={{ left: `${timeToPercent(t)}%` }}
            >
              <span className="text-[9px] font-mono text-gray-600">{fmtTime(t)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Track area */}
      <div
        ref={railRef}
        className="relative flex-1 mx-3 my-2 cursor-col-resize"
        style={{ minHeight: 56 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Main track */}
        <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ top: 8, bottom: 8 }}>
          {/* Track background */}
          <div className="absolute inset-0 bg-track-bg/30 rounded-lg" />

          {/* Clip bar */}
          <div
            className="absolute inset-y-0 bg-surface-panel rounded-lg border border-border-dark"
            style={{
              left: `${timeToPercent(inTime)}%`,
              right: `${100 - timeToPercent(total)}%`,
            }}
          >
            {/* Waveform decoration */}
            <div className="absolute inset-0 flex items-center gap-px px-2 overflow-hidden">
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className="bg-waveform rounded-sm"
                  style={{
                    width: 2,
                    height: `${20 + Math.sin(i * 0.7) * 15 + Math.random() * 10}%`,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Zoom segments */}
          {zoomSegments.map(z => (
            <div
              key={z.id}
              className="absolute inset-y-0 bg-primary/20 border border-primary/40 rounded"
              style={{
                left: `${timeToPercent(z.start)}%`,
                width: `${timeToPercent(z.end) - timeToPercent(z.start)}%`,
                top: 4,
                bottom: 4,
              }}
            />
          ))}
        </div>

        {/* Playhead */}
        {duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
            style={{ left: playheadLeft }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-sm rotate-45" />
          </div>
        )}
      </div>
    </div>
  )
}
