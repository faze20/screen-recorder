import React, { createContext, useContext, useState, useCallback } from 'react'
import Icon from './Icon.jsx'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 bg-surface-panel border border-border-dark rounded-xl shadow-glow text-sm text-white animate-in slide-in-from-right"
          >
            <Icon
              name={t.type === 'error' ? 'error' : t.type === 'success' ? 'check_circle' : 'info'}
              size={16}
              className={t.type === 'error' ? 'text-red-400' : t.type === 'success' ? 'text-primary' : 'text-blue-400'}
            />
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
