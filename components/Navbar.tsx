// apps/web/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const { setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setIsAdmin(profile?.role === 'admin')
      }
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const getProfileOnAuthChange = async () => {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
          setIsAdmin(profile?.role === 'admin')
        }
        getProfileOnAuthChange()
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    })
    router.push('/login')
  }

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Sweet Shop
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {isAdmin && (
                <Link href="/admin/sweets">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost">Register</Button>
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
