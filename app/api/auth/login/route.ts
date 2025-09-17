// apps/web/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AuthLoginSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { email, password } = AuthLoginSchema.parse(body)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: { code: 'AUTH_ERROR', message: error.message } }, { status: 400 })
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error during login:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
