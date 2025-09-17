"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthLogin, AuthLogin as AuthLoginSchema } from "@/lib/validations"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const form = useForm<AuthLoginSchema>({
    resolver: zodResolver(AuthLogin),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: AuthLoginSchema) {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      // TODO: show error toast
      console.error(error)
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your email below to login to your account
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
