import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = {
    supabase: createClient(),
    response: NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (user) {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    // If user is not logged in and tries to access protected pages, redirect to login
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if(pathname.startsWith('/admin')) {
    if(user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if(profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    } else {
        return NextResponse.redirect(new URL('/login', request.url))
    }
  }


  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
