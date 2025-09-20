// apps/web/components/SweetCard.tsx
'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sweet } from '@/types/db'
import { useCart } from '@/providers/cart-provider'
import { useToast } from '@/components/ui/use-toast'

interface SweetCardProps {
  sweet: Sweet
}

export default function SweetCard({ sweet }: SweetCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart(sweet, 1)
    toast({
      title: 'Added to cart',
      description: `${sweet.name} has been added to your cart.`,
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{sweet.name}</CardTitle>
        <CardDescription>{sweet.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {sweet.image_url && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={sweet.image_url}
              alt={sweet.name}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-md"
            />
          </div>
        )}
        <p className="text-2xl font-bold mb-2">${(sweet.price_cents / 100).toFixed(2)}</p>
        <p className="text-muted-foreground">Stock: {sweet.quantity}</p>
        {sweet.description && <p className="mt-2 text-sm">{sweet.description}</p>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={sweet.quantity === 0} onClick={handleAddToCart}>
          {sweet.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
