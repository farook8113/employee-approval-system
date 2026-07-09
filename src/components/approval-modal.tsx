'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { reviewRequest } from '@/app/actions/requests'
import { approvalSchema } from '@/lib/schemas'
import { useToast } from '@/components/ui/toast'
import { X, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
}

export function ApprovalModal({ isOpen, onClose, request }: ApprovalModalProps) {
  const { toast } = useToast()
  
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setDecision('Approved')
    setComment('')
    setError(null)
  }, [request, isOpen])

  if (!isOpen || !request) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate inputs using Zod
    const result = approvalSchema.safeParse({
      status: decision,
      manager_comment: comment,
    })

    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    startTransition(async () => {
      const res = await reviewRequest(request.id, null, {
        status: decision,
        manager_comment: comment,
      })

      if (res?.error) {
        toast(res.error, 'error')
      } else {
        toast(
          `Request has been ${decision.toLowerCase()} successfully.`,
          decision === 'Approved' ? 'success' : 'error'
        )
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
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Review Request</h3>
            <span className="text-xs text-slate-500 mt-1 block">Title: {request.title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Decision */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Approval Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('Approved')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  decision === 'Approved'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                disabled={isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>

              <button
                type="button"
                onClick={() => setDecision('Rejected')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  decision === 'Rejected'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-950/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                disabled={isPending}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>

          {/* Justification Comment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Review Comments / Justification
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Provide comments explaining the approval or rejection reason..."
              className={`w-full bg-slate-950 border ${
                error ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all resize-none`}
              disabled={isPending}
            />
            {error && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-4 py-2 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                decision === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 shadow-emerald-950/30'
                  : 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/50 shadow-rose-950/30'
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
