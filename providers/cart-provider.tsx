'use client'

import { Sweet } from '@/types/db'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  sweet: Sweet
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (sweet: Sweet, quantity: number) => void
  removeFromCart: (sweetId: string) => void
  updateQuantity: (sweetId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (sweet: Sweet, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.sweet.id === sweet.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.sweet.id === sweet.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevCart, { sweet, quantity }]
    })
  }

  const removeFromCart = (sweetId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.sweet.id !== sweetId))
  }

  const updateQuantity = (sweetId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sweetId)
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.sweet.id === sweetId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
