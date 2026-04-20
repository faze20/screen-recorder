import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'

function fmtDuration(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RecordingCard({ recording, onDelete }) {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)

  return (
    <div
      className="group relative bg-surface-panel border border-border-dark rounded-xl overflow-hidden cursor-pointer hover:border-border-subtle hover:shadow-glow transition-all duration-200"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/editor/${recording.id}`)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-surface-canvas flex items-center justify-center overflow-hidden relative">
        {recording.thumbnail ? (
          <img src={recording.thumbnail} alt={recording.name} className="w-full h-full object-cover" />
        ) : (
          <Icon name="movie" size={32} className="text-gray-700" />
        )}

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-1.5 py-0.5 rounded">
          {fmtDuration(recording.duration)}
        </span>

        {/* Hover overlay */}
        {hover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Icon name="play" size={22} className="text-bg-dark" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-white truncate">{recording.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{fmtDate(recording.createdAt)}</p>
      </div>

      {/* Actions */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
        onClick={e => e.stopPropagation()}
      >
        <IconButton
          icon="delete"
          size={14}
          className="w-7 h-7 bg-black/60 backdrop-blur text-red-400 hover:text-red-300 hover:bg-red-500/20"
          onClick={() => onDelete?.(recording.id)}
        />
      </div>
    </div>
  )
}
