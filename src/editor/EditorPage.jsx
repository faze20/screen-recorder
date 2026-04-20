import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRecordingStore } from '../store/recordingStore.js'
import { useEditorStore } from '../store/editorStore.js'
import { useEditorHistoryStore } from '../store/editorHistoryStore.js'
import { renderFrame } from './CanvasRenderer.js'
import { loadVideo } from './MediaLoader.js'
import { usePlayerController } from './usePlayerController.js'
import ToolRail from '../components/layout/ToolRail.jsx'
import PlaybackControls from '../components/editor/PlaybackControls.jsx'
import Timeline from '../components/editor/Timeline.jsx'
import PropertiesPanel from '../components/editor/PropertiesPanel.jsx'
import Button from '../components/ui/Button.jsx'
import IconButton from '../components/ui/IconButton.jsx'
import Icon from '../components/ui/Icon.jsx'
import ExportModal from '../components/ExportModal.jsx'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const getById = useRecordingStore(s => s.getById)
  const updateMetadata = useRecordingStore(s => s.updateMetadata)

  const { metadata, load, setTrims, setBackground, setAspectRatio, setWebcam } = useEditorStore()

  // Stable action refs — never change identity, so safe in dep arrays
  const historyInit = useEditorHistoryStore(s => s.init)
  const historyPush = useEditorHistoryStore(s => s.push)
  const historyUndo = useEditorHistoryStore(s => s.undo)
  const historyRedo = useEditorHistoryStore(s => s.redo)
  // Reactive only for the disabled states in the toolbar
  const canUndo = useEditorHistoryStore(s => s.past.length > 0)
  const canRedo = useEditorHistoryStore(s => s.future.length > 0)

  const [recording, setRecording] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const [exportOpen, setExportOpen] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)

  const canvasRef = useRef(null)
  const screenVideoRef = useRef(null)
  const webcamVideoRef = useRef(null)

  // Render the current frame to canvas
  const doRenderFrame = useCallback((time) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    renderFrame(ctx, {
      time,
      stageW: canvas.width,
      stageH: canvas.height,
      screenVideo: screenVideoRef.current,
      webcamVideo: webcamVideoRef.current,
      metadata: useEditorStore.getState().metadata,
    })
  }, [])

  const player = usePlayerController({
    screenVideoRef,
    canvasRef,
    metadata,
    renderFrameFn: doRenderFrame,
  })

  // Load recording
  useEffect(() => {
    const rec = getById(id)
    if (!rec) { setLoadError('Recording not found'); return }
    setRecording(rec)
    load(rec.id, rec.metadata)
    historyInit(rec.metadata)

    let screenVid = null
    let webcamVid = null

    loadVideo(rec.screenUrl).then(v => {
      screenVid = v
      screenVideoRef.current = v
      setVideoLoaded(true)
      doRenderFrame(rec.metadata?.trims?.inTime ?? 0)
    }).catch(e => setLoadError(e.message))

    if (rec.webcamUrl) {
      loadVideo(rec.webcamUrl).then(v => {
        webcamVid = v
        webcamVideoRef.current = v
      }).catch(() => {})
    }

    return () => {
      screenVid?.pause()
      webcamVid?.pause()
    }
  }, [id, getById, load, historyInit, doRenderFrame])

  // Re-render on metadata changes (background, webcam, etc.)
  useEffect(() => {
    doRenderFrame(player.currentTime)
  }, [metadata?.background, metadata?.webcam?.visible, doRenderFrame])

  const handleMetadataChange = useCallback((changes) => {
    if (changes.background !== undefined) setBackground(changes.background)
    if (changes.aspectRatio !== undefined) setAspectRatio(changes.aspectRatio)
    if (changes.trims !== undefined) setTrims(changes.trims)
    if (changes.webcam !== undefined) setWebcam(changes.webcam)

    const next = useEditorStore.getState().metadata
    historyPush(next)
    updateMetadata(id, next)
    doRenderFrame(playerRef.current.currentTime)
  }, [id, setBackground, setAspectRatio, setTrims, setWebcam, historyPush, updateMetadata, doRenderFrame])

  const handleUndo = useCallback(() => {
    const prev = historyUndo()
    if (!prev) return
    load(id, prev)
    doRenderFrame(playerRef.current.currentTime)
  }, [historyUndo, id, load, doRenderFrame])

  const handleRedo = useCallback(() => {
    const next = historyRedo()
    if (!next) return
    load(id, next)
    doRenderFrame(playerRef.current.currentTime)
  }, [historyRedo, id, load, doRenderFrame])

  // Store latest player/undo/redo in refs so the effect never needs to re-run
  const playerRef = useRef(player)
  playerRef.current = player
  const handleUndoRef = useRef(handleUndo)
  handleUndoRef.current = handleUndo
  const handleRedoRef = useRef(handleRedo)
  handleRedoRef.current = handleRedo

  useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); playerRef.current.togglePlay() }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); handleUndoRef.current() }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); handleRedoRef.current() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-dark flex-col gap-4">
        <Icon name="warning" size={32} className="text-red-400" />
        <p className="text-white">{loadError}</p>
        <Button variant="secondary" onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    )
  }

  const duration = recording?.duration ?? 0
  const inTime = metadata?.trims?.inTime ?? 0
  const outTime = metadata?.trims?.outTime ?? duration

  // Canvas dimensions based on aspect ratio
  const getCanvasDims = () => {
    const ratio = metadata?.aspectRatio || '16:9'
    const [w, h] = ratio.split(':').map(Number)
    return { width: 1280, height: Math.round(1280 * h / w) }
  }
  const { width: cw, height: ch } = getCanvasDims()

  return (
    <div className="h-screen flex flex-col bg-bg-darker overflow-hidden">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-3 md:px-4 border-b border-border-dark bg-surface-canvas shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <IconButton icon="arrow_back" onClick={() => navigate('/library')} title="Back to library" />
          <div className="w-px h-4 bg-border-dark hidden sm:block" />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight truncate max-w-32 md:max-w-48">
              {recording?.name || 'Loading…'}
            </p>
            <p className="text-xs text-gray-500">
              {duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="flex items-center bg-surface-panel rounded-full p-0.5 border border-border-dark">
            <IconButton icon="undo" size={16} onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" />
            <IconButton icon="redo" size={16} onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" />
          </div>
          <Button variant="secondary" size="sm" className="hidden sm:flex">
            <Icon name="save" size={14} />
            Save
          </Button>
          <Button variant="primary" size="sm" onClick={() => setExportOpen(true)}>
            <Icon name="download" size={14} />
            <span className="hidden sm:inline">Export</span>
          </Button>
          {/* Mobile: toggle properties panel */}
          <IconButton
            icon="tune"
            onClick={() => setPropertiesOpen(v => !v)}
            className="md:hidden"
            title="Properties"
            active={propertiesOpen}
          />
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative">
        <ToolRail activeTool={activeTool} onToolChange={setActiveTool} className="hidden md:flex" />

        {/* Canvas + timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas stage */}
          <div className="flex-1 bg-bg-darker flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <div className="relative max-h-full" style={{ aspectRatio: `${cw}/${ch}`, maxWidth: '100%' }}>
              <canvas
                ref={canvasRef}
                width={cw}
                height={ch}
                className="w-full h-full rounded-lg shadow-glow bg-surface-canvas"
              />
              {!videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface-canvas/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Icon name="loading" size={20} className="animate-spin text-primary" />
                    <span className="text-sm">Loading video…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Playback controls */}
          <PlaybackControls
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={duration}
            inTime={inTime}
            outTime={outTime}
            onTogglePlay={player.togglePlay}
            onSeek={player.seek}
            disabled={!videoLoaded}
          />

          {/* Timeline */}
          <div style={{ height: 110 }}>
            <Timeline
              duration={duration}
              currentTime={player.currentTime}
              inTime={inTime}
              outTime={outTime}
              onScrubStart={player.scrubStart}
              onScrubTo={player.scrubTo}
              onScrubEnd={player.scrubEnd}
              zoomSegments={metadata?.zoomSegments || []}
            />
          </div>
        </div>

        {/* Properties panel — right sidebar on desktop, overlay drawer on mobile */}
        {propertiesOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setPropertiesOpen(false)}
          />
        )}
        <div className={[
          'md:static md:translate-x-0 md:z-auto',
          'fixed top-14 right-0 bottom-0 z-30 transition-transform duration-200',
          propertiesOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
        ].join(' ')}>
          <PropertiesPanel
            metadata={metadata}
            onMetadataChange={handleMetadataChange}
          />
        </div>
      </div>

      {/* Export modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        recording={recording}
        metadata={metadata}
        screenVideoRef={screenVideoRef}
        webcamVideoRef={webcamVideoRef}
      />
    </div>
  )
}
