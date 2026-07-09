import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Retrieve user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  return (
    <DashboardShell profile={profile as any}>
      {children}
    </DashboardShell>
  )
}
