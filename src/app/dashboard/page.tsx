import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // If auth user exists but has no profile row, log out and send to login
    await supabase.auth.signOut()
    redirect('/login')
  }

  // Redirect based on role
  if (profile.role === 'manager') {
    redirect('/dashboard/manager')
  } else {
    redirect('/dashboard/employee')
  }
}
