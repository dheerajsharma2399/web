import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QueryParams } from '@/lib/validations'

export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to view your purchases.' } }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    const validated = QueryParams.safeParse(query)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: validated.error.flatten() } }, { status: 400 })
    }

    const { page, limit, sort, dir } = validated.data

    let queryBuilder = supabase.from('purchases').select('*, sweets(*)').eq('user_id', user.id)

    const from = (page - 1) * limit
    const to = from + limit - 1

    queryBuilder = queryBuilder.range(from, to).order(sort, { ascending: dir === 'asc' })

    const { data, error } = await queryBuilder

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}
