import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to the Sweet Shop!
        </h1>

        <p className="mt-3 text-2xl">
          Your one-stop shop for delicious treats!
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href="/shop">
            <Button className="m-4 p-6 text-lg">
              Browse our Shop &rarr;
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outline" className="m-4 p-6 text-lg">
              Login &rarr;
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="outline" className="m-4 p-6 text-lg">
              Register &rarr;
            </Button>
          </Link>
        </div>

        <div className="mt-10">
          <h2 className="text-4xl font-bold">Our Portfolio</h2>
          <p className="mt-3 text-xl">
            Discover some of our amazing creations.
          </p>
          {/* Placeholder for portfolio items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="border p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Custom Cakes</h3>
              <p className="text-muted-foreground">Beautifully designed cakes for every occasion.</p>
            </div>
            <div className="border p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Artisan Chocolates</h3>
              <p className="text-muted-foreground">Handcrafted chocolates with unique flavors.</p>
            </div>
            <div className="border p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Gourmet Pastries</h3>
              <p className="text-muted-foreground">Delightful pastries baked fresh daily.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}