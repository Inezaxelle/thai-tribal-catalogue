"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { ArrowLeft, Plus, Download } from "lucide-react"
import type { IProduct } from "@/models/Product"

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    tribe: "all",
    category: "all",
    featured: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [products, filters])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.story.toLowerCase().includes(searchLower),
      )
    }

    if (filters.tribe !== "all") {
      filtered = filtered.filter((p) => p.tribe === filters.tribe)
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category)
    }

    if (filters.featured) {
      filtered = filtered.filter((p) => p.featured)
    }

    setFilteredProducts(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((p) => p._id.toString() !== id))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">Product Management</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} of {products.length} products
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/catalogue">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Catalogue
                </Link>
              </Button>
              <Button asChild>
                <Link href="/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside>
            <ProductFilters filters={filters} onFilterChange={setFilters} />
          </aside>

          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {products.length === 0
                    ? "No products yet. Create your first product to get started."
                    : "No products match your filters."}
                </p>
                {products.length === 0 && (
                  <Button asChild>
                    <Link href="/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id.toString()} product={product} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
