// apps/web/components/SweetForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SweetSchema } from '@/lib/validations'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Sweet } from '@/types/db'

type FormData = z.infer<typeof SweetSchema>

interface SweetFormProps {
  initialData?: Sweet
}

export default function SweetForm({ initialData }: SweetFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(SweetSchema),
    defaultValues: initialData || {
      name: '',
      category: 'chocolate',
      price_cents: 0,
      quantity: 0,
      description: '',
      image_url: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    const method = initialData ? 'PUT' : 'POST'
    const url = initialData ? `/api/sweets/${initialData.id}` : '/api/sweets'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.ok) {
      toast({
        title: `Sweet ${initialData ? 'updated' : 'created'}`,
        description: `Sweet ${data.name} has been successfully ${initialData ? 'updated' : 'created'}.`,
      })
      router.refresh() // Refresh the page to show new/updated sweet
    } else {
      toast({
        title: `Failed to ${initialData ? 'update' : 'create'} sweet`,
        description: result.error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} className={errors.name && 'border-red-500'} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => setValue('category', value as any)} defaultValue={initialData?.category || 'chocolate'}>
          <SelectTrigger className={errors.category && 'border-red-500'}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chocolate">Chocolate</SelectItem>
            <SelectItem value="candy">Candy</SelectItem>
            <SelectItem value="cookie">Cookie</SelectItem>
            <SelectItem value="cake">Cake</SelectItem>
            <SelectItem value="pastry">Pastry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
      </div>
      <div>
        <Label htmlFor="price_cents">Price (cents)</Label>
        <Input id="price_cents" type="number" {...register('price_cents', { valueAsNumber: true })} className={errors.price_cents && 'border-red-500'} />
        {errors.price_cents && <p className="text-red-500 text-sm mt-1">{errors.price_cents.message}</p>}
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} className={errors.quantity && 'border-red-500'} />
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
      </div>
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" {...register('image_url')} className={errors.image_url && 'border-red-500'} />
        {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
      </div>
      <Button type="submit">{initialData ? 'Update Sweet' : 'Create Sweet'}</Button>
    </form>
  )
}
