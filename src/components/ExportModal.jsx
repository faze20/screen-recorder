import React, { useState, useRef } from 'react'
import Modal from './ui/Modal.jsx'
import Button from './ui/Button.jsx'
import Select from './ui/Select.jsx'
import Icon from './ui/Icon.jsx'
import { exportRecording } from '../export/ExportService.js'

const QUALITY_OPTIONS = [
  { value: '1080p', label: '1080p – Full HD (5 Mbps)' },
  { value: '720p', label: '720p – HD (2.5 Mbps)' },
  { value: '4k', label: '4K – Ultra HD (15 Mbps)' },
]

const FPS_OPTIONS = [
  { value: '30', label: '30 fps' },
  { value: '60', label: '60 fps' },
]

export default function ExportModal({ open, onClose, recording, metadata, screenVideoRef, webcamVideoRef }) {
  const [quality, setQuality] = useState('1080p')
  const [fps, setFps] = useState('30')
  const [progress, setProgress] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const abortRef = useRef(null)

  const handleExport = async () => {
    if (!metadata || !screenVideoRef?.current) return

    setExporting(true)
    setProgress(0)
    setDone(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await exportRecording({
        screenVideo: screenVideoRef.current,
        webcamVideo: webcamVideoRef?.current,
        metadata,
        config: { quality, fps: Number(fps) },
        onProgress: setProgress,
        signal: controller.signal,
      })

      if (!controller.signal.aborted) {
        const url = URL.createObjectURL(result.blob)
        setDownloadUrl(url)
        setDone(true)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl || !recording) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${recording.name.replace(/[^a-z0-9]/gi, '_')}.webm`
    a.click()
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    setExporting(false)
    setProgress(0)
  }

  const handleClose = () => {
    if (exporting) handleCancel()
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDone(false)
    setDownloadUrl(null)
    setProgress(0)
    onClose?.()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Export Recording" width="max-w-sm">
      {done ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Icon name="check_circle" size={32} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-white">Export Complete!</p>
            <p className="text-sm text-gray-400 mt-1">{quality} · {fps} fps</p>
          </div>
          <Button variant="primary" fullWidth onClick={handleDownload}>
            <Icon name="download" size={16} />
            Download Video
          </Button>
          <Button variant="ghost" fullWidth onClick={handleClose}>Close</Button>
        </div>
      ) : exporting ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Icon name="loading" size={20} className="text-primary animate-spin" />
            <span className="text-sm text-white">Exporting… {Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-surface-canvas rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button variant="danger" fullWidth onClick={handleCancel}>Cancel</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Quality</label>
            <Select value={quality} onChange={setQuality} options={QUALITY_OPTIONS} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Frame Rate</label>
            <Select value={fps} onChange={setFps} options={FPS_OPTIONS} />
          </div>
          <div className="p-3 bg-surface-canvas border border-border-dark rounded-lg text-xs text-gray-500 space-y-1">
            <p>Format: WebM (VP8/VP9 + Opus)</p>
            <p>Duration: {recording ? `${Math.floor((recording.duration ?? 0) / 60)}:${Math.floor((recording.duration ?? 0) % 60).toString().padStart(2, '0')}` : '—'}</p>
          </div>
          <Button variant="primary" fullWidth onClick={handleExport}>
            <Icon name="download" size={16} />
            Start Export
          </Button>
        </div>
      )}
    </Modal>
  )
}
