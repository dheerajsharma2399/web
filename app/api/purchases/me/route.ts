// apps/web/app/api/purchases/me/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { SweetFilterSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { getPagination } from '@/lib/pagination'

export async function GET(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const parsedFilters = SweetFilterSchema.parse(Object.fromEntries(searchParams))
    const { page, limit, sort, dir } = parsedFilters

    let query = supabase.from('purchases').select('*, sweets(*)').eq('user_id', user.id)

    const { from, to } = getPagination(page, limit)
    query = query.range(from, to).order(sort, { ascending: dir === 'asc' })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error fetching user purchases:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
