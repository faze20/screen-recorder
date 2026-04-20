import React from 'react'

export default function Toggle({ checked = false, onChange, disabled = false, label }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div
        className={[
          'relative w-10 h-5 rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-surface-panel border border-border-dark',
        ].join(' ')}
        onClick={() => !disabled && onChange?.(!checked)}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  )
}
