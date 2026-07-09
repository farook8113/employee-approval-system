import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManagerDashboardClient } from '@/components/manager-dashboard-client'

export const metadata = {
  title: 'Manager Dashboard - VibeFlow',
  description: 'Manage and review employee requests',
}

export default async function ManagerPage() {
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

  // Redirect non-managers away from manager dashboard
  if (profile.role !== 'manager') {
    redirect('/dashboard/employee')
  }

  // Fetch all requests joining their corresponding employee profiles
  const { data: requests, error: requestsError } = await supabase
    .from('requests')
    .select('*, profiles:employee_id(full_name)')
    .order('created_at', { ascending: false })

  if (requestsError) {
    console.error('Error fetching manager requests:', requestsError)
  }

  return (
    <ManagerDashboardClient 
      initialRequests={requests || []} 
    />
  )
}
