// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import QueryProvider from '@/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sweet Shop',
  description: 'Manage your sweet shop inventory and sales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <Navbar />
            <main className="container mx-auto py-8">
              {children}
            </main>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
