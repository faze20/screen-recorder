# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

> **Project status:** Greenfield. Only `design/`, `docs/`, and `CLAUDE.md` exist today. The `src/` layout described below is the target architecture — scaffold it as you build. Always consult `docs/` and `design/` before implementing a feature; they are the source of truth for product behavior and visual design.

---

## 1. What we're building

**GMSSRecord** is a browser-based screen recorder with a non-destructive video editor. Everything runs client-side in the browser — screen/camera/mic capture via `getDisplayMedia` / `getUserMedia`, recording via `MediaRecorder`, editing against a `<canvas>`, and export via `canvas.captureStream()` re-encoded through `MediaRecorder`. All media and metadata persist locally in **IndexedDB**. There is no backend.

Four top-level screens make up the app:

| Route         | Page                | Purpose                                                   |
| ------------- | ------------------- | --------------------------------------------------------- |
| `/record`     | `RecordPage.jsx`    | Pick sources (screen/mic/webcam), preview, start/stop     |
| `/library`    | `LibraryPage.jsx`   | Grid of saved recordings, search, sort, new recording     |
| `/editor/:id` | `EditorPage.jsx`    | Canvas preview, timeline, properties panel, undo/redo     |
| `/settings`   | `SettingsPage.jsx`  | Profile, permissions, integrations, security, team        |

See `docs/ui-design-map.md` for the full screen-to-component mapping.

---

## 2. Setup & commands

Install Vite + Tailwind per the official guide: <https://tailwindcss.com/docs/installation/using-vite>.

```bash
npm install            # install deps
npm run dev            # dev server at http://localhost:5173
npm run build          # production build → dist/
npm run preview        # preview the production build
```

**Stack baseline**

- Vite + React (JSX) + Tailwind CSS
- State: **Zustand** (recording store, editor store, history store)
- Persistence: **IndexedDB** (raw blobs + metadata)
- Icons: **lucide-react** wrapped by `src/components/ui/Icon.jsx`
- Fonts: **Spline Sans** (Google Fonts), weights 300/400/500/600/700

---

## 3. Target source layout

Create files under `src/` as you implement each module. The hierarchy follows the design map so components, pages, and logic stay traceable to the specs.

```
src/
├── pages/
│   ├── RecordPage.jsx
│   ├── LibraryPage.jsx
│   ├── SettingsPage.jsx
│   └── ExportPage.jsx
├── editor/
│   ├── EditorPage.jsx          # mounts hidden <video>/<audio>, owns playback
│   ├── usePlayerController.js  # isPlaying, currentTime, isScrubbing
│   ├── MediaLoader.js          # 2000ms load timeout, WebM Infinity fallback
│   ├── CanvasRenderer.js       # pure renderFrame(ctx, {...}); EPSILON = 0.001
│   └── Timeline.jsx            # pointer-event-only, setPointerCapture
├── recording/
│   ├── index.js                # createCaptureManager() entry point
│   ├── captureManager.js       # IDLE → READY → RECORDING state machine
│   ├── audioMixer.js           # Web Audio mixer → MediaStreamDestination
│   └── recorderManager.js      # MediaRecorder wrapper, blob validation
├── export/
│   └── ExportService.js        # canvas.captureStream → MediaRecorder
├── store/
│   ├── recordingStore.js       # recordings list + current recording
│   ├── editorStore.js          # trims, zoomSegments, webcam, background, aspectRatio
│   └── editorHistoryStore.js   # past/present/future undo stack
├── db/
│   ├── indexedDB.js            # low-level IDB wrapper
│   └── recordingsDB.js         # recordings + assets object stores
├── components/
│   ├── ui/        Button, IconButton, Input, Select, Toggle, Slider, Tabs,
│   │              Card, Modal, Toast, Icon
│   ├── layout/    TopBar, Sidebar, ToolRail, Panel
│   ├── record/    SourcePreview, WebcamPill, SourcesPanel, AudioPanel, QualityPanel
│   ├── editor/    CanvasStage, PlaybackControls, PropertiesPanel, Timeline/
│   └── library/   RecordingCard, SearchBar
└── main.jsx, App.jsx, routes.jsx
```

Follow the implementation order from `docs/ui-design-map.md`: **UI kit → layout → Library → Record → Editor → Export modal → Settings.**

---

## 4. Pipeline: Record → Save → Edit → Export

Full diagrams live in `docs/workflow.md`. The short version:

**Record.** `captureManager` opens `screenStream` (getDisplayMedia), optional `micStream` + `cameraStream` (getUserMedia). `audioMixer` combines system audio + mic via Web Audio API into a single track. `MediaRecorder` writes `screenBlob`; a separate recorder writes `webcamBlob` if webcam is on.

**Save.** `recordingStore.addRecording()` persists blobs to IndexedDB and creates object URLs for playback. Recording shape:

```js
{
  id, name, createdAt, duration,
  screenUrl, webcamUrl, audioUrl,          // createObjectURL(...)
  screenBlob, webcamBlob, audioBlob,        // persisted
  thumbnail,                                // data URL of first frame
  metadata: {
    trims: { inTime: 0, outTime: duration },
    zoomSegments: [],                       // { id, start, end, scale, panX, panY }
    webcam:   { visible, x, y, width, height },
    background: '#1a1a2e',
    aspectRatio: '16:9',
  },
}
```

**Edit.** All edits are **non-destructive** — they mutate `editorStore.metadata` only, never the original blobs. The render loop and export both apply metadata on top of the raw media:

| Edit            | Stored as               | Applied at            |
| --------------- | ----------------------- | --------------------- |
| Trim            | `metadata.trims`        | Playback + Export     |
| Zoom            | `metadata.zoomSegments` | Render loop + Export  |
| Webcam position | `metadata.webcam`       | Render loop + Export  |
| Background      | `metadata.background`   | Render loop + Export  |
| Aspect ratio    | `metadata.aspectRatio`  | Canvas size + Export  |

**Export.** Build an offscreen `<canvas>` at the chosen preset, `canvas.captureStream(fps)`, mix the audio tracks, feed a new `MediaRecorder`, and iterate `for (time = inTime; time < outTime; time += 1/fps)` calling `renderFrame()` and `await waitForNextFrame()`. Emit progress `((time - inTime) / (outTime - inTime)) * 100`.

**Quality presets:** 720p @ 2.5 Mbps · 1080p @ 5 Mbps · 4K @ 15 Mbps. **Frame rates:** 30 / 60 fps.

---

## 5. Playback state machine

`usePlayerController` is the single source of truth for playback. Three observable flags: `isPlaying`, `currentTime`, `isScrubbing`. Transitions:

```
IDLE ──play()──▶ PLAYING ──pause()──▶ PAUSED
                    │                    │
                    └──scrubStart()──▶ SCRUBBING ──scrubEnd()──▶ (resume prior state)
```

Rules that MUST hold (easy to regress, so call them out in PRs):

- **RAF only runs when `isPlaying && !isScrubbing`.** Never tick during scrub.
- During scrub, time comes from `scrubTo()` calls — **not** `video.currentTime`.
- Audio sync check every 500 ms; resync if drift > 50 ms.
- Playback stops at `outTime`. No auto-loop.
- No `key` prop on the hidden `<video>` elements and no conditional rendering — refs must stay stable.
- Use `EPSILON = 0.001` for all time comparisons in trim/zoom logic.

---

## 6. Design system

**Canonical spec:** `design/UI_SPEC.md` (based on `stitch_editor_light_minimal`). A second, stricter dark-theme token set lives in `docs/ui-design-map.md`; when they disagree, prefer the UI_SPEC tokens and note the discrepancy in the PR.

**Brand color:** `#13ec80` (Primary Green). Subtle: `rgba(19, 236, 128, 0.2)`. Primary export button uses `shadow-[0_0_15px_rgba(19,236,128,0.3)]` with a heavier shadow on hover.

**Palette (light → dark):**

- Background: `#f6f8f7` → `#102219`
- Surface: `#ffffff` → `#1a3326` (panels) / `#0c1a13` (canvas stage)
- Text primary: `#11221a` → `#ffffff`; secondary/muted: `gray-500` / `gray-400`
- Border: `gray-200` → `#234836`
- Timeline track bg: `#234836` @ 30% opacity; waveform `#2a5544`

**Typography.** `Spline Sans`. Header titles `text-sm font-bold`; section headers `text-base font-bold`; body `text-sm`; labels `text-[10px] uppercase font-bold tracking-wider`; timecodes `font-mono`.

**Radius.** Default `1rem`, lg `2rem`, xl `3rem`, pills `9999px`. Inputs use a smaller `0.25–0.5rem`.

**Layout.** Fixed top header, flex main, canvas+timeline vertical split in the center, 20rem (320px) inspector sidebar on the right.

The Stitch HTML mockups under `design/stitch/light-minimal/` are the pixel-level reference for Editor, Library, Record, and Export/Settings screens in both light-minimal, dark-cinematic, and enterprise-high-contrast themes. Open the matching `screen.png` + `code.html` when implementing a screen.

---

## 7. Icon conventions

All icons go through `<Icon name="..." />` (`src/components/ui/Icon.jsx`), which wraps `lucide-react` and accepts **both** material-symbols-style names (`play_arrow`, `content_cut`, `zoom_in`) and lucide names (`play`, `scissors`, `zoom-in`). See `docs/icons.md` for the full mapping.

```jsx
<Icon name="play_arrow" size={20} />
<Icon name="videocam" size={24} className="text-primary" />
```

Unknown names log a dev warning and render `HelpCircle` as fallback. To add an icon: import it from `lucide-react`, register it in `ICON_MAP`, update `docs/icons.md`.

---

## 8. Key patterns (don't regress these)

- **Pointer events only** on the timeline — `pointerdown` / `pointermove` / `pointerup` with `setPointerCapture`. No mouse events, no touch events.
- **Event handlers via refs.** Attach DOM listeners once in `useEffect(() => {}, [])` and read the latest values through refs; otherwise stale closures will silently break scrubbing.
- **Three-stack undo/redo** in `editorHistoryStore`: `past[]`, `present`, `future[]`. Every editor mutation pushes to `past` and clears `future`.
- **Non-destructive by default.** If an edit mutates a blob, it's a bug — it should mutate metadata.
- **Cleanup.** Revoke every `URL.createObjectURL` on unmount. Stop every track (`track.stop()`) when leaving the recorder. Close `AudioContext` after export.

---

## 9. Error handling expectations

- **Permissions denied** (screen / mic / camera) → show the permission-denied modal from `design/states-permissions.png` with a link to browser-specific fix steps.
- **Stream ends unexpectedly** → attempt to finalize and save the partial recording.
- **MediaRecorder error** → fall back to a simpler codec (`video/webm;codecs=vp8,opus`).
- **Media load timeout** (2000 ms) or invalid duration (NaN / Infinity) → use the WebM duration fallback stored on the recording.
- **Export cancelled** → clean up canvas stream, audio context, and chunks; no partial file.

---

## 10. Reference index

When implementing, open these first:

- `docs/workflow.md` — data flow, state machines, export pipeline, error handling
- `docs/ui-design-map.md` — screens, component hierarchy, implementation order
- `docs/icons.md` — icon name mapping
- `design/UI_SPEC.md` — tokens, typography, components, layout
- `design/01-record.png`, `02-editor.png`, `03-library.png`, `04-settings.png` — top-level mockups
- `design/states-export.png`, `design/states-permissions.png` — modal states
- `design/stitch/light-minimal/stitch_editor_light_minimal/*/code.html` — Tailwind reference markup for each screen and theme
