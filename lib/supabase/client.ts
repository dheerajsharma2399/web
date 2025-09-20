// apps/web/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let supabase: ReturnType<typeof createBrowserClient>

export function createClientSupabaseClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabase
}
