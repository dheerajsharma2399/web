import { createClient } from '@/lib/supabase/server';
import { Restock } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
    }

    const body = await request.json();
    const parsed = Restock.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
    }

    const { quantity } = parsed.data;

    const { data, error } = await supabase.rpc('increment_sweet_quantity', { sweet_id: params.id, p_quantity: quantity });

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}