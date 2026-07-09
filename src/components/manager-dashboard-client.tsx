'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { ApprovalModal } from '@/components/approval-modal'
import { RequestDetailsModal } from '@/components/request-details-modal'
import { 
  Search, 
  Eye, 
  CheckSquare, 
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown
} from 'lucide-react'

interface ManagerDashboardClientProps {
  initialRequests: any[]
}

export function ManagerDashboardClient({ initialRequests }: ManagerDashboardClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for search and filters
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All')
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All')

  // Sorting state
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortAscending, setSortAscending] = useState<boolean>(false)

  // Modals state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [requestToReview, setRequestToReview] = useState<any>(null)

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // Real-time PostgreSQL subscription
  useEffect(() => {
    const channel = supabase
      .channel('requests-manager-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  // Sync URL search params
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

  // Calculate stats based on initialRequests (global overview)
  const totalCount = initialRequests.length
  const pendingCount = initialRequests.filter((r) => r.status === 'Pending').length
  const approvedCount = initialRequests.filter((r) => r.status === 'Approved').length
  const rejectedCount = initialRequests.filter((r) => r.status === 'Rejected').length

  // Client side sorting logic
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAscending(!sortAscending)
    } else {
      setSortField(field)
      setSortAscending(true)
    }
  }

  // First sort the requests
  const sortedRequests = [...initialRequests].sort((a, b) => {
    let comparison = 0
    if (sortField === 'created_at' || sortField === 'start_date' || sortField === 'end_date') {
      comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
    } else if (sortField === 'employee_name') {
      const nameA = a.profiles?.full_name || ''
      const nameB = b.profiles?.full_name || ''
      comparison = nameA.localeCompare(nameB)
    } else {
      const valA = String(a[sortField] || '')
      const valB = String(b[sortField] || '')
      comparison = valA.localeCompare(valB)
    }
    return sortAscending ? comparison : -comparison
  })

  // Then apply filters to sorted list
  const filteredRequests = sortedRequests.filter((req) => {
    const searchLower = searchVal.toLowerCase()
    const matchesSearch =
      req.title.toLowerCase().includes(searchLower) ||
      (req.profiles?.full_name || '').toLowerCase().includes(searchLower)

    const matchesCategory = categoryFilter === 'All' || req.category === categoryFilter
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus
  })

  // Export filtered list to CSV
  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Title', 'Category', 'Priority', 'Start Date', 'End Date', 'Status', 'Created At', 'Manager Comment']
    const rows = filteredRequests.map((req) => [
      req.profiles?.full_name || 'Unknown',
      req.title,
      req.category,
      req.priority,
      req.start_date,
      req.end_date,
      req.status,
      req.created_at,
      req.manager_comment || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `requests_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openApprovalModal = (request: any) => {
    setRequestToReview(request)
    setIsApprovalModalOpen(true)
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
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Review request statistics, search records, and manage approvals</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="self-start sm:self-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Requests</span>
            <h3 className="text-2xl font-extrabold mt-1 text-indigo-400">{totalCount}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending</span>
            <h3 className="text-2xl font-extrabold mt-1 text-amber-400">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Approved */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Approved</span>
            <h3 className="text-2xl font-extrabold mt-1 text-emerald-400">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Rejected */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rejected</span>
            <h3 className="text-2xl font-extrabold mt-1 text-rose-400">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title/employee..."
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

      {/* Request Table Listing */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-slate-500 mb-4">
              <AlertCircle className="h-8 w-8 text-indigo-400/80" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No requests match filters</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Try adjusting your query inputs to locate different employee requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 bg-slate-950/20 select-none">
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('employee_name')}>
                    <span className="flex items-center gap-1">
                      Employee Name <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('category')}>
                    <span className="flex items-center gap-1">
                      Category <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('title')}>
                    <span className="flex items-center gap-1">
                      Request Title <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('priority')}>
                    <span className="flex items-center gap-1">
                      Priority <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('created_at')}>
                    <span className="flex items-center gap-1">
                      Created Date <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('status')}>
                    <span className="flex items-center gap-1">
                      Status <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-900/20 transition-colors group text-xs text-slate-300"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {req.profiles?.full_name || 'Unknown Profile'}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 font-medium text-slate-400">
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

                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        {formatDate(req.created_at)}
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
                          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Approve/Reject Trigger */}
                        {req.status === 'Pending' ? (
                          <button
                            onClick={() => openApprovalModal(req)}
                            className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/15 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                            title="Review Approval"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <div className="w-[34px] h-[34px]" />
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

      {/* Review Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        request={requestToReview}
      />

      {/* Details View Modal */}
      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        employeeName={selectedRequest?.profiles?.full_name}
      />
    </div>
  )
}
