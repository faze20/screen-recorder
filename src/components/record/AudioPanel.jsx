import React from 'react'
import Toggle from '../ui/Toggle.jsx'
import Select from '../ui/Select.jsx'
import Icon from '../ui/Icon.jsx'

export default function AudioPanel({ wantMic, onToggleMic, micDevices = [], selectedMic, onMicChange, noiseCancel, onToggleNoise }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="mic" size={16} className={wantMic ? 'text-primary' : 'text-gray-500'} />
          <span className="text-sm text-white">Microphone</span>
        </div>
        <Toggle checked={wantMic} onChange={onToggleMic} />
      </div>

      {wantMic && (
        <>
          <Select
            value={selectedMic}
            onChange={onMicChange}
            options={micDevices.length > 0
              ? micDevices.map(d => ({ value: d.deviceId, label: d.label || 'Microphone' }))
              : [{ value: 'default', label: 'Default Microphone' }]
            }
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Noise Cancellation</span>
            <Toggle checked={noiseCancel} onChange={onToggleNoise} />
          </div>
        </>
      )}
    </div>
  )
}
