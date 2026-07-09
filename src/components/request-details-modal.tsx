'use client'

import React from 'react'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { 
  X, 
  Calendar, 
  Paperclip, 
  FileText, 
  History, 
  User, 
  MessageSquare,
  ArrowDownToLine
} from 'lucide-react'

interface RequestDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  employeeName?: string
}

export function RequestDetailsModal({ isOpen, onClose, request, employeeName }: RequestDetailsModalProps) {
  if (!isOpen || !request) return null

  const getFilename = (url: string) => {
    try {
      const decoded = decodeURIComponent(url)
      return decoded.split('/').pop() || 'Attachment File'
    } catch {
      return 'Attachment File'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTimestamp = (timestampStr: string) => {
    return new Date(timestampStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in z-10">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{request.title}</h3>
            <span className="text-xs text-slate-500 mt-1 block">Category: {request.category}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            {employeeName && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/40 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                {employeeName}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Start Date</span>
                <span className="text-xs font-semibold text-slate-200">{formatDate(request.start_date)}</span>
              </div>
            </div>
            <div className="h-8 border-l border-slate-800" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">End Date</span>
                <span className="text-xs font-semibold text-slate-200">{formatDate(request.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
            <p className="text-sm text-slate-300 bg-slate-950/40 border border-slate-800/40 rounded-xl p-4 leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>

          {/* Attachment */}
          {request.attachment_url && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Uploaded Document</h4>
              <a
                href={request.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-semibold text-indigo-300 truncate">
                    {getFilename(request.attachment_url)}
                  </span>
                </div>
                <ArrowDownToLine className="h-4 w-4 text-indigo-400 shrink-0" />
              </a>
            </div>
          )}

          {/* Manager Comments */}
          {request.manager_comment && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                Manager Review Comments
              </h4>
              <div className={`p-4 rounded-xl border text-xs leading-relaxed font-medium ${
                request.status === 'Approved' 
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
              }`}>
                {request.manager_comment}
              </div>
            </div>
          )}

          {/* Timeline History */}
          <div className="border-t border-slate-800 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-400" />
              Audit Tracking History
            </h4>

            <div className="space-y-4">
              {/* Step 1: Created */}
              <div className="flex gap-3 relative">
                {/* Visual Line */}
                <div className="w-0.5 bg-slate-800 absolute top-5 bottom-[-16px] left-2 z-0" />
                {/* Bullet */}
                <div className="h-4 w-4 rounded-full border border-indigo-500 bg-slate-900 shrink-0 z-10 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-200">Request Submitted</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {formatTimestamp(request.created_at)}
                  </span>
                </div>
              </div>

              {/* Step 2: Current Status */}
              <div className="flex gap-3 relative">
                {/* Bullet */}
                <div className={`h-4 w-4 rounded-full border shrink-0 z-10 flex items-center justify-center ${
                  request.status === 'Pending' 
                    ? 'border-amber-500 bg-slate-900' 
                    : request.status === 'Approved' 
                    ? 'border-emerald-500 bg-slate-900' 
                    : 'border-rose-500 bg-slate-900'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    request.status === 'Pending' 
                      ? 'bg-amber-500' 
                      : request.status === 'Approved' 
                      ? 'bg-emerald-500' 
                      : 'bg-rose-500'
                  }`} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-200">
                    {request.status === 'Pending' 
                      ? 'Awaiting Manager Approval' 
                      : request.status === 'Approved' 
                      ? 'Request Approved' 
                      : 'Request Rejected'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                    {request.status === 'Pending' 
                      ? 'In Review Queue' 
                      : `Reviewed on ${formatTimestamp(request.updated_at)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-800 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
