// apps/web/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: { code: 'AUTH_ERROR', message: error.message } }, { status: 400 })
    }

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error during logout:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
