'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { loginSchema } from '@/lib/schemas'
import { ShieldCheck, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAutofill = (selectedEmail: string) => {
    setEmail(selectedEmail)
    setPassword('Password123')
    setErrors({})
    setServerError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError(null)

    // Client-side Zod validation
    const result = loginSchema.safeParse({ email, password })
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
      formData.append('email', email)
      formData.append('password', password)
      
      const res = await login(null, formData)
      if (res?.error) {
        setServerError(res.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[440px] w-full glass-panel-glow border border-slate-800/80 rounded-3xl p-10 md:p-12 relative z-10 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-5 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
          <p className="text-[11px] text-slate-400 mt-2 tracking-wide">Enter your workspace account credentials</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs rounded-xl font-medium leading-relaxed">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className={`w-full bg-slate-900 border ${
                errors.email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-3.5 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600`}
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-rose-400 text-[10px] mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-slate-900 border ${
                errors.password ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-3.5 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600`}
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-rose-400 text-[10px] mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="mt-8 pt-6 border-t border-slate-900/80">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3.5">
              Demo Autofill Shortcuts
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAutofill('employee@test.com')}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-full text-[10px] font-semibold transition-all cursor-pointer"
              >
                Employee Account
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('manager@test.com')}
                className="px-4 py-1.5 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-900/60 text-indigo-400 hover:text-indigo-300 rounded-full text-[10px] font-semibold transition-all cursor-pointer"
              >
                Manager Account
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Links */}
        <div className="mt-8 text-center text-xs text-slate-400 flex flex-col gap-4">
          <div>
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Register here
            </Link>
          </div>
          <div className="border-t border-slate-900/50 pt-4">
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
