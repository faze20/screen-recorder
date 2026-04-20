const DB_NAME = 'FocusRecordDB'
const DB_VERSION = 1

let dbInstance = null

export function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('recordings')) {
        const store = db.createObjectStore('recordings', { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
    }

    req.onsuccess = e => {
      dbInstance = e.target.result
      resolve(dbInstance)
    }

    req.onerror = e => reject(e.target.error)
  })
}

export async function dbGet(storeName, key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbGetAll(storeName) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbPut(storeName, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(value)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbDelete(storeName, key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
