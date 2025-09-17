import { createClient } from '@/lib/supabase/server';
import { AuthRegister } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const parsed = AuthRegister.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.errors } }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    return NextResponse.json({ error: { code: 'SUPABASE_ERROR', message: authError.message } }, { status: 400 });
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({ id: authData.user.id, name });
    if (profileError) {
        // Here you might want to handle the case where profile creation fails
        // For now, we'll just log it and return success as the user is created.
        console.error("Failed to create profile:", profileError);
    }
  }

  return NextResponse.json({ data: authData });
}