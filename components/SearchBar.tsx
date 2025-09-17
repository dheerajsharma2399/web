// apps/web/components/SearchBar.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (searchTerm) {
      current.set('q', searchTerm)
    } else {
      current.delete('q')
    }
    router.push(`/?${current.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Search sweets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit"><SearchIcon className="h-4 w-4" /></Button>
    </form>
  )
}
