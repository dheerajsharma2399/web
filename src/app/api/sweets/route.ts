import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SweetCreate, QueryParams } from '@/lib/validations'

// GET /api/sweets
export async function GET(request: Request) {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    const validated = QueryParams.safeParse(query)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: validated.error.flatten() } }, { status: 400 })
    }

    const { q, category, minPrice, maxPrice, page, limit, sort, dir } = validated.data

    let queryBuilder = supabase.from('sweets').select('*')

    if (q) {
        queryBuilder = queryBuilder.ilike('name', `%${q}%`)
    }
    if (category) {
        queryBuilder = queryBuilder.eq('category', category)
    }
    if (minPrice) {
        queryBuilder = queryBuilder.gte('price_cents', minPrice)
    }
    if (maxPrice) {
        queryBuilder = queryBuilder.lte('price_cents', maxPrice)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    queryBuilder = queryBuilder.range(from, to).order(sort, { ascending: dir === 'asc' })

    const { data, error } = await queryBuilder

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}


// POST /api/sweets
export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to create a sweet.' } }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to create a sweet.' } }, { status: 403 })
    }

    const json = await request.json()
    const validated = SweetCreate.safeParse(json)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
    }

    const { name, category, price_cents, quantity, description, image_url } = validated.data

    const { data, error } = await supabase.from('sweets').insert({ name, category, price_cents, quantity, description, image_url }).select().single()

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}
