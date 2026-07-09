'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => {
          let themeClasses = 'bg-slate-900 border-slate-800 text-slate-100'
          let Icon = Info

          if (t.type === 'success') {
            themeClasses = 'bg-slate-900/90 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20'
            Icon = CheckCircle2
          } else if (t.type === 'error') {
            themeClasses = 'bg-slate-900/90 border-rose-500/30 text-rose-400 shadow-rose-950/20'
            Icon = AlertCircle
          } else if (t.type === 'warning') {
            themeClasses = 'bg-slate-900/90 border-amber-500/30 text-amber-400 shadow-amber-950/20'
            Icon = AlertTriangle
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 hover:scale-[1.02] ${themeClasses}`}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium text-slate-200 leading-relaxed">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
