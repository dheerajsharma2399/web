"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"

type Purchase = {
  id: string
  created_at: string
  quantity: number
  total_cents: number
  sweets: {
    name: string
    price_cents: number
  }
}

export default function DashboardPage() {
  const supabase = createClient()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getPurchases() {
      const { data, error } = await supabase.from("purchases").select(`
        id,
        created_at,
        quantity,
        total_cents,
        sweets (
          name,
          price_cents
        )
      `).order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setPurchases(data as Purchase[])
      }
      setLoading(false)
    }

    getPurchases()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Purchases</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-8">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="p-4 border rounded-lg">
                <h2 className="font-bold">{purchase.sweets.name}</h2>
                <p>Quantity: {purchase.quantity}</p>
                <p>Total: ${purchase.total_cents / 100}</p>
                <p>Date: {new Date(purchase.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
