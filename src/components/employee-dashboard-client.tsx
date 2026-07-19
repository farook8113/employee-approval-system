'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { RequestModal } from '@/components/request-modal'
import { DeleteModal } from '@/components/delete-modal'
import { RequestDetailsModal } from '@/components/request-details-modal'
import { useToast } from '@/components/ui/toast'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react'

interface EmployeeDashboardClientProps {
  initialRequests: any[]
  userId: string
}

export function EmployeeDashboardClient({ initialRequests, userId }: EmployeeDashboardClientProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for search and filters
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All')
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All')

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestToEdit, setRequestToEdit] = useState<any>(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<any>(null)

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Real-time PostgreSQL subscription
  useEffect(() => {
    const channel = supabase
      .channel('requests-employee-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests', filter: `employee_id=eq.${userId}` },
        (payload: any) => {
          if (payload.old && payload.old.status !== payload.new.status) {
            toast(
              `Request "${payload.new.title}" was ${payload.new.status.toLowerCase()}!`,
              payload.new.status === 'Approved' ? 'success' : 'error'
            )
          }
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'requests', filter: `employee_id=eq.${userId}` },
        () => {
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'requests', filter: `employee_id=eq.${userId}` },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, userId, toast])

  // Synchronize filter selections with URL parameters for Next.js App Router
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchVal) params.set('search', searchVal)
    if (categoryFilter !== 'All') params.set('category', categoryFilter)
    if (priorityFilter !== 'All') params.set('priority', priorityFilter)
    if (statusFilter !== 'All') params.set('status', statusFilter)

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }, [searchVal, categoryFilter, priorityFilter, statusFilter, pathname, router])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const openNewRequestModal = () => {
    setRequestToEdit(null)
    setIsRequestModalOpen(true)
  }

  const openEditRequestModal = (request: any) => {
    setRequestToEdit(request)
    setIsRequestModalOpen(true)
  }

  const openDeleteModal = (request: any) => {
    setRequestToDelete(request)
    setIsDeleteModalOpen(true)
  }

  const openDetailsModal = (request: any) => {
    setSelectedRequest(request)
    setIsDetailsModalOpen(true)
  }

  const categories = ['All', 'Leave', 'Equipment', 'Software Access', 'Budget', 'Travel', 'Other']
  const priorities = ['All', 'Low', 'Medium', 'High']
  const statuses = ['All', 'Pending', 'Approved', 'Rejected']

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Requests Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Submit, update, and track authorization requests</p>
        </div>
        <button
          onClick={openNewRequestModal}
          className="self-start sm:self-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-900/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Request
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by request title..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Listing Panel */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden">
        {initialRequests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-slate-500 mb-4">
              <AlertCircle className="h-8 w-8 text-indigo-400/80" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No requests found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Try adjusting your search criteria or create a new request if you have none yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 bg-slate-950/20">
                  <th className="px-6 py-4">Request Category</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Dates Required</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {initialRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-900/20 transition-colors group text-xs text-slate-300"
                  >
                    {/* Category */}
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        {req.category}
                      </span>
                    </td>
                    
                    {/* Title */}
                    <td className="px-6 py-4 font-medium text-slate-300 max-w-xs truncate">
                      {req.title}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        {formatDate(req.start_date)} - {formatDate(req.end_date)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => openDetailsModal(req)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit: Available only for Pending requests */}
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => openEditRequestModal(req)}
                              className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/15 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all"
                              title="Edit Request"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(req)}
                              className="p-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/15 rounded-lg text-rose-400 hover:text-rose-300 transition-all"
                              title="Delete Request"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-[34px] h-[34px]" />
                            <div className="w-[34px] h-[34px]" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals Assembly */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        userId={userId}
        requestToEdit={requestToEdit}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        requestId={requestToDelete?.id}
        requestTitle={requestToDelete?.title || ''}
      />

      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  )
}
