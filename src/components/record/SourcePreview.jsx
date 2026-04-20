import React, { useRef, useEffect } from 'react'
import Icon from '../ui/Icon.jsx'

export default function SourcePreview({ stream, isRecording, duration }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const fmt = s => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  return (
    <div className="relative flex-1 flex items-center justify-center bg-surface-canvas rounded-xl overflow-hidden border border-border-dark">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-center select-none">
          <div className="w-20 h-20 rounded-2xl bg-surface-panel border border-dashed border-border-dark flex items-center justify-center">
            <Icon name="monitor" size={32} className="text-gray-600" />
          </div>
          <div>
            <p className="text-white font-medium">Select a source to preview</p>
            <p className="text-sm text-gray-500 mt-1">Click "Start Recording" to begin capturing your screen</p>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-sm font-medium text-white tracking-wider">{fmt(duration)}</span>
        </div>
      )}
    </div>
  )
}
