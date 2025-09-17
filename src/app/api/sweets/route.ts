import { createClient } from '@/lib/supabase/server';
import { SweetQuery, SweetCreate } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsedQuery = SweetQuery.safeParse(query);

    if (!parsedQuery.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parsedQuery.error.errors } }, { status: 400 });
    }

    const { q, category, minPrice, maxPrice, page, limit, sort, dir } = parsedQuery.data;

    let queryBuilder = supabase.from('sweets').select('*');

    if (q) {
        queryBuilder = queryBuilder.ilike('name', `%${q}%`);
    }
    if (category) {
        queryBuilder = queryBuilder.eq('category', category);
    }
    if (minPrice) {
        queryBuilder = queryBuilder.gte('price_cents', minPrice);
    }
    if (maxPrice) {
        queryBuilder = queryBuilder.lte('price_cents', maxPrice);
    }

    const { data, error } = await queryBuilder
        .order(sort, { ascending: dir === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
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
    const parsed = SweetCreate.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
    }

    const { data, error } = await supabase.from('sweets').insert(parsed.data).select().single();

    if (error) {
        return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
}