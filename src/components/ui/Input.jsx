import React from 'react'

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  prefix,
  suffix,
  disabled = false,
  ...props
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span className="absolute left-3 text-gray-500 text-sm pointer-events-none">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          'w-full bg-surface-canvas border border-border-dark rounded-lg px-3 py-2 text-sm text-white',
          'placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors duration-150',
          prefix ? 'pl-8' : '',
          suffix ? 'pr-8' : '',
          disabled ? 'opacity-40' : '',
        ].join(' ')}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 text-gray-500 text-sm pointer-events-none">{suffix}</span>
      )}
    </div>
  )
}
