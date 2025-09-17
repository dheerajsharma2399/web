import { createClient } from '@/lib/supabase/server';
import { Purchase } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = Purchase.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
    }

    const { quantity } = parsed.data;

    const { data, error } = await supabase.rpc('perform_purchase', { p_user: user.id, p_sweet: params.id, p_qty: quantity });

    if (error) {
        if (error.message.includes('insufficient_stock')) {
            return NextResponse.json({ error: { code: 'CONFLICT', message: 'Insufficient stock' } }, { status: 409 });
        }
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}