// apps/web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/ssr/middleware'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({
    req: request,
    res: response,
  })

  const { data: {
    session
  } } = await supabase.auth.getSession()

  const protectedPaths = ['/dashboard', '/admin']
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  if (!session && protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set(`redirectedFrom`, request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAdminPath) {
    const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (error || profile?.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard' // Redirect non-admins from admin pages
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/'],
}
