// apps/web/app/api/sweets/[id]/restock/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { RestockSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin() // Only admins can restock sweets

    const supabase = createServerSupabaseClient()
    const { id } = params
    const body = await request.json()
    const { quantity } = RestockSchema.parse(body)

    const { data, error } = await supabase.from('sweets')
      .update({ quantity: `quantity + ${quantity}` })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sweet not found' } }, { status: 404 })
      }
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error during restock:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
