'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createRequest, updateRequest } from '@/app/actions/requests'
import { requestSchema } from '@/lib/schemas'
import { useToast } from '@/components/ui/toast'
import { X, Loader2, Upload, File } from 'lucide-react'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  requestToEdit?: any
}

export function RequestModal({ isOpen, onClose, userId, requestToEdit }: RequestModalProps) {
  const supabase = createClient()
  const { toast } = useToast()
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<any>('Leave')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<any>('Medium')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [errors, setErrors] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (requestToEdit) {
      setTitle(requestToEdit.title)
      setCategory(requestToEdit.category)
      setDescription(requestToEdit.description)
      setPriority(requestToEdit.priority)
      setStartDate(requestToEdit.start_date)
      setEndDate(requestToEdit.end_date)
      setFile(null)
    } else {
      setTitle('')
      setCategory('Leave')
      setDescription('')
      setPriority('Medium')
      setStartDate('')
      setEndDate('')
      setFile(null)
    }
    setErrors({})
  }, [requestToEdit, isOpen])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    let attachmentUrl = requestToEdit?.attachment_url || ''

    // 1. Client-side Zod validation
    const result = requestSchema.safeParse({
      title,
      category,
      description,
      priority,
      start_date: startDate,
      end_date: endDate,
      attachment_url: attachmentUrl,
    })

    if (!result.success) {
      const fieldErrors: any = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    // 2. Upload file to Supabase Storage if selected
    if (file) {
      setUploading(true)
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
        attachmentUrl = data.publicUrl
      } catch (err: any) {
        toast(`File upload failed: ${err.message}`, 'error')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }

    // 3. Submit request fields to Server Action
    startTransition(async () => {
      const payload = {
        title,
        category,
        description,
        priority,
        start_date: startDate,
        end_date: endDate,
        attachment_url: attachmentUrl,
      }

      let res
      if (requestToEdit) {
        res = await updateRequest(requestToEdit.id, null, payload)
      } else {
        res = await createRequest(null, payload)
      }

      if (res?.error) {
        toast(res.error, 'error')
      } else {
        toast(
          requestToEdit
            ? 'Your request has been successfully updated.'
            : 'Your request has been successfully submitted.',
          'success'
        )
        onClose()
      }
    })
  }

  const categories = ['Leave', 'Equipment', 'Software Access', 'Budget', 'Travel', 'Other']
  const priorities = ['Low', 'Medium', 'High']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h3 className="text-lg font-bold text-slate-100">
            {requestToEdit ? 'Edit Pending Request' : 'Submit New Request'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Request Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Travel to HQ for Planning"
              className={`w-full bg-slate-950 border ${
                errors.title ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all`}
              disabled={isPending || uploading}
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all"
                disabled={isPending || uploading}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all"
                disabled={isPending || uploading}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide context and details about your request..."
              className={`w-full bg-slate-950 border ${
                errors.description ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all resize-none`}
              disabled={isPending || uploading}
            />
            {errors.description && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full bg-slate-950 border ${
                  errors.start_date ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all`}
                disabled={isPending || uploading}
              />
              {errors.start_date && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full bg-slate-950 border ${
                  errors.end_date ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all`}
                disabled={isPending || uploading}
              />
              {errors.end_date && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Supporting Attachment (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Choose File</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={isPending || uploading}
                />
              </label>
              <div className="flex-1 text-xs text-slate-500 truncate">
                {file ? (
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <File className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                ) : requestToEdit?.attachment_url ? (
                  <span className="text-slate-400">Current file will be kept unless overwritten</span>
                ) : (
                  'No file chosen (PDF, Images, or Word docs up to 10MB)'
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              disabled={isPending || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
            >
              {isPending || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
