import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile-form'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'

export const metadata = {
  title: 'My Profile - VibeFlow',
  description: 'Manage your profile settings',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile details
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <User className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile Settings</h1>
          <p className="text-slate-400 text-xs mt-1">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm 
        initialName={profile.full_name} 
        email={profile.email} 
        role={profile.role} 
      />
    </div>
  )
}
