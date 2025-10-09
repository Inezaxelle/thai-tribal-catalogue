import Link from "next/link"
import { Package, BookOpen, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif font-bold text-foreground">Thai Tribal Craft Catalogue</h1>
          <p className="text-muted-foreground mt-2">Preserving heritage through digital storytelling</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Welcome to the Catalogue Builder</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage your collection of handmade tribal crafts and create beautiful PDF catalogues that honor the
              artistry and cultural heritage of Thailand's hill tribes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-12">
            <Link href="/products/new" className="group">
              <div className="h-full p-8 border-2 border-border rounded-lg hover:border-primary transition-colors bg-card">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold">Add New Product</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create a new product entry with detailed information about the craft, its story, and cultural
                    significance.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/products" className="group">
              <div className="h-full p-8 border-2 border-border rounded-lg hover:border-secondary transition-colors bg-card">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                    <Package className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold">Manage Products</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    View, edit, and organize your product collection. Filter by tribe, category, or search for specific
                    items.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/catalogue" className="group md:col-span-2">
              <div className="h-full p-8 border-2 border-border rounded-lg hover:border-accent transition-colors bg-card">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-full bg-accent/10 text-accent-foreground group-hover:bg-accent transition-colors">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold">Generate PDF Catalogue</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    Create a beautifully formatted PDF catalogue showcasing your products with their stories, perfect
                    for sharing with customers and preserving cultural heritage.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
