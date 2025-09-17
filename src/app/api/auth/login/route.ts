import { createClient } from '@/lib/supabase/server';
import { AuthLogin } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const parsed = AuthLogin.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: error.message } }, { status: 400 });
  }

  return NextResponse.json({ data });
}