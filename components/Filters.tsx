// apps/web/components/Filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    setCategory(searchParams.get('category') || '')
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
  }, [searchParams])

  const handleApplyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (category) current.set('category', category)
    else current.delete('category')

    if (minPrice) current.set('minPrice', minPrice)
    else current.delete('minPrice')

    if (maxPrice) current.set('maxPrice', maxPrice)
    else current.delete('maxPrice')

    router.push(`/?${current.toString()}`)
  }

  const handleClearFilters = () => {
    router.push('/')
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Filters</h2>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="chocolate">Chocolate</SelectItem>
            <SelectItem value="candy">Candy</SelectItem>
            <SelectItem value="cookie">Cookie</SelectItem>
            <SelectItem value="cake">Cake</SelectItem>
            <SelectItem value="pastry">Pastry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="minPrice">Min Price</Label>
        <Input
          id="minPrice"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="maxPrice">Max Price</Label>
        <Input
          id="maxPrice"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="100"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="w-full">Apply Filters</Button>
        <Button variant="outline" onClick={handleClearFilters} className="w-full">Clear Filters</Button>
      </div>
    </div>
  )
}
