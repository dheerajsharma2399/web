import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Purchase } from '@/lib/validations'

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to purchase a sweet.' } }, { status: 401 })
    }

    const { id: sweet_id } = params
    const json = await request.json()
    const validated = Purchase.safeParse(json)

    if (!validated.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: validated.error.flatten() } }, { status: 400 })
    }

    const { quantity } = validated.data

    const { data, error } = await supabase.rpc('perform_purchase', {
        p_user: user.id,
        p_sweet: sweet_id,
        p_qty: quantity
    })

    if (error) {
        if (error.message.includes('insufficient_stock')) {
            return NextResponse.json({ error: { code: 'CONFLICT', message: 'Insufficient stock' } }, { status: 409 })
        }
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ data })
}
