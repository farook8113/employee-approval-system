'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { ToastProvider } from '@/components/ui/toast'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  LogOut, 
  ShieldCheck, 
  FileText
} from 'lucide-react'

interface UserProfile {
  full_name: string
  email: string
  role: 'employee' | 'manager'
}

interface DashboardShellProps {
  children: React.ReactNode
  profile: UserProfile
}

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const navLinks = [
    {
      name: profile.role === 'manager' ? 'Manager Dashboard' : 'Employee Dashboard',
      href: profile.role === 'manager' ? '/dashboard/manager' : '/dashboard/employee',
      icon: LayoutDashboard,
    },
    {
      name: 'My Profile',
      href: '/dashboard/profile',
      icon: User,
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
          {/* Logo */}
          <div className="p-6 flex items-center gap-2 border-b border-slate-800">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
              VibeFlow
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 mx-4 mt-6 bg-slate-950/50 border border-slate-800/60 rounded-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {getInitials(profile.full_name)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-slate-200 truncate leading-tight">
                {profile.full_name}
              </h4>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-600/10 border-l-4 border-indigo-500 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl text-sm font-medium transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Out Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar content */}
            <aside className="relative flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full animate-slide-in">
              <div className="p-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
                    VibeFlow
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 mx-4 mt-6 bg-slate-950/50 border border-slate-800/60 rounded-xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {getInitials(profile.full_name)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm text-slate-200 truncate leading-tight">
                    {profile.full_name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    {profile.role}
                  </span>
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-indigo-600/10 border-l-4 border-indigo-500 text-indigo-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl text-sm font-medium transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Navbar */}
          <header className="flex items-center justify-between lg:justify-end px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Status / Title Info */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block px-3 py-1 bg-slate-800/40 border border-slate-800 rounded-lg text-xs font-medium text-slate-400">
                Supabase Connected
              </span>
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                {getInitials(profile.full_name)}
              </div>
            </div>
          </header>

          {/* Main Panel Content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
