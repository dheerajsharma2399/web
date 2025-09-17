// apps/web/app/admin/purchases/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export default async function AdminPurchasesPage() {
  await requireAdmin() // Ensure only admins can access this page

  const supabase = createServerSupabaseClient()
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*, sweets(*), profiles(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all purchases for admin:', error)
    return <div className="text-red-500">Failed to load all purchases.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">All Purchases</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-card rounded-lg shadow-md">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Sweet</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Unit Price</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b last:border-b-0">
                <td className="p-4">{purchase.profiles?.name || 'N/A'}</td>
                <td className="p-4">{purchase.sweets?.name || 'N/A'}</td>
                <td className="p-4">{purchase.quantity}</td>
                <td className="p-4">${(purchase.unit_price_cents / 100).toFixed(2)}</td>
                <td className="p-4">${(purchase.total_cents / 100).toFixed(2)}</td>
                <td className="p-4">{new Date(purchase.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
