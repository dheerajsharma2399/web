// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/ssr/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  console.log('Supabase SSR module:', { createMiddlewareClient })
  const supabase = createMiddlewareClient({ req: request, res: response })
  console.log('Supabase client in middleware:', supabase)
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/'],
}