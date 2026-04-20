# UI Design Mapping

## Design Files Inventory

| File                                         | Screen                  | Theme |
| -------------------------------------------- | ----------------------- | ----- |
| `design/01-record.png`                       | Record Page             | Dark  |
| `design/02-editor.png`                       | Editor Page             | Dark  |
| `design/03-library.png`                      | Library Page            | Light |
| `design/04-settings.png`                     | Settings Page           | Dark  |
| `design/states-export.png`                   | Export Success Modal    | Dark  |
| `design/states-permissions.png`              | Permission Denied Modal | Dark  |
| `design/stitch/.../editor_-_dark_cinematic/` | Editor (detailed)       | Dark  |

## Design System

### Colors (Dark Theme - Primary)

- **Background**: `#0d1a14` (darkest), `#111c16` (dark), `#1a2e24` (surface)
- **Primary**: `#10b981` (green accent)
- **Text**: `#ffffff` (primary), `#9ca3af` (secondary), `#6b7280` (muted)
- **Border**: `#1f3d2d` (subtle), `#2d4a3a` (visible)
- **Danger**: `#ef4444` (red for errors)

### Typography

- Font: System font stack (San Francisco, Segoe UI, etc.)
- Headings: Semi-bold, larger sizes
- Body: Regular weight

### Spacing

- Base unit: 4px
- Common: 8px, 12px, 16px, 24px, 32px

### Border Radius

- Small: 4px (buttons, inputs)
- Medium: 8px (cards, panels)
- Large: 12px (modals)
- Full: 9999px (pills, avatars)

---

## Screen Mapping

### 1. Record Page (`/record`)

**File**: `design/01-record.png`
**Route**: `/record`
**Component**: `src/pages/RecordPage.jsx`

**Layout**:

- Top bar: Logo, help icon, settings icon, user avatar
- Main area: Source preview with dashed border frame, "Select screen" CTA
- Bottom: Webcam preview pill with toggle icons
- Right sidebar: Sources, Audio, Quality settings, Start Recording button

**Key Elements**:
| Element | Component | Notes |
|---------|-----------|-------|
| Top bar | `TopBar` | Logo left, icons right |
| Source preview | `SourcePreview` | Dashed border, centered content |
| Webcam preview | `WebcamPill` | Floating bottom, rounded, toggles |
| Sources panel | `SourcesPanel` | Full Screen toggle, FaceCam toggle |
| Audio panel | `AudioPanel` | Mic dropdown, level meter, noise toggle |
| Quality controls | `QualityPanel` | Resolution, FPS, zoom factor |
| Start button | `Button` | Full width, green, primary |

---

### 2. Editor Page (`/editor/:id`)

**File**: `design/02-editor.png`, `design/stitch/.../editor_-_dark_cinematic/`
**Route**: `/editor/:id`
**Component**: `src/editor/EditorPage.jsx`

**Layout**:

- Top bar: Breadcrumb, undo/redo, Save, Export button
- Left rail: Tool icons (select, cut, text, crop, pan)
- Main canvas: Video preview with webcam overlay, playback controls
- Right sidebar: Properties panel with tabs (Visual, Audio, Effects)
- Bottom: Timeline with tracks

**Key Elements**:
| Element | Component | Notes |
|---------|-----------|-------|
| Top bar | `EditorTopBar` | Breadcrumb, actions |
| Tool rail | `ToolRail` | Vertical icon buttons |
| Canvas stage | `CanvasStage` | Video + webcam overlay |
| Playback controls | `PlaybackControls` | Play/pause, skip, volume |
| Properties panel | `PropertiesPanel` | Tabbed: Visual/Audio/Effects |
| Layout section | `LayoutSection` | Position, scale inputs |
| Webcam section | `WebcamSection` | Toggle, shape, border |
| Background section | `BackgroundSection` | Color picker |
| Timeline | `Timeline` | Tracks, time ruler, zoom |
| Track | `Track` | Waveform or video clips |

---

### 3. Library Page (`/library`)

**File**: `design/03-library.png`
**Route**: `/library`
**Component**: `src/pages/LibraryPage.jsx`

**Layout**:

- Left sidebar: Navigation (Dashboard, Library, Editor, Collections), Settings, New Recording, User profile
- Main content: Header with search/sort, grid of recording cards

**Key Elements**:
| Element | Component | Notes |
|---------|-----------|-------|
| Sidebar nav | `Sidebar` | Logo, nav links, user |
| Nav item | `NavItem` | Icon + label, active state |
| New Recording btn | `Button` | Green, full width |
| User profile | `UserProfile` | Avatar, name, plan |
| Page header | `PageHeader` | Title, subtitle |
| Search input | `SearchInput` | Icon + placeholder |
| Sort dropdown | `Select` | Sort by options |
| Recording card | `RecordingCard` | Thumbnail, duration, title, meta |
| New collection card | `NewCollectionCard` | Plus icon, dashed border |

---

### 4. Settings Page (`/settings`)

**File**: `design/04-settings.png`
**Route**: `/settings`
**Component**: `src/pages/SettingsPage.jsx`

**Layout**:

- Left sidebar: Settings navigation (Profile, Permissions, Integrations, Security, Team Settings)
- Main content: Settings panels

**Key Elements**:
| Element | Component | Notes |
|---------|-----------|-------|
| Settings nav | `SettingsNav` | Vertical tabs |
| Permission card | `PermissionCard` | Icon, status, toggle |
| Permission modal | `PermissionModal` | Error state with fix steps |

---

### 5. Export Modal

**File**: `design/states-export.png`
**Component**: `src/components/ExportModal.jsx`

**Layout**:

- Centered modal with success state
- Video preview with badges
- Action buttons

**Key Elements**:
| Element | Component | Notes |
|---------|-----------|-------|
| Success icon | Icon | Green checkmark circle |
| Video preview | `VideoPreview` | Thumbnail with format badges |
| Download button | `Button` | Primary, full width |
| Copy link button | `Button` | Secondary |
| Upload button | `IconButton` | Cloud icon |

---

## Component Hierarchy

```
src/components/
├── ui/                    # Base UI components
│   ├── Button.jsx
│   ├── IconButton.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Toggle.jsx
│   ├── Slider.jsx
│   ├── Tabs.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   └── Toast.jsx
├── layout/               # Layout components
│   ├── TopBar.jsx
│   ├── Sidebar.jsx
│   ├── ToolRail.jsx
│   └── Panel.jsx
├── record/               # Record page components
│   ├── SourcePreview.jsx
│   ├── WebcamPill.jsx
│   ├── SourcesPanel.jsx
│   ├── AudioPanel.jsx
│   └── QualityPanel.jsx
├── editor/               # Editor components
│   ├── CanvasStage.jsx
│   ├── PlaybackControls.jsx
│   ├── PropertiesPanel.jsx
│   └── Timeline/
└── library/              # Library components
    ├── RecordingCard.jsx
    └── SearchBar.jsx
```

---

## Implementation Order

1. **UI Kit** - Base components (Button, Input, Select, Toggle, etc.)
2. **Layout** - TopBar, Sidebar, Panel
3. **Library Page** - Cards, search, navigation
4. **Record Page** - Sources, audio, preview
5. **Editor Page** - Canvas, timeline, properties
6. **Export Modal** - Success state, actions
7. **Settings Page** - Navigation, permission cards
