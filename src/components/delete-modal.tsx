'use client'

import React, { useTransition } from 'react'
import { deleteRequest } from '@/app/actions/requests'
import { useToast } from '@/components/ui/toast'
import { X, Loader2, AlertTriangle } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string | null
  requestTitle: string
}

export function DeleteModal({ isOpen, onClose, requestId, requestTitle }: DeleteModalProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  if (!isOpen || !requestId) return null

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteRequest(requestId)
      if (res?.error) {
        toast(res.error, 'error')
      } else {
        toast('The request has been deleted.', 'success')
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-slide-in z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Delete Request</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-200">{requestTitle}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/50 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/30"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
              </>
            ) : (
              'Delete Permanent'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
