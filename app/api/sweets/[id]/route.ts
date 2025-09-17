// apps/web/app/api/sweets/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SweetSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { id } = params

    const { data, error } = await supabase.from('sweets').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sweet not found' } }, { status: 404 })
      }
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Unexpected error fetching sweet:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin() // Only admins can update sweets

    const supabase = createServerSupabaseClient()
    const { id } = params
    const body = await request.json()
    const updatedSweet = SweetSchema.parse(body)

    const { data, error } = await supabase.from('sweets').update(updatedSweet).eq('id', id).select().single()

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
    console.error('Unexpected error updating sweet:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin() // Only admins can delete sweets

    const supabase = createServerSupabaseClient()
    const { id } = params

    const { error } = await supabase.from('sweets').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ message: 'Sweet deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error deleting sweet:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
