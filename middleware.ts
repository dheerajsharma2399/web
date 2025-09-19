// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log('createMiddlewareClient:', createMiddlewareClient)
  const response = NextResponse.next()
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/'],
}