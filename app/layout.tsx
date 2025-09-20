// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import QueryProvider from '@/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import { CartProvider } from '@/providers/cart-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sweet Shop',
  description: 'Manage your sweet shop inventory and sales.',
}

import { getSession } from '@/lib/auth'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CartProvider>
              <Navbar session={session} />
              <main className="container mx-auto py-8">
                {children}
              </main>
              <Toaster />
            </CartProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
