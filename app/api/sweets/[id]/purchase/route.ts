// apps/web/app/api/sweets/[id]/purchase/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PurchaseSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { getSession } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { id: sweet_id } = params
    const body = await request.json()
    const { quantity } = PurchaseSchema.parse(body)

    const { data, error } = await supabase.rpc('perform_purchase', {
      p_user: session.user.id,
      p_sweet: sweet_id,
      p_qty: quantity,
    })

    if (error) {
      if (error.message.includes('insufficient_stock')) {
        return NextResponse.json({ error: { code: 'CONFLICT', message: 'Insufficient stock' } }, { status: 409 })
      }
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error during purchase:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
