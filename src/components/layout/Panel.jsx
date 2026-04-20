import React, { useState } from 'react'
import Icon from '../ui/Icon.jsx'

export default function Panel({ title, children, defaultOpen = true, className = '' }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`border-b border-border-dark ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-panel/30 transition-colors"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{title}</span>
        <Icon name={open ? 'chevron_up' : 'chevron_down'} size={14} className="text-gray-500" />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
