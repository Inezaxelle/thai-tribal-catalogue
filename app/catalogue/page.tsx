"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, FileText } from "lucide-react"
import type { IProduct } from "@/models/Product"
import { Badge } from "@/components/ui/badge"

export default function CataloguePage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        // Select all products by default
        setSelectedProducts(new Set(data.map((p: IProduct) => p._id.toString())))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedProducts(newSelected)
  }

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map((p) => p._id.toString())))
    }
  }

  const generatePDF = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product")
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/catalogue/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `thai-tribal-crafts-catalogue-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Failed to generate PDF catalogue")
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF catalogue")
    } finally {
      setGenerating(false)
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
                <h1 className="text-2xl font-serif font-bold text-foreground">Generate PDF Catalogue</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedProducts.size} of {products.length} products selected
                </p>
              </div>
            </div>
            <Button onClick={generatePDF} disabled={generating || selectedProducts.size === 0}>
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Catalogue Preview</CardTitle>
            <CardDescription>
              Select the products you want to include in your PDF catalogue. The catalogue will showcase each product
              with its story, materials, and cultural significance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="select-all"
                checked={selectedProducts.size === products.length && products.length > 0}
                onCheckedChange={toggleAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer font-medium">
                Select All Products
              </Label>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No products available to generate a catalogue.</p>
              <Button asChild>
                <Link href="/products/new">Add Your First Product</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card
                key={product._id.toString()}
                className={`cursor-pointer transition-all ${
                  selectedProducts.has(product._id.toString())
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => toggleProduct(product._id.toString())}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedProducts.has(product._id.toString())}
                      onCheckedChange={() => toggleProduct(product._id.toString())}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif font-semibold text-lg mb-2">{product.name}</h3>
                          <div className="flex gap-2 flex-wrap mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.tribe}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            {product.featured && (
                              <Badge className="text-xs bg-accent text-accent-foreground">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.story}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            {product.price.amount.toLocaleString()} {product.price.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
