export interface ProductFormData {
  name: string
  tribe: string
  category: string
  story: string
  materials: string[]
  dimensions: {
    length?: number
    width?: number
    height?: number
    unit: "cm" | "inch"
  }
  price: {
    amount: number
    currency: string
  }
  images: string[]
  stockQuantity: number
  featured: boolean
}

export interface ProductFilter {
  tribe?: string
  category?: string
  search?: string
  featured?: boolean
}

export const TRIBES = ["Karen", "Hmong", "Lisu", "Akha", "Lahu", "Yao", "Other"] as const

export const CATEGORIES = [
  "Textiles",
  "Jewelry",
  "Bags",
  "Home Decor",
  "Clothing",
  "Accessories",
  "Art",
  "Other",
] as const

export const CURRENCIES = ["THB", "USD", "EUR"] as const
