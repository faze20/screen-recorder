import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import RecordingCard from '../components/library/RecordingCard.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import IconButton from '../components/ui/IconButton.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useRecordingStore } from '../store/recordingStore.js'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'duration', label: 'Longest first' },
]

export default function LibraryPage() {
  const navigate = useNavigate()
  const recordings = useRecordingStore(s => s.recordings)
  const removeRecording = useRecordingStore(s => s.removeRecording)
  const loading = useRecordingStore(s => s.loading)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [deleteId, setDeleteId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = recordings
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt
      if (sort === 'oldest') return a.createdAt - b.createdAt
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'duration') return (b.duration || 0) - (a.duration || 0)
      return 0
    })

  const handleDelete = async () => {
    if (deleteId) {
      await removeRecording(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="h-screen flex bg-bg-dark overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-dark flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconButton
                icon="menu"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
                title="Open menu"
              />
              <div>
                <h1 className="text-base font-bold text-white">Library</h1>
                <p className="text-xs text-gray-500">{recordings.length} recording{recordings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/record')} className="md:hidden">
              <Icon name="add" size={14} />
              New
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Search recordings…"
              prefix={<Icon name="search" size={14} />}
              className="flex-1 md:w-52 md:flex-none"
            />
            <Select value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-36 md:w-40" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
              <Icon name="loading" size={20} className="animate-spin" />
              Loading recordings…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-panel border border-dashed border-border-dark flex items-center justify-center">
                <Icon name="movie" size={32} className="text-gray-700" />
              </div>
              {search ? (
                <div>
                  <p className="text-white font-medium">No results for "{search}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium">No recordings yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start your first recording to see it here</p>
                  <Button variant="primary" className="mt-4" onClick={() => navigate('/record')}>
                    <Icon name="add" size={16} />
                    New Recording
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(rec => (
                <RecordingCard
                  key={rec.id}
                  recording={rec}
                  onDelete={setDeleteId}
                />
              ))}
              {/* New recording card */}
              <button
                onClick={() => navigate('/record')}
                className="aspect-video bg-surface-panel border border-dashed border-border-dark rounded-xl flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <Icon name="add" size={28} />
                <span className="text-xs font-medium">New Recording</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Recording">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">This will permanently delete the recording. This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
