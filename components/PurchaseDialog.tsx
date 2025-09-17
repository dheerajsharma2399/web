// apps/web/components/PurchaseDialog.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PurchaseSchema } from '@/lib/validations'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Sweet } from '@/types/db'

type FormData = z.infer<typeof PurchaseSchema>

interface PurchaseDialogProps {
  sweet: Sweet
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function PurchaseDialog({ sweet, children, isOpen, onOpenChange }: PurchaseDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const response = await fetch(`/api/sweets/${sweet.id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    setIsLoading(false)

    if (response.ok) {
      toast({
        title: 'Purchase Successful',
        description: `You have purchased ${data.quantity} x ${sweet.name}.`,
      })
      onOpenChange(false)
      reset()
      router.refresh() // Refresh the page to show updated stock
    } else {
      toast({
        title: 'Purchase Failed',
        description: result.error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase {sweet.name}</DialogTitle>
          <DialogDescription>
            Current Stock: {sweet.quantity} | Price: ${(sweet.price_cents / 100).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true, max: sweet.quantity })}
              className={errors.quantity && 'border-red-500'}
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
            {errors.quantity?.type === 'max' && <p className="text-red-500 text-sm mt-1">Cannot purchase more than available stock.</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || sweet.quantity === 0}>
              {isLoading ? 'Purchasing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
