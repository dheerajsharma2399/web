// apps/web/types/db.ts

export type Sweet = {
  id: string;
  name: string;
  category: 'chocolate' | 'candy' | 'cookie' | 'cake' | 'pastry' | 'other';
  price_cents: number;
  quantity: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type Purchase = {
  id: string;
  user_id: string;
  sweet_id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  created_at: string;
  sweets?: Sweet; // Joined sweet data
  profiles?: { name: string }; // Joined profile data
}

export type Profile = {
  id: string;
  name: string;
  role: 'user' | 'admin';
  phone_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  sweet_id: string;
  name: string;
  image_url?: string | null;
  quantity: number;
  unit_price_cents: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  address: string;
  contact_number: string;
  items: OrderItem[];
  total_price_cents: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}
