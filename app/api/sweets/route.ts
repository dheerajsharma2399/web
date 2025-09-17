// apps/web/app/api/sweets/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SweetSchema, SweetFilterSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { getPagination } from '@/lib/pagination'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const parsedFilters = SweetFilterSchema.parse(Object.fromEntries(searchParams))
    const { q, category, minPrice, maxPrice, page, limit, sort, dir } = parsedFilters

    let query = supabase.from('sweets').select('*')

    if (q) {
      query = query.ilike('name', `%{q}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (minPrice !== undefined) {
      query = query.gte('price_cents', minPrice)
    }
    if (maxPrice !== undefined) {
      query = query.lte('price_cents', maxPrice)
    }

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
    console.error('Unexpected error fetching sweets:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin() // Only admins can create sweets

    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const newSweet = SweetSchema.parse(body)

    const { data, error } = await supabase.from('sweets').insert(newSweet).select().single()

    if (error) {
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: error.errors } }, { status: 400 })
    }
    console.error('Unexpected error creating sweet:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}
