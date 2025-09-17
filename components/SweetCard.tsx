// apps/web/components/SweetCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sweet } from '@/types/db' // Assuming you have a types file for Sweet
import PurchaseDialog from './PurchaseDialog'

interface SweetCardProps {
  sweet: Sweet
}

export default function SweetCard({ sweet }: SweetCardProps) {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)

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
        <PurchaseDialog
          sweet={sweet}
          isOpen={isPurchaseDialogOpen}
          onOpenChange={setIsPurchaseDialogOpen}
        >
          <Button className="w-full" disabled={sweet.quantity === 0}>
            {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
          </Button>
        </PurchaseDialog>
      </CardFooter>
    </Card>
  )
}
