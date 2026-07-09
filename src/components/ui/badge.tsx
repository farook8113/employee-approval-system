import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  let themeClasses = 'bg-slate-800 text-slate-300 border-slate-700'

  if (variant === 'success') {
    themeClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  } else if (variant === 'danger') {
    themeClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  } else if (variant === 'warning') {
    themeClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  } else if (variant === 'info') {
    themeClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${themeClasses} ${className}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved') {
    return <Badge variant="success">Approved</Badge>
  }
  if (status === 'Rejected') {
    return <Badge variant="danger">Rejected</Badge>
  }
  return <Badge variant="warning">Pending</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'High') {
    return <Badge variant="danger">High</Badge>
  }
  if (priority === 'Medium') {
    return <Badge variant="warning">Medium</Badge>
  }
  return <Badge variant="info">Low</Badge>
}
