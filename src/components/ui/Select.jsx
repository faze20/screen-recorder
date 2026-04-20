import React from 'react'
import Icon from './Icon.jsx'

export default function Select({ value, onChange, options = [], className = '', disabled = false }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className={[
          'w-full bg-surface-canvas border border-border-dark rounded-lg px-3 py-2 pr-8',
          'text-sm text-white focus:outline-none focus:border-primary/50',
          'transition-colors duration-150',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
      >
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <Icon name="chevron_down" size={14} />
      </div>
    </div>
  )
}
