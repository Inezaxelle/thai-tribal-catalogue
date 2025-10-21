"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Star } from "lucide-react"
import type { IProduct } from "@/models/Product"

interface ProductCardProps {
  product: IProduct
  onDelete?: (id: string) => void
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.images[0] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.featured && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground p-2 rounded-full">
              <Star className="h-4 w-4 fill-current" />
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
              {product.images.length} photos
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {product.tribe}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.story}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-primary">{product.price.amount.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">{product.price.currency}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Stock:{" "}
          <span className={product.stockQuantity > 0 ? "text-secondary" : "text-destructive"}>
            {product.stockQuantity} units
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="default" size="sm" className="flex-1" asChild>
          <Link href={`/products/${product._id}`}>View</Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
          <Link href={`/products/${product._id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={() => onDelete(product._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
