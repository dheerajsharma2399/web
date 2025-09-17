"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SweetCreate, SweetCreate as SweetCreateSchema } from "@/lib/validations"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type Sweet = {
  id: string
  name: string
  category: string
  price_cents: number
  quantity: number
}

interface SweetFormProps {
  sweet: Sweet | null
  onSuccess: () => void
}

export function SweetForm({ sweet, onSuccess }: SweetFormProps) {
  const supabase = createClient()
  const form = useForm<SweetCreateSchema>({
    resolver: zodResolver(SweetCreate),
    defaultValues: {
      name: sweet?.name || "",
      category: sweet?.category || "other",
      price_cents: sweet?.price_cents || 0,
      quantity: sweet?.quantity || 0,
      description: "",
      image_url: "",
    },
  })

  async function onSubmit(values: SweetCreateSchema) {
    const { data, error } = sweet
      ? await supabase.from("sweets").update(values).eq("id", sweet.id)
      : await supabase.from("sweets").insert(values)

    if (error) {
      console.error(error)
    } else {
      onSuccess()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chocolate Bar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g. chocolate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price_cents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (in cents)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{sweet ? "Update" : "Create"} Sweet</Button>
      </form>
    </Form>
  )
}
