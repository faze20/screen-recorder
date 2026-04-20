import { create } from 'zustand'

export const useEditorHistoryStore = create((set, get) => ({
  past: [],
  present: null,
  future: [],

  init: (state) => set({ past: [], present: state, future: [] }),

  push: (state) =>
    set(s => ({
      past: s.present ? [...s.past, s.present] : s.past,
      present: state,
      future: [],
    })),

  undo: () => {
    const { past, present, future } = get()
    if (past.length === 0) return null
    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      present: previous,
      future: [present, ...future],
    })
    return previous
  },

  redo: () => {
    const { past, present, future } = get()
    if (future.length === 0) return null
    const next = future[0]
    set({
      past: [...past, present],
      present: next,
      future: future.slice(1),
    })
    return next
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}))
