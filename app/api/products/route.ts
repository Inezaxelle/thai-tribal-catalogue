import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const tribe = searchParams.get("tribe")
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    const filter: any = {}
    if (tribe && tribe !== "all") filter.tribe = tribe
    if (category && category !== "all") filter.category = category
    if (featured === "true") filter.featured = true

    const products = await Product.find(filter).sort({ createdAt: -1 })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.tribe || !body.category || !body.story) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!body.materials || body.materials.length === 0) {
      return NextResponse.json({ error: "At least one material is required" }, { status: 400 })
    }

    if (!body.images || body.images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    const product = await Product.create(body)

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
