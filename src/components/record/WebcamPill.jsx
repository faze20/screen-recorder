import React, { useRef, useEffect } from 'react'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'

export default function WebcamPill({ stream, visible, onToggleVisible, onToggleMic, micActive }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur border border-white/10 rounded-full px-3 py-1.5">
        <div className="w-12 h-9 rounded-lg overflow-hidden bg-surface-panel">
          {visible && (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          )}
          {!visible && (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="videocam_off" size={14} className="text-gray-500" />
            </div>
          )}
        </div>
        <IconButton
          icon={visible ? 'videocam' : 'videocam_off'}
          size={16}
          active={visible}
          onClick={onToggleVisible}
        />
        <IconButton
          icon={micActive ? 'mic' : 'mic_off'}
          size={16}
          active={micActive}
          onClick={onToggleMic}
        />
      </div>
    </div>
  )
}
