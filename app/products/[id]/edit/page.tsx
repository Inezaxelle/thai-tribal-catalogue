"use client"

import { ProductForm } from "@/components/product-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { updateProduct } from "@/app/actions/product-actions"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await connectDB()

  const product = await Product.findById(params.id).lean()

  if (!product) {
    notFound()
  }

  // Convert MongoDB document to plain object
  const productData = {
    name: product.name,
    tribe: product.tribe,
    category: product.category,
    story: product.story,
    materials: product.materials,
    dimensions: product.dimensions,
    price: product.price,
    images: product.images,
    stockQuantity: product.stockQuantity,
    featured: product.featured,
  }

  const handleSubmit = updateProduct.bind(null, params.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Edit Product</h1>
              <p className="text-sm text-muted-foreground">Update product information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ProductForm onSubmit={handleSubmit} initialData={productData} isEditing />
      </main>
    </div>
  )
}
