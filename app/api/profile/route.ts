// app/api/profile/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
})

export async function PUT(request: Request) {
  const user = await getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const body = await request.json()

  const parsed = ProfileUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error }), { status: 400 })
  }

  const { name, phone_number, address } = parsed.data

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name,
      phone_number,
      address,
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}
