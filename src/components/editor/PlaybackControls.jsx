import React from 'react'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00.0'
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1).padStart(4, '0')
  return `${m}:${sec}`
}

export default function PlaybackControls({ isPlaying, currentTime, duration, onTogglePlay, onSeek, inTime = 0, outTime, disabled = false }) {
  const total = outTime ?? duration ?? 0
  const progress = total > 0 ? ((currentTime - inTime) / (total - inTime)) * 100 : 0

  const handleBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    onSeek?.(inTime + pct * (total - inTime))
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-canvas border-t border-border-dark">
      <IconButton icon="skip_previous" size={18} onClick={() => onSeek?.(inTime)} title="Go to start" disabled={disabled} />
      <IconButton
        icon={isPlaying ? 'pause' : 'play'}
        size={20}
        active={isPlaying}
        onClick={onTogglePlay}
        className="w-10 h-10"
        title={isPlaying ? 'Pause' : 'Play'}
        disabled={disabled}
      />
      <IconButton icon="skip_next" size={18} onClick={() => onSeek?.(total)} title="Go to end" disabled={disabled} />

      <div
        className="flex-1 h-1.5 bg-border-dark rounded-full cursor-pointer relative group"
        onClick={handleBarClick}
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${Math.min(100, Math.max(0, progress))}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <span className="font-mono text-xs text-gray-400 w-24 text-right">
        {fmtTime(currentTime)} / {fmtTime(total)}
      </span>
    </div>
  )
}
