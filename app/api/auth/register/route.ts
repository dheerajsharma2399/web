// apps/web/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AuthRegisterSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { email, password, name } = AuthRegisterSchema.parse(body)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: { code: 'AUTH_ERROR', message: error.message } }, { status: 400 })
    }

    // Insert into profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user?.id,
      name,
      role: 'user',
    })

    if (profileError) {
      // If profile creation fails, we should ideally roll back the user creation or handle it gracefully
      console.error('Error creating user profile:', profileError)
      return NextResponse.json({ error: { code: 'PROFILE_ERROR', message: profileError.message } }, { status: 500 })
    }

    return NextResponse.json({ message: 'Registration successful' }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error during registration:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
