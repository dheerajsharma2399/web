import { z } from 'zod'

export const AuthRegister = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80),
})

export const AuthLogin = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const SweetCreate = z.object({
  name: z.string(),
  category: z.enum(['chocolate', 'candy', 'cookie', 'cake', 'pastry', 'other']),
  price_cents: z.number().int().min(0),
  quantity: z.number().int().min(0),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
})

export const SweetUpdate = SweetCreate.partial()

export const Purchase = z.object({
  quantity: z.number().int().min(1),
})

export const Restock = z.object({
    quantity: z.number().int().min(1),
})

export const QueryParams = z.object({
    q: z.string().optional(),
    category: z.enum(['chocolate', 'candy', 'cookie', 'cake', 'pastry', 'other']).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    sort: z.enum(['price', 'name', 'created_at']).optional().default('created_at'),
    dir: z.enum(['asc', 'desc']).optional().default('desc'),
})
