import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthLogin } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = createClient()
  const json = await request.json()
  const validated = AuthLogin.safeParse(json)

  if (!validated.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
  }

  const { email, password } = validated.data

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 401 })
  }

  return NextResponse.json({ user })
}
