import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'

export default function TopBar({ title, subtitle, actions, showBreadcrumb = false }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border-dark bg-surface-canvas shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => navigate('/library')}>
          <Icon name="radio_button_checked" size={22} className="text-primary" />
          <span className="text-white text-base font-bold tracking-wide">FocusRecord</span>
        </div>
        {showBreadcrumb && (
          <>
            <span className="text-gray-600">/</span>
            <button onClick={() => navigate('/library')} className="text-sm text-gray-400 hover:text-white transition-colors">
              Library
            </button>
            {title && (
              <>
                <span className="text-gray-600">/</span>
                <span className="text-sm text-gray-200 truncate max-w-48">{title}</span>
              </>
            )}
          </>
        )}
        {!showBreadcrumb && title && (
          <>
            <div className="w-px h-4 bg-border-dark" />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{title}</p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {actions}
        <IconButton icon="settings" onClick={() => navigate('/settings')} title="Settings" />
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Icon name="person" size={16} className="text-primary" />
        </div>
      </div>
    </header>
  )
}
