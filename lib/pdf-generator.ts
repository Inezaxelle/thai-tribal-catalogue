import type { IProduct } from "@/models/Product"

interface PDFHelpers {
  doc: any
  colors: {
    primary: number[]
    secondary: number[]
    accent: number[]
    text: number[]
    muted: number[]
    background: number[]
  }
  pageWidth: number
  pageHeight: number
  margin: number
}

// Reusable component: Page header with title and page number
function addPageHeader(helpers: PDFHelpers, title: string, pageNumber: number) {
  const { doc, colors, pageWidth, margin } = helpers

  // Left: Brand name
  doc.setFontSize(8)
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
  doc.setFont("times", "normal")
  doc.text("Thai Tribal Crafts | 2025", margin, 10)

  // Center: Section title
  doc.setFontSize(10)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont("times", "bold")
  doc.text(title, pageWidth / 2, 10, { align: "center" })

  // Right: Page number
  doc.setFontSize(8)
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
  doc.setFont("times", "normal")
  doc.text(pageNumber.toString(), pageWidth - margin, 10, { align: "right" })

  // Subtle line below header
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2])
  doc.setLineWidth(0.1)
  doc.line(margin, 12, pageWidth - margin, 12)
}

// Reusable component: Product card with alternating layout
async function addProductCard(
  helpers: PDFHelpers,
  product: IProduct,
  x: number,
  y: number,
  width: number,
  height: number,
  imageOnLeft: boolean,
) {
  const { doc, colors } = helpers

  // Card background with subtle border
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.setLineWidth(0.3)
  doc.rect(x, y, width, height, "FD")

  const imageSize = height - 4
  const imageX = imageOnLeft ? x + 2 : x + width - imageSize - 2
  const imageY = y + 2

  // Load and display product image
  await addProductImage(helpers, product, imageX, imageY, imageSize, imageSize)

  // Content area (opposite side of image)
  const contentX = imageOnLeft ? imageX + imageSize + 4 : x + 2
  const contentWidth = width - imageSize - 8
  let contentY = y + 6

  // Product name (serif, bold)
  doc.setFontSize(11)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont("times", "bold")
  const nameLines = doc.splitTextToSize(product.name.toUpperCase(), contentWidth)
  doc.text(nameLines, contentX, contentY)
  contentY += nameLines.length * 4 + 2

  // Subtitle: Tribe name
  doc.setFontSize(8)
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
  doc.setFont("times", "italic")
  doc.text(product.tribe, contentX, contentY)
  contentY += 4

  // Divider line
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.setLineWidth(0.1)
  doc.line(contentX, contentY, contentX + contentWidth, contentY)
  contentY += 3

  // Materials section
  doc.setFontSize(7)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont("helvetica", "bold")
  doc.text("MATERIALS:", contentX, contentY)
  contentY += 3

  doc.setFont("helvetica", "normal")
  const materialsText = product.materials.slice(0, 3).join(", ").toUpperCase()
  const materialLines = doc.splitTextToSize(materialsText, contentWidth)
  doc.text(materialLines, contentX, contentY)
  contentY += materialLines.length * 2.5 + 2

  // Notes section (story preview)
  doc.setFont("helvetica", "bold")
  doc.text("NOTES:", contentX, contentY)
  contentY += 3

  doc.setFont("helvetica", "normal")
  const storyPreview = product.story.length > 100 ? product.story.substring(0, 100) + "..." : product.story
  const storyLines = doc.splitTextToSize(storyPreview, contentWidth)
  doc.text(storyLines.slice(0, 3), contentX, contentY) // Max 3 lines
  contentY += 3 * 2.5 + 2

  // Sizes & Retail Price section at bottom
  const bottomY = y + height - 6
  const dimensions = product.dimensions

  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("SIZES & RETAIL PRICE", contentX, bottomY - 6)

  doc.setFontSize(8)
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
  doc.setFont("helvetica", "normal")
  const sizeText = dimensions
    ? `${dimensions.length}×${dimensions.width}×${dimensions.height} ${dimensions.unit}`
    : "Standard"
  doc.text(`Size: ${sizeText}`, contentX, bottomY - 2)

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(`${product.price.currency} ${product.price.amount.toLocaleString()}`, contentX, bottomY + 2)

  // Stock indicator
  if (product.stockQuantity > 0) {
    doc.setFontSize(6)
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    doc.setFont("helvetica", "normal")
    const stockX = imageOnLeft ? x + width - 2 : imageX - 2
    doc.text(`In Stock: ${product.stockQuantity}`, stockX, bottomY + 2, { align: "right" })
  }
}

// Helper: Load and display product image
async function addProductImage(
  helpers: PDFHelpers,
  product: IProduct,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const { doc, colors } = helpers

  try {
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imageUrl = product.imageUrls[0]
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })

      const format = imageUrl.toLowerCase().includes(".png") ? "PNG" : "JPEG"
      doc.addImage(base64, format, x, y, width, height, undefined, "FAST")
    } else {
      throw new Error("No image available")
    }
  } catch (error) {
    // Placeholder for missing images
    doc.setFillColor(245, 242, 238)
    doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2])
    doc.setLineWidth(0.2)
    doc.rect(x, y, width, height, "FD")

    doc.setFontSize(7)
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
    doc.setFont("helvetica", "normal")
    doc.text("Image", x + width / 2, y + height / 2 - 2, { align: "center" })
    doc.text("Unavailable", x + width / 2, y + height / 2 + 2, { align: "center" })
  }
}

export async function generateCataloguePDF(products: IProduct[]): Promise<Buffer> {
  const { jsPDF } = await import("jspdf")

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const colors = {
        primary: [74, 52, 40], // Rich brown for headings
        secondary: [139, 90, 60], // Clay red for accents
        accent: [196, 165, 116], // Warm amber for borders
        text: [60, 60, 60], // Dark gray for body text
        muted: [140, 123, 107], // Muted brown for secondary text
        background: [252, 250, 247], // Warm off-white
      }

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15

      const helpers: PDFHelpers = {
        doc,
        colors,
        pageWidth,
        pageHeight,
        margin,
      }

      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      doc.setFontSize(36)
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      doc.setFont("times", "bold")
      doc.text("THAI TRIBAL CRAFTS", pageWidth / 2, 100, { align: "center" })

      doc.setFontSize(14)
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
      doc.setFont("times", "italic")
      doc.text("Handcrafted Heritage Collection", pageWidth / 2, 115, { align: "center" })

      // Decorative lines
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2])
      doc.setLineWidth(0.5)
      doc.line(50, 125, pageWidth - 50, 125)
      doc.line(50, 127, pageWidth - 50, 127)

      doc.setFontSize(9)
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
      doc.setFont("helvetica", "normal")
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
      doc.text(dateStr, pageWidth / 2, 140, { align: "center" })

      const productsPerPage = 2
      let pageNumber = 1

      for (let i = 0; i < products.length; i += productsPerPage) {
        doc.addPage()
        doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
        doc.rect(0, 0, pageWidth, pageHeight, "F")

        addPageHeader(helpers, "PRODUCT COLLECTION", pageNumber)
        pageNumber++

        const startY = 20
        const cardHeight = (pageHeight - startY - margin - 10) / productsPerPage
        const cardWidth = pageWidth - 2 * margin

        // Add up to 2 products on this page with alternating layouts
        for (let j = 0; j < productsPerPage && i + j < products.length; j++) {
          const product = products[i + j]
          const cardY = startY + j * cardHeight
          const imageOnLeft = j % 2 === 0 // Alternate: first product image on left, second on right

          await addProductCard(helpers, product, margin, cardY, cardWidth, cardHeight - 5, imageOnLeft)
        }
      }

      doc.addPage()
      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2])
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      doc.setFontSize(28)
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      doc.setFont("times", "bold")
      doc.text("THANK YOU", pageWidth / 2, pageHeight / 2 - 20, { align: "center" })

      doc.setFontSize(10)
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2])
      doc.setFont("times", "normal")
      const thankYouText = "For supporting traditional craftsmanship and cultural preservation"
      doc.text(thankYouText, pageWidth / 2, pageHeight / 2, { align: "center" })

      doc.setFontSize(8)
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2])
      doc.text("Thai Tribal Craft Catalogue", pageWidth / 2, pageHeight / 2 + 15, { align: "center" })

      const pdfOutput = doc.output("arraybuffer")
      resolve(Buffer.from(pdfOutput))
    } catch (error) {
      reject(error)
    }
  })
}
