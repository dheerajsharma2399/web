// apps/web/app/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import SweetCard from '@/components/SweetCard'
import SearchBar from '@/components/SearchBar'
import Filters from '@/components/Filters'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerSupabaseClient()
  const { data: sweets, error } = await supabase.from('sweets').select('*')

  if (error) {
    console.error('Error fetching sweets:', error)
    return <div className="text-red-500">Failed to load sweets.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to the Sweet Shop!</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4">
          <Filters />
        </div>
        <div className="md:w-3/4">
          <SearchBar />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {sweets.map((sweet) => (
              <SweetCard key={sweet.id} sweet={sweet} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
