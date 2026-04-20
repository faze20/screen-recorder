import React from 'react'

const variants = {
  primary: 'bg-primary text-bg-dark font-bold hover:shadow-neon-lg active:scale-95 shadow-neon',
  secondary: 'bg-surface-panel text-white border border-border-dark hover:bg-surface-dark',
  ghost: 'text-gray-400 hover:text-white hover:bg-surface-panel',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-all duration-150 select-none',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
