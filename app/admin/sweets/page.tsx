// apps/web/app/admin/sweets/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import SweetForm from '@/components/SweetForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sweet } from '@/types/db' // Assuming you have a types file for Sweet
import { PencilIcon, TrashIcon } from 'lucide-react'

export default async function AdminSweetsPage() {
  await requireAdmin() // Ensure only admins can access this page

  const supabase = createServerSupabaseClient()
  const { data: sweets, error } = await supabase.from('sweets').select('*')

  if (error) {
    console.error('Error fetching sweets for admin:', error)
    return <div className="text-red-500">Failed to load sweets for administration.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Manage Sweets</h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Add New Sweet</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sweet</DialogTitle>
          </DialogHeader>
          <SweetForm />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sweets.map((sweet: Sweet) => (
          <div key={sweet.id} className="bg-card p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold">{sweet.name}</h3>
            <p className="text-muted-foreground">Category: {sweet.category}</p>
            <p>Price: ${(sweet.price_cents / 100).toFixed(2)}</p>
            <p>Quantity: {sweet.quantity}</p>
            <p className="text-sm mt-2">{sweet.description}</p>
            <div className="flex gap-2 mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><PencilIcon className="h-4 w-4 mr-2" />Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit {sweet.name}</DialogTitle>
                  </DialogHeader>
                  <SweetForm initialData={sweet} />
                </DialogContent>
              </Dialog>
              <Button variant="destructive" size="sm"><TrashIcon className="h-4 w-4 mr-2" />Delete</Button>
              {/* Implement delete functionality */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
