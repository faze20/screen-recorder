import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import IconButton from '../ui/IconButton.jsx'

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary/15 text-primary border border-primary/20'
          : 'text-gray-400 hover:text-white hover:bg-surface-panel',
      ].join(' ')}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  )
}

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const handleNav = (to) => {
    navigate(to)
    onMobileClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={[
        'flex flex-col bg-surface-canvas border-r border-border-dark shrink-0',
        'fixed top-0 left-0 h-full z-40 w-64 transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:translate-x-0 md:w-56 md:z-auto md:h-auto md:transition-none',
      ].join(' ')}>

        {/* Logo + mobile close */}
        <div className="h-14 flex items-center justify-between gap-2 px-4 border-b border-border-dark">
          <div
            onClick={() => handleNav('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Icon name="radio_button_checked" size={22} className="text-primary" />
            <span className="text-white text-base font-bold tracking-wide">GMSSRecord</span>
          </div>
          <IconButton
            icon="close"
            onClick={onMobileClose}
            className="md:hidden"
            title="Close menu"
          />
        </div>

        {/* New recording */}
        <div className="p-3">
          <Button variant="primary" fullWidth onClick={() => handleNav('/record')} size="sm">
            <Icon name="add" size={16} />
            New Recording
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-600 px-3 py-2">Workspace</p>
          <NavItem icon="grid_view" label="Dashboard" active={path === '/library'} onClick={() => handleNav('/library')} />
          <NavItem icon="movie" label="Library" active={false} onClick={() => handleNav('/library')} />
          <NavItem icon="scissors" label="Editor" active={path.startsWith('/editor')} onClick={() => {}} />

          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-600 px-3 py-2 mt-3">Organize</p>
          <NavItem icon="folder" label="Collections" active={false} onClick={() => {}} />
          <NavItem icon="star" label="Favorites" active={false} onClick={() => {}} />
        </nav>

        {/* Bottom */}
        <div className="border-t border-border-dark p-3 space-y-1">
          <NavItem icon="settings" label="Settings" active={path === '/settings'} onClick={() => handleNav('/settings')} />
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Icon name="person" size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">User</p>
              <p className="text-[10px] text-gray-500 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
