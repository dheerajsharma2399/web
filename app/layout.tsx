import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import QueryProvider from '@/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'
import { getUser } from '@/lib/auth'
import { CartProvider } from '@/providers/cart-provider' // Ensure this import is correct

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sweet Shop',
  description: 'Manage your sweet shop inventory and sales.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

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
              <Navbar user={user} />
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