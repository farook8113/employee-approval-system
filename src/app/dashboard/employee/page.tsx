import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployeeDashboardClient } from '@/components/employee-dashboard-client'

export const metadata = {
  title: 'Employee Dashboard - VibeFlow',
  description: 'Manage your approval requests',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    priority?: string
    status?: string
  }>
}

export default async function EmployeePage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.search || ''
  const category = params.category || ''
  const priority = params.priority || ''
  const status = params.status || ''

  const supabase = await createClient()

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile details
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  // Redirect manager users to their appropriate dashboard
  if (profile.role === 'manager') {
    redirect('/dashboard/manager')
  }

  // Build filtered query for employee's own requests
  let query = supabase
    .from('requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }
  if (priority && priority !== 'All') {
    query = query.eq('priority', priority)
  }
  if (status && status !== 'All') {
    query = query.eq('status', status)
  }

  const { data: requests } = await query

  return (
    <EmployeeDashboardClient 
      initialRequests={requests || []} 
      userId={user.id} 
    />
  )
}
