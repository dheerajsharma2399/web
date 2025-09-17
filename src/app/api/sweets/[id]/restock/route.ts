import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Restock } from '@/lib/validations'

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to restock a sweet.' } }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to restock a sweet.' } }, { status: 403 })
    }

    const { id: sweet_id } = params
    const json = await request.json()
    const validated = Restock.safeParse(json)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
    }

    const { quantity } = validated.data

    const { data: sweet, error: fetchError } = await supabase.from('sweets').select('quantity').eq('id', sweet_id).single()

    if(fetchError) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: fetchError.message } }, { status: 500 })
    }

    if(!sweet) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Sweet not found' } }, { status: 404 })
    }

    const { data, error } = await supabase.from('sweets').update({ quantity: sweet.quantity + quantity }).eq('id', sweet_id).select().single()

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}
