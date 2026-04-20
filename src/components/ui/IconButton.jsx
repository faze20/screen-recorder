import React from 'react'
import Icon from './Icon.jsx'

export default function IconButton({
  icon,
  size = 20,
  active = false,
  disabled = false,
  onClick,
  className = '',
  title,
  children,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center rounded-lg w-9 h-9',
        'transition-all duration-150 select-none',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-gray-400 hover:text-white hover:bg-surface-panel',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {icon ? <Icon name={icon} size={size} /> : children}
    </button>
  )
}
