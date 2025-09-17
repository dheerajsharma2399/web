// apps/web/app/dashboard/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const supabase = createServerSupabaseClient()
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*, sweets(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching purchases:', error)
    return <div className="text-red-500">Failed to load purchases.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Purchases</h2>
          {purchases.length === 0 ? (
            <p>You haven't made any purchases yet. <Link href="/" className="underline">Start shopping!</Link></p>
          ) : (
            <ul className="space-y-4">
              {purchases.map((purchase) => (
                <li key={purchase.id} className="border-b pb-2">
                  <p className="font-medium">{purchase.sweets?.name} x {purchase.quantity}</p>
                  <p className="text-sm text-muted-foreground">Total: ${(purchase.total_cents / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Purchased on: {new Date(purchase.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>User ID:</strong> {session.user.id}</p>
          {/* Add more profile info if needed */}
        </div>
      </div>
    </div>
  )
}
