import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SweetUpdate } from '@/lib/validations'

// GET /api/sweets/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { id } = params

    const { data, error } = await supabase.from('sweets').select('*').eq('id', id).single()

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    if (!data) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sweet not found' } }, { status: 404 })
    }

    return NextResponse.json({ data })
}

// PUT /api/sweets/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to update a sweet.' } }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to update a sweet.' } }, { status: 403 })
    }

    const { id } = params
    const json = await request.json()
    const validated = SweetUpdate.safeParse(json)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
    }

    const { data, error } = await supabase.from('sweets').update(validated.data).eq('id', id).select().single()

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}

// DELETE /api/sweets/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to delete a sweet.' } }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to delete a sweet.' } }, { status: 403 })
    }

    const { id } = params

    const { error } = await supabase.from('sweets').delete().eq('id', id)

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
}
