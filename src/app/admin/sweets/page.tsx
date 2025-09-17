"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { SweetForm } from "@/components/SweetForm"

type Sweet = {
  id: string
  name: string
  category: string
  price_cents: number
  quantity: number
}

export default function AdminSweetsPage() {
  const supabase = createClient()
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null)

  async function getSweets() {
    const { data, error } = await supabase.from("sweets").select("*").order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setSweets(data as Sweet[])
    }
    setLoading(false)
  }

  useEffect(() => {
    getSweets()
  }, [])

  async function handleDelete(id: string) {
    const { error } = await supabase.from("sweets").delete().eq("id", id)
    if (error) {
      console.error(error)
    } else {
      getSweets()
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Sweets</h1>
          <Button onClick={() => {
            setSelectedSweet(null)
            setShowForm(true)
          }}>Add Sweet</Button>
        </div>

        {showForm && (
          <SweetForm
            sweet={selectedSweet}
            onSuccess={() => {
              setShowForm(false)
              getSweets()
            }}
          />
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-8">
            {sweets.map((sweet) => (
              <div key={sweet.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h2 className="font-bold">{sweet.name}</h2>
                  <p>Category: {sweet.category}</p>
                  <p>Price: ${sweet.price_cents / 100}</p>
                  <p>Quantity: {sweet.quantity}</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => {
                    setSelectedSweet(sweet)
                    setShowForm(true)
                  }}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(sweet.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
