import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Order, OrderItem } from '@/types/db'
import Image from 'next/image'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = createServerSupabaseClient()
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return <div className="text-red-500">Failed to load orders.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Your Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-card p-6 rounded-lg shadow-md text-center">
              <p>You haven't placed any orders yet.</p>
              <Link href="/" className="underline mt-2 inline-block">
                Start shopping!
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {(orders as Order[]).map((order) => (
                <li key={order.id} className="bg-card p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Placed on: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize font-medium">{order.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">${(order.total_price_cents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">Items</h3>
                  <ul className="space-y-4">
                    {(order.items as OrderItem[]).map((item) => (
                      <li key={item.sweet_id} className="flex items-center space-x-4 text-sm">
                        <div className="relative w-12 h-12">
                          <Image src={item.image_url || '/placeholder.svg'} alt={item.name} fill style={{ objectFit: 'cover' }} className="rounded-md" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.unit_price_cents * item.quantity / 100).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md self-start">
          <h2 className="text-2xl font-semibold mb-4">Profile</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          {/* Add more profile info if needed */}
        </div>
      </div>
    </div>
  )
}