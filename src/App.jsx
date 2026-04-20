import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RecordPage from './pages/RecordPage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import EditorPage from './editor/EditorPage.jsx'
import { useRecordingStore } from './store/recordingStore.js'

export default function App() {
  const loadRecordings = useRecordingStore(s => s.loadRecordings)

  useEffect(() => {
    loadRecordings()
  }, [loadRecordings])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
