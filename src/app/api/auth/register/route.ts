import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthRegister } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = createClient()
  const json = await request.json()
  const validated = AuthRegister.safeParse(json)

  if (!validated.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
  }

  const { email, password, name } = validated.data

  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (signUpError) {
    return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: signUpError.message } }, { status: 500 })
  }

  // Also create a profile for the new user
  if (user) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: user.id, name, role: 'user' })
      if (profileError) {
        // If profile creation fails, we should probably delete the user, but for now we just log the error
        console.error('Failed to create profile for user:', user.id, profileError)
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: 'Failed to create user profile.' } }, { status: 500 })
      }
  }


  return NextResponse.json({ user })
}
