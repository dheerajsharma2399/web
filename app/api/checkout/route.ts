import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  items: z.array(z.object({
    sweet_id: z.string().uuid(),
    name: z.string(),
    image_url: z.string().nullable(),
    quantity: z.number().int().min(1),
    unit_price_cents: z.number().int().min(0),
  })),
  total_price_cents: z.number().int().min(0),
})

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'You must be logged in to make a purchase.' } }, { status: 401 })
  }

  // Fetch user profile to get name, address, and phone number
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, phone_number, address')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile for checkout:', profileError)
    return NextResponse.json({ error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found. Please update your profile details.' } }, { status: 400 })
  }

  const body = await request.json()
  const validation = checkoutSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: validation.error.format() } }, { status: 400 })
  }

  const { items, total_price_cents } = validation.data

  // Use data from profile for the order
  const { name, phone_number, address } = profile

  if (!name || !phone_number || !address) {
    return NextResponse.json({ error: { code: 'PROFILE_INCOMPLETE', message: 'Please complete your profile (name, phone number, and address) before placing an order.' } }, { status: 400 })
  }

  try {
    // Use a transaction to ensure atomicity
    const { data: order, error: orderError } = await supabase.rpc('perform_checkout', {
      p_user_id: user.id,
      p_customer_name: name,
      p_address: address,
      p_contact_number: phone_number,
      p_items: items,
      p_total_price_cents: total_price_cents,
    })

    if (orderError) {
      console.error('Error creating order:', orderError)
      // Check for specific error messages from the RPC function
      if (orderError.message.includes('insufficient_stock')) {
        return NextResponse.json({ error: { code: 'INSUFFICIENT_STOCK', message: 'Sorry, one or more items in your cart are out of stock.' } }, { status: 409 })
      }
      return NextResponse.json({ error: { code: 'ORDER_CREATION_FAILED', message: 'Could not create the order.' } }, { status: 500 })
    }

    return NextResponse.json({ message: 'Order placed successfully', order_id: order.id }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error during checkout:', error)
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 })
  }
}