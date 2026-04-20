import React, { useState } from 'react'
import Panel from '../layout/Panel.jsx'
import Toggle from '../ui/Toggle.jsx'
import Slider from '../ui/Slider.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '4:3', label: '4:3 (Classic)' },
  { value: '1:1', label: '1:1 (Square)' },
]

export default function PropertiesPanel({ metadata, onMetadataChange }) {
  const [tab, setTab] = useState('visual')

  if (!metadata) return null

  const { webcam, background, aspectRatio, trims, zoomSegments } = metadata

  return (
    <aside className="w-72 flex flex-col border-l border-border-dark bg-surface-canvas overflow-y-auto">
      {/* Tabs */}
      <div className="flex border-b border-border-dark shrink-0">
        {['visual', 'audio', 'layout'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors',
              tab === t
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-white',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'visual' && (
        <>
          <Panel title="Background">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={background}
                onChange={e => onMetadataChange?.({ background: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer bg-transparent border border-border-dark"
              />
              <Input
                value={background}
                onChange={v => onMetadataChange?.({ background: v })}
                placeholder="#0c1a13"
                className="flex-1"
              />
            </div>
          </Panel>

          <Panel title="Aspect Ratio">
            <Select
              value={aspectRatio}
              onChange={v => onMetadataChange?.({ aspectRatio: v })}
              options={ASPECT_RATIOS}
            />
          </Panel>

          <Panel title="Webcam Overlay">
            <div className="space-y-3">
              <Toggle
                checked={webcam?.visible ?? false}
                onChange={v => onMetadataChange?.({ webcam: { ...webcam, visible: v } })}
                label="Show webcam"
              />
              {webcam?.visible && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">X</label>
                      <Input
                        type="number"
                        value={webcam.x ?? 16}
                        onChange={v => onMetadataChange?.({ webcam: { ...webcam, x: Number(v) } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Y</label>
                      <Input
                        type="number"
                        value={webcam.y ?? 16}
                        onChange={v => onMetadataChange?.({ webcam: { ...webcam, y: Number(v) } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Width</label>
                      <Input
                        type="number"
                        value={webcam.width ?? 240}
                        onChange={v => onMetadataChange?.({ webcam: { ...webcam, width: Number(v) } })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Height</label>
                      <Input
                        type="number"
                        value={webcam.height ?? 135}
                        onChange={v => onMetadataChange?.({ webcam: { ...webcam, height: Number(v) } })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </>
      )}

      {tab === 'layout' && (
        <Panel title="Trim">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">In Point (s)</label>
              <Input
                type="number"
                value={(trims?.inTime ?? 0).toFixed(2)}
                onChange={v => onMetadataChange?.({ trims: { ...trims, inTime: Number(v) } })}
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Out Point (s)</label>
              <Input
                type="number"
                value={(trims?.outTime ?? 0).toFixed(2)}
                onChange={v => onMetadataChange?.({ trims: { ...trims, outTime: Number(v) } })}
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </Panel>
      )}

      {tab === 'audio' && (
        <div className="p-4 text-sm text-gray-500 flex flex-col items-center justify-center gap-2 min-h-32">
          <Icon name="music_note" size={24} className="text-gray-700" />
          <p>Audio settings coming soon</p>
        </div>
      )}
    </aside>
  )
}
