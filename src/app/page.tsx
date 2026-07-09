'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet, 
  Clock, 
  Database,
  Loader2
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [session, setSession] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [demoLoginLoading, setDemoLoginLoading] = useState<string | null>(null)
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [seedingMessage, setSeedingMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoadingSession(false)
    })
  }, [supabase])

  const handleQuickLogin = async (email: string, role: string) => {
    setDemoLoginLoading(role)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'Password123',
      })
      if (error) {
        alert(`Login failed: ${error.message}. Please ensure the database has been seeded.`)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      alert(`An error occurred: ${err.message}`)
    } finally {
      setDemoLoginLoading(null)
    }
  }

  const handleSeedDatabase = async () => {
    setSeedingStatus('loading')
    setSeedingMessage('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        setSeedingStatus('success')
        setSeedingMessage(data.message)
      } else {
        setSeedingStatus('error')
        setSeedingMessage(data.error || 'Failed to seed database.')
      }
    } catch (err: any) {
      setSeedingStatus('error')
      setSeedingMessage(err.message || 'Network error seeding database.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
            VibeFlow
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {!loadingSession && (
            <>
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-950/50 flex items-center gap-1.5 text-sm"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-slate-200 hover:text-white rounded-lg font-medium transition-all text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center z-10">
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" /> Rapid Prototyper Assessment Edition
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Modern Employee Request <br className="hidden md:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            Approval Management
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mt-6 leading-relaxed">
          Create, track, and approve organization-wide requests seamlessly. Complete with role-based dashboard control, attachments, RLS security policies, and real-time updates.
        </p>

        {/* Demo Operations Panel */}
        <section className="mt-12 max-w-3xl w-full glass-panel-glow rounded-2xl border border-slate-800/80 p-6 md:p-8 text-left animate-slide-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-400" /> Seeding & Environment Setup
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Initialize the database with 2 main roles (Manager & Employee), 5 employees, and 25 mock requests.
              </p>
            </div>
            <div>
              <button
                onClick={handleSeedDatabase}
                disabled={seedingStatus === 'loading'}
                className="w-full md:w-auto px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-800/50 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
              >
                {seedingStatus === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Seeding...
                  </>
                ) : (
                  'Seed Mock Database'
                )}
              </button>
            </div>
          </div>

          {seedingStatus === 'success' && (
            <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs leading-relaxed">
              <strong>Success:</strong> {seedingMessage}
            </div>
          )}

          {seedingStatus === 'error' && (
            <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs leading-relaxed">
              <strong>Configuration Required:</strong> {seedingMessage} <br />
              Make sure you have created the schema using `schema.sql` and set up the `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
            </div>
          )}

          {/* Quick Access Credentials */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Demo Credentials & Quick Sign-In
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Login Card */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                      Employee Account
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">
                      Role: Employee
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">employee@test.com</p>
                  <p className="text-xs text-slate-500 mt-1">Password: Password123</p>
                </div>
                <button
                  onClick={() => handleQuickLogin('employee@test.com', 'employee')}
                  disabled={demoLoginLoading !== null}
                  className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {demoLoginLoading === 'employee' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      Login as Employee <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Manager Login Card */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      Manager Account
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">
                      Role: Manager
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">manager@test.com</p>
                  <p className="text-xs text-slate-500 mt-1">Password: Password123</p>
                </div>
                <button
                  onClick={() => handleQuickLogin('manager@test.com', 'manager')}
                  disabled={demoLoginLoading !== null}
                  className="mt-4 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/20 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {demoLoginLoading === 'manager' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      Login as Manager <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {/* Card 1 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg inline-block text-indigo-400 mb-4">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Role-Based Controls</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Clean separation of workflows. Employees can manage pending requests, while managers oversee, search, and approve all records.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg inline-block text-indigo-400 mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Status History & Timeline</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Track status logs and manager comments across leave, equipment, software access, budget, and travel categories.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-xl text-left">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg inline-block text-indigo-400 mb-4">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">CSV Reports Export</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Managers can export filtered listings in tabular CSV formats, facilitating rapid audit operations.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} VibeFlow - Build for Rapid Prototyper Assessment. All Rights Reserved.
      </footer>
    </div>
  )
}
