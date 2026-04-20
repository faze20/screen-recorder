import React from 'react'
import IconButton from '../ui/IconButton.jsx'

const TOOLS = [
  { id: 'select', icon: 'move', title: 'Select' },
  { id: 'cut', icon: 'content_cut', title: 'Cut' },
  { id: 'zoom', icon: 'zoom_in', title: 'Zoom' },
  { id: 'text', icon: 'title', title: 'Text' },
  { id: 'crop', icon: 'crop', title: 'Crop' },
]

export default function ToolRail({ activeTool, onToolChange, className = '' }) {
  return (
    <div className={['w-12 flex flex-col items-center gap-1 py-3 border-r border-border-dark bg-surface-canvas', className].join(' ')}>
      {TOOLS.map(tool => (
        <IconButton
          key={tool.id}
          icon={tool.icon}
          title={tool.title}
          active={activeTool === tool.id}
          onClick={() => onToolChange?.(tool.id)}
          size={18}
        />
      ))}
    </div>
  )
}
