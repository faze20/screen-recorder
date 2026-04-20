import React from 'react'
import Toggle from '../ui/Toggle.jsx'
import Icon from '../ui/Icon.jsx'

export default function SourcesPanel({ wantScreen, wantCamera, onToggleScreen, onToggleCamera }) {
  return (
    <div className="space-y-3">
      <SourceRow
        icon="monitor"
        label="Full Screen"
        subLabel="Capture your entire display"
        checked={wantScreen}
        onChange={onToggleScreen}
      />
      <SourceRow
        icon="videocam"
        label="FaceCam"
        subLabel="Webcam overlay"
        checked={wantCamera}
        onChange={onToggleCamera}
      />
    </div>
  )
}

function SourceRow({ icon, label, subLabel, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-canvas border border-border-dark hover:border-border-subtle transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${checked ? 'bg-primary/20 text-primary' : 'bg-surface-panel text-gray-500'}`}>
          <Icon name={icon} size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-[11px] text-gray-500">{subLabel}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
