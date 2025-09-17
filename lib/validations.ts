// apps/web/lib/validations.ts
import { z } from 'zod'

export const AuthRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
})

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const SweetSchema = z.object({
  name: z.string().min(1, 'Name is required').unique(),
  category: z.enum(['chocolate', 'candy', 'cookie', 'cake', 'pastry', 'other']),
  price_cents: z.number().int().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  description: z.string().optional(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const PurchaseSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const RestockSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const SweetFilterSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['chocolate', 'candy', 'cookie', 'cake', 'pastry', 'other']).optional(),
  minPrice: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, 'Min price must be non-negative').optional()
  ),
  maxPrice: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, 'Max price must be non-negative').optional()
  ),
  page: z.preprocess(
    (val) => (val === '' ? 1 : Number(val)),
    z.number().int().min(1, 'Page must be at least 1').default(1)
  ),
  limit: z.preprocess(
    (val) => (val === '' ? 10 : Number(val)),
    z.number().int().min(1, 'Limit must be at least 1').default(10)
  ),
  sort: z.enum(['price_cents', 'name', 'created_at']).default('created_at'),
  dir: z.enum(['asc', 'desc']).default('desc'),
})
