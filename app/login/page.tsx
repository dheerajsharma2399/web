// apps/web/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLoginSchema } from '@/lib/validations'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

type FormData = z.infer<typeof AuthLoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(AuthLoginSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const response = await fetch('/api/auth/login', {
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
        title: 'Login Successful',
        description: 'You have been logged in. Redirecting...',
      })
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)
    } else {
      toast({
        title: 'Login Failed',
        description: result.error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
              className={errors.email && 'border-red-500'}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password && 'border-red-500'}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? {' '}
          <Link href="/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
