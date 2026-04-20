import React from 'react'
import Select from '../ui/Select.jsx'

const RESOLUTION_OPTIONS = [
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '720p', label: '720p (HD)' },
  { value: '4k', label: '4K (Ultra HD)' },
]

const FPS_OPTIONS = [
  { value: '60', label: '60 FPS' },
  { value: '30', label: '30 FPS' },
]

export default function QualityPanel({ resolution, fps, onResolutionChange, onFpsChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Resolution</label>
        <Select value={resolution} onChange={onResolutionChange} options={RESOLUTION_OPTIONS} />
      </div>
      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Frame Rate</label>
        <Select value={fps} onChange={onFpsChange} options={FPS_OPTIONS} />
      </div>
    </div>
  )
}
