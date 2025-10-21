import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { generateCataloguePDF } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 })
    }

    // Fetch selected products
    const products = await Product.find({ _id: { $in: productIds } }).sort({ featured: -1, createdAt: -1 })

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generateCataloguePDF(products)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="thai-tribal-crafts-catalogue.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating catalogue:", error)
    return NextResponse.json({ error: "Failed to generate catalogue" }, { status: 500 })
  }
}
