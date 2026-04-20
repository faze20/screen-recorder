import React, { useEffect } from 'react'
import IconButton from './IconButton.jsx'

export default function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} mx-4 bg-surface-panel border border-border-dark rounded-2xl shadow-glow`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
            <h2 className="text-base font-bold text-white">{title}</h2>
            <IconButton icon="close" size={18} onClick={onClose} />
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
