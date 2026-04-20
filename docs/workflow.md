# FocusRecord Workflow

This document describes the data flow through the application: Record → Save → Edit → Export.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     RECORD      │────▶│      SAVE       │────▶│      EDIT       │────▶│     EXPORT      │
│  CaptureManager │     │  recordingStore │     │   editorStore   │     │  ExportService  │
│  MediaRecorder  │     │    IndexedDB    │     │ usePlayerCtrl   │     │ Canvas+Recorder │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 1. Record Phase

**Location:** `src/pages/RecordPage.jsx`, `src/recording/captureManager.js`

### User Flow

1. User selects capture sources (Screen, Mic, Webcam toggles)
2. User clicks "Start Recording"
3. Browser prompts for screen/audio permissions
4. Recording starts with visual countdown
5. User clicks "Stop Recording"
6. Recording is saved and user navigates to Library

### Technical Details

```javascript
// CaptureManager orchestrates all capture streams
const captureManager = {
  screenStream, // getDisplayMedia() - screen + optional system audio
  micStream, // getUserMedia({ audio }) - microphone
  cameraStream, // getUserMedia({ video }) - webcam
  mediaRecorder, // Records combined streams
};
```

**Stream Sources:**
| Source | API | Tracks |
|--------|-----|--------|
| Screen | `getDisplayMedia()` | Video + optional Audio |
| Mic | `getUserMedia({ audio })` | Audio only |
| Webcam | `getUserMedia({ video })` | Video only |

**Audio Mixing:**

- System audio and mic audio are mixed using Web Audio API
- `audioMixer.js` creates AudioContext with MediaStreamDestination
- Mixed audio track is added to MediaRecorder

**Data Flow:**

```
Screen Video ─────────────────────────┐
                                      ├──▶ MediaRecorder ──▶ Blob
System Audio ──┐                      │
               ├──▶ AudioMixer ───────┘
Mic Audio ─────┘

Webcam Video ─────────────────────────────▶ Separate MediaRecorder ──▶ Blob
```

### Output

- `screenBlob`: WebM video with screen + mixed audio
- `webcamBlob`: WebM video with webcam (if enabled)
- `duration`: Recording length in seconds

---

## 2. Save Phase

**Location:** `src/store/recordingStore.js`, `src/db/recordingsDB.js`

### Data Model

```javascript
const recording = {
  id: string, // UUID
  name: string, // User-editable name
  createdAt: number, // Timestamp
  duration: number, // Seconds (from recorder)

  // Blob URLs (for playback)
  screenUrl: string, // createObjectURL(screenBlob)
  webcamUrl: string, // createObjectURL(webcamBlob) or null
  audioUrl: string, // createObjectURL(audioBlob) or null

  // Raw blobs (for persistence)
  screenBlob: Blob,
  webcamBlob: Blob,
  audioBlob: Blob,

  // Edit metadata (non-destructive)
  metadata: {
    trims: { inTime: 0, outTime: duration },
    zoomSegments: [],
    webcam: { visible: true, x, y, width, height },
    background: '#1a1a2e',
    aspectRatio: '16:9',
  },

  thumbnail: string, // Data URL of first frame
};
```

### Persistence

**IndexedDB Structure:**

```
recordingsDB
├── recordings (object store)
│   ├── id (keyPath)
│   ├── name, createdAt, duration
│   ├── screenBlob, webcamBlob, audioBlob
│   └── metadata, thumbnail
```

**Save Flow:**

1. `recordingStore.addRecording(data)` called
2. Blobs stored in IndexedDB
3. Object URLs created for playback
4. Store updated with new recording
5. UI navigates to Library

**Load Flow:**

1. App initializes, calls `recordingStore.loadRecordings()`
2. IndexedDB queried for all recordings
3. Object URLs created from stored blobs
4. Store populated with recordings

---

## 3. Edit Phase

**Location:** `src/editor/EditorPage.jsx`, `src/editor/usePlayerController.js`, `src/store/editorStore.js`

### State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      editorStore (Zustand)                  │
│  Single source of truth for edit state                      │
│  - trims: { inTime, outTime }                              │
│  - zoomSegments: [{ id, start, end, scale, panX, panY }]   │
│  - webcam: { visible, x, y, width, height }                │
│  - background: string                                       │
│  - aspectRatio: string                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   usePlayerController (Hook)                 │
│  Single source of truth for playback                        │
│  - isPlaying: boolean                                       │
│  - currentTime: number                                      │
│  - isScrubbing: boolean                                     │
│  - play(), pause(), seek(), scrubTo()                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  editorHistoryStore (Zustand)               │
│  Undo/Redo with three-stack pattern                        │
│  - past: EditorState[]                                     │
│  - present: EditorState                                    │
│  - future: EditorState[]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Playback State Machine

```
        ┌──────────────────────────────────────────────────┐
        │                                                  │
        ▼                                                  │
    ┌───────┐  play()   ┌─────────┐  pause()  ┌────────┐ │
    │ IDLE  │─────────▶│ PLAYING │──────────▶│ PAUSED │──┘
    └───────┘           └─────────┘           └────────┘
        │                    │                     │
        │                    │ scrubStart()        │ scrubStart()
        │                    ▼                     ▼
        │               ┌──────────┐          ┌──────────┐
        │               │SCRUBBING │          │SCRUBBING │
        │               │(was play)│          │(was pause│
        │               └──────────┘          └──────────┘
        │                    │                     │
        │                    │ scrubEnd()          │ scrubEnd()
        │                    ▼                     ▼
        │               ┌─────────┐           ┌────────┐
        └──────────────▶│ PLAYING │           │ PAUSED │
                        └─────────┘           └────────┘
```

**Key Rules:**

- RAF loop ONLY runs when `isPlaying && !isScrubbing`
- During scrub, time comes from `scrubTo()` calls only
- Audio sync checked every 500ms, resync if drift > 50ms
- Playback stops at `outTime`, does not auto-loop

### Canvas Rendering

```javascript
// CanvasRenderer.js - Pure render function
function renderFrame(ctx, { time, stageW, stageH, screenVideo, webcamVideo, editorState }) {
  // 1. Fill background
  ctx.fillStyle = editorState.background;
  ctx.fillRect(0, 0, stageW, stageH);

  // 2. Calculate zoom at current time
  const zoom = getZoomAtTime(editorState.zoomSegments, time);

  // 3. Draw screen video with zoom/pan
  drawScreenWithZoom(ctx, screenVideo, zoom, stageW, stageH);

  // 4. Draw webcam overlay (if visible)
  if (editorState.webcam.visible && webcamVideo) {
    drawWebcamOverlay(ctx, webcamVideo, editorState.webcam);
  }
}
```

### Non-Destructive Editing

All edits are stored as metadata, not applied to original media:

| Edit            | Storage                 | Applied At           |
| --------------- | ----------------------- | -------------------- |
| Trim            | `metadata.trims`        | Playback + Export    |
| Zoom            | `metadata.zoomSegments` | Render loop + Export |
| Webcam position | `metadata.webcam`       | Render loop + Export |
| Background      | `metadata.background`   | Render loop + Export |
| Aspect ratio    | `metadata.aspectRatio`  | Canvas size + Export |

---

## 4. Export Phase

**Location:** `src/export/ExportService.js`, `src/pages/ExportPage.jsx`

### Export Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Export Pipeline                              │
│                                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────┐ │
│  │ Screen   │───▶│              │    │              │    │       │ │
│  │ Video    │    │   Canvas     │───▶│ MediaRecorder│───▶│ Blob  │ │
│  └──────────┘    │  Renderer    │    │              │    │       │ │
│                  │              │    └──────────────┘    └───────┘ │
│  ┌──────────┐    │  (applies    │           ▲                      │
│  │ Webcam   │───▶│   all edits) │           │                      │
│  │ Video    │    │              │    ┌──────────────┐              │
│  └──────────┘    └──────────────┘    │ Audio Stream │              │
│                         │            │  (mixed)     │              │
│                         ▼            └──────────────┘              │
│                  captureStream()            ▲                      │
│                         │                   │                      │
│                         ▼                   │                      │
│                  ┌──────────────────────────┘                      │
│                  │ Combined MediaStream                            │
│                  │ (video + audio tracks)                          │
│                  └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────┘
```

### Export Process

```javascript
async function exportRecording({
  screenVideo,
  webcamVideo,
  audioElement,
  editorState,
  config,
  onProgress,
  signal,
}) {
  // 1. Set up canvas at target resolution
  const canvas = document.createElement('canvas');
  canvas.width = qualityPreset.width;
  canvas.height = qualityPreset.height;

  // 2. Create canvas stream
  const canvasStream = canvas.captureStream(frameRate);

  // 3. Set up audio mixing
  const audioMixer = createAudioMixer(screenVideo, audioElement);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioMixer.stream.getAudioTracks(),
  ]);

  // 4. Create MediaRecorder
  const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond });

  // 5. Render loop (respects trim in/out)
  for (let time = inTime; time < outTime; time += 1 / frameRate) {
    renderFrame(ctx, { time, screenVideo, webcamVideo, editorState });
    onProgress(((time - inTime) / (outTime - inTime)) * 100);
    await waitForNextFrame();
  }

  // 6. Stop and return blob
  recorder.stop();
  return { blob: new Blob(chunks), duration, mimeType };
}
```

### Quality Presets

| Quality | Resolution | Video Bitrate |
| ------- | ---------- | ------------- |
| 720p    | 1280x720   | 2.5 Mbps      |
| 1080p   | 1920x1080  | 5 Mbps        |
| 4K      | 3840x2160  | 15 Mbps       |

### Frame Rate Presets

| Option | FPS |
| ------ | --- |
| 30fps  | 30  |
| 60fps  | 60  |

---

## Data Flow Summary

```
USER ACTION                    DATA TRANSFORMATION                     STORAGE
───────────────────────────────────────────────────────────────────────────────

Click "Start Recording"
       │
       ▼
  getDisplayMedia() ─────────▶ screenStream
  getUserMedia() ────────────▶ micStream, cameraStream
       │
       ▼
  MediaRecorder ─────────────▶ screenBlob, webcamBlob
       │
       ▼
Click "Stop Recording"
       │
       ▼
  recordingStore.add() ──────▶ Create object URLs ──────▶ IndexedDB
       │                       Update store
       ▼
Click recording in Library
       │
       ▼
  Navigate to Editor
       │
       ▼
  Load blobs ────────────────▶ Create <video> elements
  Load metadata ─────────────▶ Initialize editorStore
       │
       ▼
  User makes edits ──────────▶ Update editorStore ──────▶ Auto-save metadata
  (trim, zoom, etc.)           Push to history
       │
       ▼
Click "Export"
       │
       ▼
  exportRecording() ─────────▶ Render to canvas
                               Apply all edits
                               Record with MediaRecorder
       │
       ▼
  Download blob ─────────────▶ User's file system
```

---

## Error Handling

### Recording Errors

- Permission denied: Show user-friendly message, suggest browser settings
- Stream ended unexpectedly: Save partial recording if possible
- MediaRecorder error: Fallback to simpler codec

### Playback Errors

- Media load timeout: Use fallback duration from store
- Invalid duration (NaN/Infinity): Apply WebM workaround, use estimate
- Decode error: Show error state, suggest re-recording

### Export Errors

- Cancelled by user: Clean up resources, no partial file
- Memory pressure: Reduce quality, warn user
- Encoding error: Fallback to simpler codec

---

## Cleanup

### Object URLs

- Created on load, revoked on unload
- `URL.revokeObjectURL()` called in cleanup effects

### Media Streams

- All tracks stopped when leaving recorder
- `track.stop()` called for each stream track

### Audio Context

- Closed after export completes
- `audioContext.close()` prevents memory leaks
