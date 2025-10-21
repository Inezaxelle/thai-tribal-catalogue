import { notFound } from "next/navigation"
import Link from "next/link"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import { ImageCarousel } from "@/components/image-carousel"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await connectDB()
  const product = await Product.findById(id).lean()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <Link href={`/products/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Carousel */}
          <div className="space-y-4">
            <ImageCarousel images={product.images || []} productName={product.name} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground italic">{product.tribe}</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.featured && <Badge variant="default">Featured</Badge>}
              <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">
                  {product.price.currency} {product.price.amount.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.stockQuantity} {product.stockQuantity === 1 ? "item" : "items"} available
                </p>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-serif font-semibold mb-3">Story</h2>
              <p className="text-muted-foreground leading-relaxed">{product.story}</p>
            </div>

            <div>
              <h2 className="text-xl font-serif font-semibold mb-3">Materials</h2>
              <ul className="list-disc list-inside space-y-1">
                {product.materials.map((material: string, index: number) => (
                  <li key={index} className="text-muted-foreground">
                    {material}
                  </li>
                ))}
              </ul>
            </div>

            {product.dimensions && (
              <div>
                <h2 className="text-xl font-serif font-semibold mb-3">Dimensions</h2>
                <p className="text-muted-foreground">
                  {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}{" "}
                  {product.dimensions.unit}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
