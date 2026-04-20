import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import Button from '../components/ui/Button.jsx'
import IconButton from '../components/ui/IconButton.jsx'

const NAV = [
  { id: 'profile', icon: 'person', label: 'Profile' },
  { id: 'permissions', icon: 'security', label: 'Permissions' },
  { id: 'integrations', icon: 'link', label: 'Integrations' },
  { id: 'security', icon: 'lock', label: 'Security' },
  { id: 'team', icon: 'group', label: 'Team Settings' },
]

function PermissionCard({ icon, label, description, status, onRequest }) {
  const isGranted = status === 'granted'
  const isDenied = status === 'denied'

  return (
    <div className="flex items-start gap-4 p-4 bg-surface-canvas border border-border-dark rounded-xl">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isGranted ? 'bg-primary/20 text-primary' : isDenied ? 'bg-red-500/20 text-red-400' : 'bg-surface-panel text-gray-400'}`}>
        <Icon name={icon} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white">{label}</p>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isGranted ? 'bg-primary/20 text-primary' : isDenied ? 'bg-red-500/20 text-red-400' : 'bg-surface-panel text-gray-500'}`}>
            {isGranted ? 'Granted' : isDenied ? 'Denied' : 'Not set'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        {!isGranted && (
          <button
            onClick={onRequest}
            className="mt-2 text-xs text-primary hover:underline font-medium"
          >
            {isDenied ? 'Open browser settings →' : 'Grant permission →'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('permissions')
  const [permStates, setPermStates] = useState({
    screen: 'unknown',
    camera: 'unknown',
    microphone: 'unknown',
  })

  const requestPerm = async (type) => {
    try {
      if (type === 'camera' || type === 'microphone') {
        await navigator.mediaDevices.getUserMedia({
          video: type === 'camera',
          audio: type === 'microphone',
        })
        setPermStates(s => ({ ...s, [type]: 'granted' }))
      } else if (type === 'screen') {
        await navigator.mediaDevices.getDisplayMedia({ video: true })
        setPermStates(s => ({ ...s, screen: 'granted' }))
      }
    } catch {
      setPermStates(s => ({ ...s, [type]: 'denied' }))
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-bg-dark overflow-hidden">
      {/* Top bar (mobile) */}
      <div className="md:hidden h-14 flex items-center gap-3 px-4 border-b border-border-dark bg-surface-canvas shrink-0">
        <IconButton icon="arrow_back" onClick={() => navigate('/library')} />
        <span className="text-sm font-bold text-white">Settings</span>
      </div>

      {/* Mobile horizontal nav */}
      <div className="md:hidden flex overflow-x-auto border-b border-border-dark bg-surface-canvas px-2 py-1.5 gap-1 shrink-0">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
              activeSection === item.id
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-surface-panel',
            ].join(' ')}
          >
            <Icon name={item.icon} size={13} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-border-dark bg-surface-canvas flex-col">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-border-dark">
          <IconButton icon="arrow_back" onClick={() => navigate('/library')} />
          <span className="text-sm font-bold text-white">Settings</span>
        </div>
        <nav className="p-2 flex flex-col gap-0.5 flex-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeSection === item.id
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-panel',
              ].join(' ')}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-5 md:p-8">
        {activeSection === 'permissions' && (
          <div className="max-w-lg">
            <h2 className="text-base font-bold text-white mb-1">Permissions</h2>
            <p className="text-sm text-gray-500 mb-6">Grant browser permissions needed for recording.</p>
            <div className="space-y-3">
              <PermissionCard
                icon="monitor"
                label="Screen Capture"
                description="Required to record your screen and capture system audio."
                status={permStates.screen}
                onRequest={() => requestPerm('screen')}
              />
              <PermissionCard
                icon="videocam"
                label="Camera"
                description="Required for webcam overlay during recording."
                status={permStates.camera}
                onRequest={() => requestPerm('camera')}
              />
              <PermissionCard
                icon="mic"
                label="Microphone"
                description="Required to capture your voice during recording."
                status={permStates.microphone}
                onRequest={() => requestPerm('microphone')}
              />
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-lg">
            <h2 className="text-base font-bold text-white mb-1">Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your account information.</p>
            <div className="flex items-center gap-4 p-4 bg-surface-canvas border border-border-dark rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="person" size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">User</p>
                <p className="text-sm text-gray-500">Free Plan</p>
              </div>
            </div>
          </div>
        )}

        {(activeSection === 'integrations' || activeSection === 'security' || activeSection === 'team') && (
          <div className="max-w-lg flex flex-col items-center justify-center min-h-64 gap-3 text-center">
            <Icon name="layers" size={32} className="text-gray-700" />
            <p className="text-white font-medium capitalize">{activeSection}</p>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        )}
      </main>
    </div>
  )
}
