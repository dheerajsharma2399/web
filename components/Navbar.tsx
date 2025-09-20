'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Moon, Sun, ShoppingCart } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { useCart } from '@/providers/cart-provider'

export default function Navbar({ session }: { session: Session | null }) {
  const { setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [user, setUser] = useState<User | null>(session?.user ?? null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    const fetchUserProfile = async (user: User) => {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setIsAdmin(profile?.role === 'admin')
    }

    if (user) {
      fetchUserProfile(user)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      const newUser = newSession?.user ?? null
      setUser(newUser)
      if (newUser) {
        fetchUserProfile(newUser)
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [user, supabase])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Logout failed:', errorData)
        // Optionally, show a user-friendly error message
        return
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Failed to fetch during logout:', error)
      // Optionally, show a user-friendly error message
    }
  }

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Sweet Shop
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/shop">
            <Button variant="ghost">Shop</Button>
          </Link>
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

          <Link href="/checkout">
            <Button variant="ghost" className="relative p-2">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}