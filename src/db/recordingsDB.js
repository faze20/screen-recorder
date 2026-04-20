import { dbGet, dbGetAll, dbPut, dbDelete } from './indexedDB.js'

const STORE = 'recordings'

export async function getAllRecordings() {
  const rows = await dbGetAll(STORE)
  return rows.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getRecording(id) {
  return dbGet(STORE, id)
}

export async function saveRecording(recording) {
  return dbPut(STORE, recording)
}

export async function deleteRecording(id) {
  return dbDelete(STORE, id)
}

export async function updateRecordingMetadata(id, metadata) {
  const rec = await getRecording(id)
  if (!rec) throw new Error(`Recording ${id} not found`)
  return dbPut(STORE, { ...rec, metadata: { ...rec.metadata, ...metadata } })
}
