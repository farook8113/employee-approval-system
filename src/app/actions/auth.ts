'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, signupSchema } from '@/lib/schemas'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate input
  const result = loginSchema.safeParse({ email, password })
  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  // Validate input
  const result = signupSchema.safeParse({ full_name, email, password, role })
  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    }
  }

  const supabase = await createClient()
  
  // Sign up with user metadata so the database trigger can copy it to the profiles table
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      },
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
