import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import TopBar from '../components/layout/TopBar.jsx'
import Panel from '../components/layout/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Icon from '../components/ui/Icon.jsx'
import SourcePreview from '../components/record/SourcePreview.jsx'
import WebcamPill from '../components/record/WebcamPill.jsx'
import SourcesPanel from '../components/record/SourcesPanel.jsx'
import AudioPanel from '../components/record/AudioPanel.jsx'
import QualityPanel from '../components/record/QualityPanel.jsx'
import { createCaptureManager } from '../recording/captureManager.js'
import { useRecordingStore } from '../store/recordingStore.js'

function captureThumbnail(videoEl) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoEl, 0, 0, 320, 180)
    return canvas.toDataURL('image/jpeg', 0.7)
  } catch {
    return null
  }
}

export default function RecordPage() {
  const navigate = useNavigate()
  const addRecording = useRecordingStore(s => s.addRecording)

  const [wantScreen] = useState(true)
  const [wantCamera, setWantCamera] = useState(false)
  const [wantMic, setWantMic] = useState(true)
  const [noiseCancel, setNoiseCancel] = useState(false)
  const [resolution, setResolution] = useState('1080p')
  const [fps, setFps] = useState('60')
  const [webcamVisible, setWebcamVisible] = useState(true)

  const [status, setStatus] = useState('idle') // idle | ready | recording | saving
  const [duration, setDuration] = useState(0)
  const [permError, setPermError] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [webcamStream, setWebcamStream] = useState(null)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)

  const captureRef = useRef(null)
  const timerRef = useRef(null)
  const screenVideoRef = useRef(null)

  const startTimer = () => {
    setDuration(0)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  const handleStart = useCallback(async () => {
    setPermError(null)
    try {
      const mgr = createCaptureManager()
      captureRef.current = mgr

      const { screenStream: ss, cameraStream } = await mgr.prepare({ wantMic, wantCamera })

      setScreenStream(ss)
      setWebcamStream(cameraStream)

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = ss
      }

      setStatus('ready')
      mgr.start()
      setStatus('recording')
      startTimer()
    } catch (err) {
      console.error(err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermError('Screen capture permission was denied. Please allow screen sharing in your browser settings.')
      } else {
        setPermError(`Could not start recording: ${err.message}`)
      }
    }
  }, [wantMic, wantCamera])

  const handleStop = useCallback(async () => {
    if (!captureRef.current) return
    setStatus('saving')
    stopTimer()

    try {
      const { screenBlob, webcamBlob, duration: recDuration } = await captureRef.current.stop()

      const thumbnail = screenVideoRef.current
        ? captureThumbnail(screenVideoRef.current)
        : null

      const id = uuidv4()
      const recording = {
        id,
        name: `Recording ${new Date().toLocaleString()}`,
        createdAt: Date.now(),
        duration: recDuration,
        screenBlob,
        webcamBlob: wantCamera ? webcamBlob : null,
        audioBlob: null,
        thumbnail,
        metadata: {
          trims: { inTime: 0, outTime: recDuration },
          zoomSegments: [],
          webcam: { visible: wantCamera, x: 16, y: 16, width: 240, height: 135 },
          background: '#0c1a13',
          aspectRatio: '16:9',
        },
      }

      await addRecording(recording)
      captureRef.current = null
      setScreenStream(null)
      setWebcamStream(null)
      setStatus('idle')
      navigate(`/editor/${id}`)
    } catch (err) {
      console.error('Save failed:', err)
      setStatus('idle')
    }
  }, [wantCamera, addRecording, navigate])

  useEffect(() => () => {
    stopTimer()
    captureRef.current?.cleanup()
  }, [])

  const isRecording = status === 'recording'
  const isSaving = status === 'saving'

  return (
    <div className="h-screen flex flex-col bg-bg-dark">
      <TopBar
        title={isRecording ? 'Recording…' : 'New Recording'}
        actions={
          isRecording ? (
            <Button variant="danger" onClick={handleStop} disabled={isSaving}>
              <Icon name="stop" size={16} />
              <span className="hidden sm:inline">{isSaving ? 'Saving…' : 'Stop Recording'}</span>
              <span className="sm:hidden">{isSaving ? 'Saving…' : 'Stop'}</span>
            </Button>
          ) : null
        }
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main preview */}
        <div className="flex-1 relative flex flex-col p-3 md:p-4 gap-3">
          <SourcePreview
            stream={screenStream}
            isRecording={isRecording}
            duration={duration}
          />
          <video ref={screenVideoRef} autoPlay muted playsInline className="hidden" />

          <WebcamPill
            stream={webcamStream}
            visible={webcamVisible}
            onToggleVisible={() => setWebcamVisible(v => !v)}
            micActive={wantMic}
            onToggleMic={() => {}}
          />

          {/* Mobile bottom bar */}
          <div className="md:hidden flex items-center gap-2 pt-1">
            {!isRecording ? (
              <Button variant="primary" fullWidth onClick={handleStart} disabled={isSaving} size="lg">
                <Icon name="radio_button_checked" size={18} />
                Start Recording
              </Button>
            ) : (
              <Button variant="danger" fullWidth onClick={handleStop} disabled={isSaving} size="lg">
                <Icon name="stop" size={18} />
                {isSaving ? 'Saving…' : 'Stop Recording'}
              </Button>
            )}
            <button
              onClick={() => setSettingsPanelOpen(v => !v)}
              className="shrink-0 w-12 h-12 rounded-xl bg-surface-panel border border-border-dark flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Icon name="settings" size={20} />
            </button>
          </div>
        </div>

        {/* Mobile settings panel backdrop */}
        {settingsPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSettingsPanelOpen(false)}
          />
        )}

        {/* Settings panel — right sidebar on desktop, bottom sheet on mobile */}
        <aside className={[
          'flex flex-col overflow-y-auto bg-surface-canvas',
          // Desktop: static right sidebar
          'md:static md:translate-y-0 md:w-72 md:border-l md:border-border-dark md:border-t-0',
          // Mobile: fixed bottom sheet
          'fixed bottom-0 left-0 right-0 z-30 border-t border-border-dark max-h-[70vh] transition-transform duration-200',
          settingsPanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
        ].join(' ')}>
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center py-2">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>

          <Panel title="Sources">
            <SourcesPanel
              wantScreen={wantScreen}
              wantCamera={wantCamera}
              onToggleScreen={() => {}}
              onToggleCamera={() => setWantCamera(v => !v)}
            />
          </Panel>

          <Panel title="Audio">
            <AudioPanel
              wantMic={wantMic}
              onToggleMic={() => setWantMic(v => !v)}
              noiseCancel={noiseCancel}
              onToggleNoise={() => setNoiseCancel(v => !v)}
            />
          </Panel>

          <Panel title="Quality">
            <QualityPanel
              resolution={resolution}
              fps={fps}
              onResolutionChange={setResolution}
              onFpsChange={setFps}
            />
          </Panel>

          {/* Desktop CTA */}
          <div className="hidden md:block p-4 mt-auto">
            {!isRecording ? (
              <Button variant="primary" fullWidth onClick={handleStart} disabled={isSaving} size="lg">
                <Icon name="radio_button_checked" size={18} />
                Start Recording
              </Button>
            ) : (
              <Button variant="danger" fullWidth onClick={handleStop} disabled={isSaving} size="lg">
                <Icon name="stop" size={18} />
                {isSaving ? 'Saving…' : 'Stop Recording'}
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Permission error modal */}
      <Modal
        open={!!permError}
        onClose={() => setPermError(null)}
        title="Permission Required"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <Icon name="warning" size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">{permError}</p>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <p className="font-medium text-white">To fix this:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Screen sharing" or "Camera/Microphone" permissions</li>
              <li>Set them to "Allow" and refresh the page</li>
            </ol>
          </div>
          <Button variant="primary" fullWidth onClick={() => setPermError(null)}>Got it</Button>
        </div>
      </Modal>
    </div>
  )
}
