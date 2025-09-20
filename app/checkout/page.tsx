'use client'

import { useCart } from '@/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

const CheckoutFormSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  address: z.string().min(10, 'Address is required'),
  contact_number: z.string().min(10, 'A valid phone number is required'),
})

type FormData = z.infer<typeof CheckoutFormSchema>

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(CheckoutFormSchema),
  })

  const totalPriceCents = cart.reduce(
    (total, item) => total + item.sweet.price_cents * item.quantity,
    0
  )

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        items: cart.map(item => ({
          sweet_id: item.sweet.id,
          name: item.sweet.name, // Add name
          image_url: item.sweet.image_url, // Add image_url
          quantity: item.quantity,
          unit_price_cents: item.sweet.price_cents,
        })),
        total_price_cents: totalPriceCents,
      }),
    })

    setIsLoading(false)

    if (response.ok) {
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
      })
      clearCart()
      router.push('/dashboard')
    } else {
      const result = await response.json()
      toast({
        title: 'Order Failed',
        description: result.error?.message || 'There was an error placing your order.',
        variant: 'destructive',
      })
    }
  }

  if (totalItems === 0 && !isLoading) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground">Add some sweets to your cart to get started.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go Shopping</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Order</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.sweet.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <Image src={item.sweet.image_url || '/placeholder.svg'} alt={item.sweet.name} fill style={{ objectFit: 'cover' }} className="rounded-md" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.sweet.name}</p>
                    <p className="text-sm text-muted-foreground">${(item.sweet.price_cents / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.sweet.id, item.quantity - 1)}>-</Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.sweet.id, item.quantity + 1)}>+</Button>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.sweet.id)}>X</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-2xl font-bold">Total: ${(totalPriceCents / 100).toFixed(2)}</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="customer_name">Full Name</Label>
              <Input id="customer_name" {...register('customer_name')} />
              {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <Label htmlFor="contact_number">Phone Number</Label>
              <Input id="contact_number" type="tel" {...register('contact_number')} />
              {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || totalItems === 0}>
              {isLoading ? 'Placing Order...' : 'Confirm Purchase'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
