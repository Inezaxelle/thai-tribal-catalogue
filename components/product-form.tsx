"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { TRIBES, CATEGORIES, CURRENCIES, type ProductFormData } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { CloudinaryUploadWidget } from "@/components/cloudinary-upload-widget"

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>
  initialData?: Partial<ProductFormData>
  isEditing?: boolean
}

export function ProductForm({ onSubmit, initialData, isEditing = false }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || "",
      tribe: initialData?.tribe || "",
      category: initialData?.category || "",
      story: initialData?.story || "",
      materials: initialData?.materials || [""],
      dimensions: {
        length: initialData?.dimensions?.length,
        width: initialData?.dimensions?.width,
        height: initialData?.dimensions?.height,
        unit: initialData?.dimensions?.unit || "cm",
      },
      price: {
        amount: initialData?.price?.amount || 0,
        currency: initialData?.price?.currency || "THB",
      },
      stockQuantity: initialData?.stockQuantity || 0,
      featured: initialData?.featured || false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  })

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...data, images: imageUrls })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addImageUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""])
    }
  }

  const handleCloudinaryUpload = (url: string) => {
    setImageUrls((prev) => {
      if (prev.length < 5) {
        console.log("[v0] Adding image to form:", url)
        console.log("[v0] Current image count:", prev.length)
        return [...prev, url]
      }
      console.log("[v0] Max images reached, not adding:", url)
      return prev
    })
  }

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Basic Information</CardTitle>
          <CardDescription>Essential details about the handcrafted product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Product name is required", maxLength: 200 })}
              placeholder="e.g., Hand-woven Karen Scarf"
              className="max-w-2xl"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tribe">Tribe *</Label>
              <Select onValueChange={(value) => setValue("tribe", value)} defaultValue={initialData?.tribe}>
                <SelectTrigger id="tribe">
                  <SelectValue placeholder="Select tribe" />
                </SelectTrigger>
                <SelectContent>
                  {TRIBES.map((tribe) => (
                    <SelectItem key={tribe} value={tribe}>
                      {tribe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tribe && <p className="text-sm text-destructive">{errors.tribe.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={initialData?.category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Product Story *</Label>
            <Textarea
              id="story"
              {...register("story", { required: "Product story is required", maxLength: 2000 })}
              placeholder="Share the cultural significance, crafting process, and heritage behind this piece..."
              className="min-h-32 resize-y"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{watch("story")?.length || 0} / 2000 characters</p>
            {errors.story && <p className="text-sm text-destructive">{errors.story.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Materials & Craftsmanship</CardTitle>
          <CardDescription>Materials used in creating this piece</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`materials.${index}` as const, { required: "Material is required" })}
                placeholder="e.g., Hand-spun cotton, Natural dyes"
                className="flex-1"
              />
              {fields.length > 1 && (
                <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append("")} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Dimensions</CardTitle>
          <CardDescription>Physical measurements of the product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                {...register("dimensions.length", { valueAsNumber: true, min: 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                {...register("dimensions.width", { valueAsNumber: true, min: 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                {...register("dimensions.height", { valueAsNumber: true, min: 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                onValueChange={(value) => setValue("dimensions.unit", value as "cm" | "inch")}
                defaultValue={initialData?.dimensions?.unit || "cm"}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inch">inch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Pricing & Inventory</CardTitle>
          <CardDescription>Set pricing and stock information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price.amount", { required: "Price is required", valueAsNumber: true, min: 0 })}
                placeholder="0.00"
              />
              {errors.price?.amount && <p className="text-sm text-destructive">{errors.price.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                onValueChange={(value) => setValue("price.currency", value)}
                defaultValue={initialData?.price?.currency || "THB"}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              {...register("stockQuantity", { required: "Stock quantity is required", valueAsNumber: true, min: 0 })}
              placeholder="0"
              className="max-w-xs"
            />
            {errors.stockQuantity && <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={watch("featured")}
              onCheckedChange={(checked) => setValue("featured", checked as boolean)}
            />
            <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
              Feature this product in the catalogue
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Product Images</CardTitle>
          <CardDescription>Add up to 5 images using Cloudinary upload or image URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeImageUrl(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {url && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
          {imageUrls.length < 5 && (
            <div className="space-y-2">
              <CloudinaryUploadWidget onUpload={handleCloudinaryUpload} buttonText="Upload Image from Device" />
              <Button type="button" variant="outline" onClick={addImageUrl} className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Or Add Image URL Manually
              </Button>
            </div>
          )}
          {imageUrls.length === 0 && <p className="text-sm text-destructive">At least one image is required</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || imageUrls.length === 0} className="min-w-32">
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
