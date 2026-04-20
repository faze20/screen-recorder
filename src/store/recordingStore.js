import { create } from 'zustand'
import { getAllRecordings, saveRecording, deleteRecording, updateRecordingMetadata } from '../db/recordingsDB.js'

function makeObjectUrls(rec) {
  const urls = {}
  if (rec.screenBlob) urls.screenUrl = URL.createObjectURL(rec.screenBlob)
  if (rec.webcamBlob) urls.webcamUrl = URL.createObjectURL(rec.webcamBlob)
  if (rec.audioBlob) urls.audioUrl = URL.createObjectURL(rec.audioBlob)
  return urls
}

function revokeUrls(rec) {
  if (rec.screenUrl?.startsWith('blob:')) URL.revokeObjectURL(rec.screenUrl)
  if (rec.webcamUrl?.startsWith('blob:')) URL.revokeObjectURL(rec.webcamUrl)
  if (rec.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(rec.audioUrl)
}

export const useRecordingStore = create((set, get) => ({
  recordings: [],
  loading: false,

  loadRecordings: async () => {
    set({ loading: true })
    try {
      const rows = await getAllRecordings()
      const recordings = rows.map(r => ({ ...r, ...makeObjectUrls(r) }))
      set({ recordings, loading: false })
    } catch (err) {
      console.error('Failed to load recordings:', err)
      set({ loading: false })
    }
  },

  addRecording: async (data) => {
    await saveRecording(data)
    const rec = { ...data, ...makeObjectUrls(data) }
    set(s => ({ recordings: [rec, ...s.recordings] }))
    return rec
  },

  updateMetadata: async (id, metadata) => {
    await updateRecordingMetadata(id, metadata)
    set(s => ({
      recordings: s.recordings.map(r =>
        r.id === id ? { ...r, metadata: { ...r.metadata, ...metadata } } : r
      ),
    }))
  },

  removeRecording: async (id) => {
    const rec = get().recordings.find(r => r.id === id)
    if (rec) revokeUrls(rec)
    await deleteRecording(id)
    set(s => ({ recordings: s.recordings.filter(r => r.id !== id) }))
  },

  getById: (id) => get().recordings.find(r => r.id === id),
}))
