// apps/web/lib/auth.ts
import { createServerSupabaseClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: {
      user
    } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getProfile() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: {
      user
    } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return profile
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard') // Or a 403 forbidden page
  }
  return profile
}
