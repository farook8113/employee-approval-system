'use client'

import React, { useState, useTransition } from 'react'
import { updateProfile } from '@/app/actions/requests'
import { profileSchema } from '@/lib/schemas'
import { useToast } from '@/components/ui/toast'
import { Loader2, Save } from 'lucide-react'

interface ProfileFormProps {
  initialName: string
  email: string
  role: string
}

export function ProfileForm({ initialName, email, role }: ProfileFormProps) {
  const { toast } = useToast()
  const [fullName, setFullName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate client side using Zod
    const result = profileSchema.safeParse({ full_name: fullName })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    startTransition(async () => {
      const res = await updateProfile(null, { full_name: fullName })
      if (res?.error) {
        toast(res.error, 'error')
      } else {
        toast('Your profile information was updated.', 'success')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel border border-slate-800/80 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Registered Email Address
            </span>
            <p className="text-sm font-medium text-slate-300">{email}</p>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              System Authorization Role
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              {role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel border border-slate-800/80 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Edit Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full bg-slate-900 border ${
                error ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all`}
              disabled={isPending}
            />
            {error && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
