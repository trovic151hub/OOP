import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ id, message, type, onDismiss }) {
  const cfg = {
    success: { icon: CheckCircle, cls: 'bg-emerald-600 text-white' },
    error:   { icon: AlertTriangle, cls: 'bg-red-600 text-white' },
    info:    { icon: Info, cls: 'bg-teal-600 text-white' },
  }
  const { icon: Icon, cls } = cfg[type] || cfg.success
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold min-w-64 animate-fade-up ${cls}`}>
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="opacity-70 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
