// app/dashboard/ProfileForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Profile } from '@/types/db'

const ProfileFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
})

type FormData = z.infer<typeof ProfileFormSchema>

export default function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: profile.name || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    setIsLoading(false)

    if (response.ok) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      })
      setIsEditing(false)
    } else {
      const result = await response.json()
      toast({
        title: 'Update Failed',
        description: result.error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <Button type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} readOnly disabled />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} readOnly={!isEditing} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input id="phone_number" {...register('phone_number')} readOnly={!isEditing} />
        {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} readOnly={!isEditing} />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
      </div>
      {isEditing && (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      )}
    </form>
  )
}
