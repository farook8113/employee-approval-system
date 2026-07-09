'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requestSchema, approvalSchema, profileSchema } from '@/lib/schemas'

export async function createRequest(prevState: any, data: any) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate request inputs
  const result = requestSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase.from('requests').insert({
    employee_id: user.id,
    title: result.data.title,
    description: result.data.description,
    category: result.data.category,
    priority: result.data.priority,
    start_date: result.data.start_date,
    end_date: result.data.end_date,
    attachment_url: result.data.attachment_url || null,
    status: 'Pending',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/employee')
  revalidatePath('/dashboard/manager')
  return { success: true }
}

export async function updateRequest(id: string, prevState: any, data: any) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate request inputs
  const result = requestSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase
    .from('requests')
    .update({
      title: result.data.title,
      description: result.data.description,
      category: result.data.category,
      priority: result.data.priority,
      start_date: result.data.start_date,
      end_date: result.data.end_date,
      attachment_url: result.data.attachment_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('employee_id', user.id)
    .eq('status', 'Pending') // Can only update pending requests

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/employee')
  revalidatePath('/dashboard/manager')
  return { success: true }
}

export async function deleteRequest(id: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', id)
    .eq('employee_id', user.id)
    .eq('status', 'Pending') // Can only delete pending requests

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/employee')
  revalidatePath('/dashboard/manager')
  return { success: true }
}

export async function reviewRequest(id: string, prevState: any, data: any) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate manager role in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'manager') {
    return { error: 'Not authorized: Manager access required' }
  }

  // Validate manager approval inputs
  const result = approvalSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase
    .from('requests')
    .update({
      status: result.data.status,
      manager_comment: result.data.manager_comment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/employee')
  revalidatePath('/dashboard/manager')
  return { success: true }
}

export async function updateProfile(prevState: any, data: any) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate profile inputs
  const result = profileSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: result.data.full_name,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/employee')
  revalidatePath('/dashboard/manager')
  return { success: true }
}
