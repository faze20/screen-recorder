import { create } from 'zustand'

const DEFAULT_METADATA = {
  trims: { inTime: 0, outTime: 0 },
  zoomSegments: [],
  webcam: { visible: true, x: 16, y: 16, width: 240, height: 135 },
  background: '#0c1a13',
  aspectRatio: '16:9',
}

export const useEditorStore = create((set, get) => ({
  recordingId: null,
  metadata: DEFAULT_METADATA,

  load: (recordingId, metadata) => {
    set({ recordingId, metadata: { ...DEFAULT_METADATA, ...metadata } })
  },

  setTrims: (trims) => set(s => ({ metadata: { ...s.metadata, trims } })),

  setBackground: (background) => set(s => ({ metadata: { ...s.metadata, background } })),

  setAspectRatio: (aspectRatio) => set(s => ({ metadata: { ...s.metadata, aspectRatio } })),

  setWebcam: (webcam) => set(s => ({ metadata: { ...s.metadata, webcam: { ...s.metadata.webcam, ...webcam } } })),

  addZoomSegment: (segment) =>
    set(s => ({
      metadata: { ...s.metadata, zoomSegments: [...s.metadata.zoomSegments, segment] },
    })),

  updateZoomSegment: (id, changes) =>
    set(s => ({
      metadata: {
        ...s.metadata,
        zoomSegments: s.metadata.zoomSegments.map(z => z.id === id ? { ...z, ...changes } : z),
      },
    })),

  removeZoomSegment: (id) =>
    set(s => ({
      metadata: {
        ...s.metadata,
        zoomSegments: s.metadata.zoomSegments.filter(z => z.id !== id),
      },
    })),

  getMetadata: () => get().metadata,
}))
