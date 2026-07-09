'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { signupSchema } from '@/lib/schemas'
import { ShieldCheck, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'employee' | 'manager'>('employee')
  const [errors, setErrors] = useState<{
    full_name?: string
    email?: string
    password?: string
    role?: string
  }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError(null)

    // Client-side Zod validation
    const result = signupSchema.safeParse({
      full_name: fullName,
      email,
      password,
      role,
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

    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('role', role)

      const res = await signup(null, formData)
      if (res?.error) {
        setServerError(res.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel-glow border border-slate-800/80 rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register a new profile on the request system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg font-medium">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className={`w-full bg-slate-900 border ${
                errors.full_name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600`}
              disabled={isPending}
            />
            {errors.full_name && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className={`w-full bg-slate-900 border ${
                errors.email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600`}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-slate-900 border ${
                errors.password ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600`}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              System Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  role === 'employee'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                  className="sr-only"
                  disabled={isPending}
                />
                Employee
              </label>

              <label
                className={`flex items-center justify-center p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                  role === 'manager'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === 'manager'}
                  onChange={() => setRole('manager')}
                  className="sr-only"
                  disabled={isPending}
                />
                Manager
              </label>
            </div>
            {errors.role && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign In here
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-900 pt-6 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs transition-colors font-medium">
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  )
}
