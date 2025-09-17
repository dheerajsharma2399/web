import { createClient } from '@/lib/supabase/server';
import { SweetUpdate } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data, error } = await supabase.from('sweets').select('*').eq('id', params.id).single();

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 404 });
    }

    return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const parsed = SweetUpdate.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
    }

    const { data, error } = await supabase.from('sweets').update(parsed.data).eq('id', params.id).select().single();

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
    }

    const { error } = await supabase.from('sweets').delete().eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}