import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(search_params.get('limit') || '10');

    const { data, error } = await supabase
        .from('purchases')
        .select('*, sweets(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}